// Import necessary hooks and components from Remix and React
import { useLoaderData, useActionData, Form, json, redirect,Link,useNavigation } from "@remix-run/react";
import { useState,useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { uploadFileToS3, listContentsOfBucket } from "../utils/s3-utils";
import { getAuth } from "@clerk/remix/ssr.server";
import db from "./../utils/cdb.server";
import { toast } from "sonner";
import {Button} from "../components/ui/button";
import { Loader2 } from "lucide-react";





// Set the workerSrc for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

// Loader function to list contents of the bucket
export const loader = async (args) => {
  // Check for user authentication
  const { userId } = await getAuth(args);
  const [projectName, projectid] = args.params.id.split('-');
  if (!userId) {
    return redirect("/sign-in");
  }

  let documents = [];
  let formattedDocuments = [];
  try {
    const client = await db.connect();
    // Execute the additional SQL query to get the document names and ids
    const resDocs = await client.query('SELECT id, doc_name FROM documents');
    documents = resDocs.rows;

    // Execute the main SQL query to get the required document details
    const resFiles = await client.query(`
      SELECT
        f.file_path,
        f.document_code,
        d.doc_name,
        d.id
      FROM
        public.files f
      JOIN
        public.documents d ON f.document_code = d.id
      WHERE
        f.is_latest = true
        AND f.project_code = $1
        AND f.client_code = $2;
    `, [projectid, userId]);

    // Format the main query results to match the desired structure
    formattedDocuments = resFiles.rows.map(doc => ({
      name: doc.doc_name,
      url: doc.file_path,
      key: doc.id
    }));
    client.release();
  } catch (err) {
    console.error('Error fetching documents', err);
    documents = [];
    formattedDocuments = [];
  }

  // Return the formatted documents in the response
  return json({
    userId,
    Contents: formattedDocuments,
    projectid,
    projectName,
    documents
  });
};

export async function action({ request }) {
  const formData = await request.formData();
  const userId = formData.get("userId");
  const documentId = formData.get("documentId");
  const projectid = formData.get("projectid");
  const { _action } = Object.fromEntries(formData);

  if (!userId) {
    return json({ error: "User ID is missing." });
  }

  if (_action === "upload") {
    const file = formData.get("file");
    if (file && file.type !== "application/pdf") {
      return json({ error: "Please upload only PDF files." });
    }
    if (file && file.size > 0) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const filePath = `${userId}/${file.name}`;
        const objectUrl = await uploadFileToS3(buffer, filePath);

        const client = await db.connect();

        // Check for existing entry with is_latest = true
        const existingFilesRes = await client.query(`
          SELECT id FROM files
          WHERE project_code = $1 AND client_code = $2 AND document_code = $3 AND is_latest = true
        `, [projectid, userId, documentId]);

        // If an existing entry is found, set is_latest to false
        if (existingFilesRes.rows.length > 0) {
          await client.query(`
            UPDATE files
            SET is_latest = false
            WHERE id = $1
          `, [existingFilesRes.rows[0].id]);
        }

        // Insert the new file details into the database
        await client.query(`
          INSERT INTO files (client_code, project_code, document_code, status_code, file_path, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        `, [userId, projectid, documentId, 1, objectUrl]);

        client.release();
return json({ success: "File uploaded successfully." });
       
      } catch (error) {
        console.error(error);
        return json({ error: error.message });
      }
    } else {
      return json({ error: "No file uploaded." });
    }
  }

}


export default function Upload() {
  const contents = useLoaderData();
  const actionData = useActionData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState('');
  const [numPages, setNumPages] = useState(null);
  const { userId, projectid,projectName,documents } = useLoaderData();
  const [fileInputValue, setFileInputValue] = useState('');

  const transition = useNavigation();

  

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const handlePdfClick = (fileUrl) => {
    setCurrentPdfUrl(fileUrl);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (actionData) {
      if (actionData.error) {
        toast.error(actionData.error); // Display error message in a toast
      } else if (actionData.success) {
        toast.success(actionData.success); // Display success message in a toast
        setFileInputValue(''); // Reset the file input value
      }
    }
  }, [actionData]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 to-blue-500 flex flex-col justify-center items-center">
      {/* Back navigation link */}
      <div className="self-start absolute top-0 left-0 p-4">
      <Link to="/" className="text-white hover:text-gray-300 font-bold outline outline-black outline-1 rounded px-2 py-1">
  ← Back to Home
</Link>

      </div>      <div className="text-center mb-8">
        <h1 className="text-3xl text-white">{projectName}</h1>
        <h2 className="text-xl text-white">Project ID: {projectid}</h2>
      </div>
      {/* Modal for PDF preview */}
      {isModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-5 rounded-lg overflow-auto max-h-[90vh] max-w-[90vw]">
      {/* Separate div for the close button with fixed positioning */}
      <div className="absolute top-0 right-0 p-5">
        <button
          onClick={() => setIsModalOpen(false)}
          className="bg-red-500 text-white py-2 px-4 rounded"
        >
          Close
        </button>
      </div>
      {/* PDF Document in its own div to allow for scrolling */}
      <div className="pt-16"> {/* Adjust padding-top as needed */}
        <Document
          file={currentPdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          className="PDFDocument"
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              width={window.innerWidth > 1400 ? 1080 : window.innerWidth - 100}
              renderTextLayer={false}
            />
          ))}
        </Document>
      </div>
    </div>
  </div>
)}

      <div className="text-center">
        <Form method="post" encType="multipart/form-data" className="mb-8">
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="projectid" value={projectid} />
        <select name="documentId" className="mb-4">
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.doc_name}
              </option>
            ))}
          </select>
          <input
        type="file"
        name="file"
        accept="application/pdf"
        className="mb-4"
        value={fileInputValue} 
        onChange={(e) => setFileInputValue(e.target.value)} 
      />
       <Button type="submit" name="_action" value="upload" disabled={transition.state === "submitting"}>
        {transition.state === "submitting" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploadng...
          </>
        ) : (
          "Upload"
        )}
      </Button>
    </Form>
        {actionData && actionData.error && (
          <p className="text-white">
            {actionData.error}
          </p>
        )}
        <div className="mt-8">
          <h2 className="text-lg text-white mb-4">Bucket Contents:</h2>
          <div className="inline-block min-w-full overflow-hidden align-middle bg-white shadow-md rounded-lg">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs leading-4 font-semibold text-gray-600 uppercase tracking-wider">
                    File Name
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {contents?.Contents && contents.Contents.length > 0 ? (
                  contents.Contents.map((file, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                        <button
                          onClick={() => handlePdfClick(file.url)}
                          className="text-blue-600 hover:text-blue-800 visited:text-purple-600"
                        >
                          {file.name}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                      No files found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}