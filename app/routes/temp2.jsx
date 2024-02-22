import { useLoaderData, useActionData, Form, json, redirect } from "@remix-run/react";
import { uploadFileToS3, listContentsOfBucket } from "../utils/s3-utils";

export const loader = async () => {
  try {
    const contents = await listContentsOfBucket();
    return json({ Contents: contents });
  } catch (error) {
    console.error(error);
    return json({ error: error.message });
  }
};

export const action = async ({ request }) => {
  const formData = await request.formData();
  const { _action} = Object.fromEntries(formData);

  if (_action === "upload") {
    const file = formData.get("file");

    if (file && file.type !== "application/pdf") {
      return json({ error: "Please upload only PDF files." });
    }

    if (file && file.size > 0) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await uploadFileToS3(buffer, file.name);
        return null; // Refresh or navigating to a success page would be ideal
      } catch (error) {
        console.error(error);
        return json({ error: error.message });
      }
    } else {
      return json({ error: "No file uploaded." });
    }
  }

  if (_action === "preview") {
    const fileUrl = formData.get("fileUrl")
    const googleDocsUrl = `https://docs.google.com/viewerng/viewer?url=${encodeURIComponent(fileUrl)}`;
    // window.open(googleDocsUrl, "_blank");
    return redirect(googleDocsUrl) // Open the PDF in a new tab using Google Docs Viewer
  }

  return null
};

export default function Upload() {
  const contents = useLoaderData();
  const actionData = useActionData();

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 to-blue-500 flex justify-center items-center">
      <div className="text-center">
        <Form method="post" encType="multipart/form-data" className="mb-8">
          <input
            type="file"
            name="file"
            accept="application/pdf"
            className="mb-4"
          />
          <button
            type="submit"
            name="_action"
            value="upload"
            className="bg-purple-700 text-white py-2 px-4 rounded hover:bg-purple-800 transition ease-in-out duration-150"
          >
            Upload
          </button>
        </Form>
        {actionData && (
          <p className="text-white">
            {actionData.error
              ? actionData.error
              : "File uploaded successfully."}
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
                        {/* <a href="#" onClick={(e) => handlePdfClick(e, file.url)} className="text-blue-600 hover:text-blue-800 visited:text-purple-600">
                          {file.name}
                        </a> */}
                        <Form method="post" className="inline">
                          <input
                            type="hidden"
                            name="fileUrl"
                            value={file.url}
                          />
                          <button
                            name="_action"
                            value="preview"
                            className="text-blue-600 hover:text-blue-800 visited:text-purple-600"
                          >
                            {file.name}
                          </button>
                        </Form>
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
