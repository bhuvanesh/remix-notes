// Import necessary hooks and components from Remix and React
import { useLoaderData, useActionData, Form, json, redirect, Link, useNavigation } from "@remix-run/react";
import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { CheckCircleIcon, XCircleIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/solid';
import { uploadFileToS3, listContentsOfBucket } from "../utils/s3-utils";
import { getAuth } from "@clerk/remix/ssr.server";
import db from "../utils/cdb.server";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"

// Set the workerSrc for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

// Loader function to list contents of the bucket
export const loader = async (args) => {
  const { sessionClaims } = await getAuth(args);

  // If the user does not have the admin role, redirect them to the home page
  if (sessionClaims?.metadata.role !== "admin") {
      return redirect("/");
    console.log(sessionClaims?.metadata.role);
    
  }
  const [projectName, projectid, userId] = args.params.id.split('-');
  console.log('userId', userId);

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
    dl.doc_name,
    dl.id,
    f.status_code
  FROM
  ${process.env.FILES_TABLE} f
  JOIN
  ${process.env.DOC_LIST_TABLE} dl ON f.document_code = dl.id
  WHERE
    f.is_latest = true
    AND f.project_code = $1
    AND f.client_code = $2;
`, [projectid, userId]);

    // Format the main query results to match the desired structure
    formattedDocuments = resFiles.rows.map(doc => ({
      name: doc.doc_name,
      url: doc.file_path,
      key: doc.id,
      statusCode: doc.status_code
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
  const userId = formData.get('userId');
  const projectId = formData.get('projectId');
  const documentId = formData.get('documentId');
  const fileUrl = formData.get('fileUrl');
  const action = formData.get('action');

  try {
    const client = await db.connect();

    // Initialize statusCode as null for the 'return' action
    let statusCode = null; // Default to null for 'return' action
    if (action === 'approve') {
      statusCode = true; // Set to true for 'approve'
    } else if (action === 'reject') {
      statusCode = false; // Set to false for 'reject'
    }

    await client.query(`
      UPDATE public.files
      SET status_code = $1, updated_at = NOW()
      WHERE client_code = $2 AND project_code = $3 AND document_code = $4 AND file_path = $5;
    `, [statusCode, userId, projectId, documentId, fileUrl]);

    client.release();

    // Return success message based on the action
    if (action === 'approve') {
      return json({ success: "File approved successfully." });
    } else if (action === 'reject') {
      return json({ success: "File rejected successfully." });
    } else if (action === 'return') {
      return json({ success: "Undo changes successfully." });
    }
  } catch (err) {
    console.error('Error updating file status', err);
    // Handle the error appropriately (e.g., show an error message)
    return json({ error: "An error occurred while updating the file status." });
  }
}

export default function Upload() {
  const contents = useLoaderData();
  const actionData = useActionData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState('');
  const [numPages, setNumPages] = useState(null);
  const { userId, projectid, projectName, documents } = useLoaderData();

  useEffect(() => {
    if (actionData) {
      if (actionData.error) {
        toast.error(actionData.error);
      } else if (actionData.success) {
        toast.success(actionData.success); 
      }
    }
  }, [actionData]);


  const transition = useNavigation();

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const handlePdfClick = (fileUrl) => {
    setCurrentPdfUrl(fileUrl);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 to-blue-500 flex flex-col justify-center items-center">
      {/* Breadcrumb navigation */}
      <div className="self-start absolute top-0 left-0 p-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink>
                <Link to={`/clients`} className="text-white hover:text-gray-300">
                  Clients
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white" />
            <BreadcrumbItem>
              <BreadcrumbLink>
                <Link to={`/clients/${userId}`} className="text-white hover:text-gray-300">
                  Projects
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white" />
            <BreadcrumbItem>
              <BreadcrumbPage>File Upload</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {/* Upload Summary button */}
      <div className="absolute top-0 right-0 p-4">
        <Link to={`/clients/projects/table/${userId}-${projectid}`} className="bg-white text-purple-600 font-bold rounded px-4 py-2 hover:bg-gray-300">
          Upload Summary
        </Link>
      </div>
      <div className="text-center mb-8">
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
  
      <div className="text-center w-3/5 mx-auto">
        {/* <h2 className="text-lg text-white mb-4">Bucket Contents:</h2> */}
        <div className="inline-block w-full overflow-hidden align-middle bg-white shadow-md rounded-lg max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-sm leading-4 font-bold text-gray-600 uppercase tracking-wider sticky top-0">
                  File Name
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-sm leading-4 font-bold text-gray-600 uppercase tracking-wider sticky top-0 min-w-[150px]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {contents?.Contents && contents.Contents.length > 0 ? (
                contents.Contents.map((file, index) => (
                  <tr key={index}>
<td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 flex justify-start">
  <button
    onClick={() => handlePdfClick(file.url)}
    className="text-blue-600 hover:text-blue-800 visited:text-purple-600 text-left"
  >
    {file.name}
  </button>
</td>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                      <div className="flex justify-center">
                        <Form method="post">
                          <input type="hidden" name="userId" value={userId} />
                          <input type="hidden" name="projectId" value={projectid} />
                          <input type="hidden" name="documentId" value={file.key} />
                          <input type="hidden" name="fileUrl" value={file.url} />
                          <button
                            type="submit"
                            name="action"
                            value="approve"
                            className={`mr-2 ${
                              file.statusCode === true ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={file.statusCode === true}
                          >
                            <CheckCircleIcon
                              className={`h-6 w-6 ${
                                file.statusCode === true ? 'text-gray-400' : 'text-green-500'
                              }`}
                            />
                          </button>
                          <button
                            type="submit"
                            name="action"
                            value="reject"
                            className={`mr-2 ${
                              file.statusCode === false ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={file.statusCode === false}
                          >
                            <XCircleIcon
                              className={`h-6 w-6 ${
                                file.statusCode === false ? 'text-gray-400' : 'text-red-500'
                              }`}
                            />
                          </button>
                          <button type="submit" name="action" value="return">
                            <ArrowUturnLeftIcon className="h-6 w-6 text-blue-500" />
                          </button>
                        </Form>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200" colSpan="2">
                    No files found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}