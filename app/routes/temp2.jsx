import { useLoaderData, useActionData, Form, json, redirect } from "@remix-run/react";
import { uploadFileToS3, listContentsOfBucket } from "../utils/s3-utils";

export const loader = async () => {
  try {
    const contents = await listContentsOfBucket();
    return json({ Contents: contents }); // Ensure data is structured correctly
  } catch (error) {
    console.error(error);
    return json({ error: error.message });
  }
};

export const action = async ({ request }) => {
  const formData = await request.formData();
  const file = formData.get("file");

  if (file && file.size > 0) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await uploadFileToS3(buffer, file.name);
      return redirect('/'); // Ensure this is a correct path for refreshing
    } catch (error) {
      return { error: error.message };
    }
  } else {
    return { error: "No file uploaded." };
  }
};

export default function Upload() {
  const contents = useLoaderData();
  const actionData = useActionData();

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 to-blue-500 flex justify-center items-center">
      <div className="text-center">
        <Form method="post" encType="multipart/form-data" className="mb-8">
          <input type="file" name="file" className="mb-4"/>
          <button type="submit" className="bg-purple-700 text-white py-2 px-4 rounded hover:bg-purple-800 transition ease-in-out duration-150">Upload</button>
        </Form>
        {actionData && <p className="text-white">{actionData.error ? actionData.error : "File uploaded successfully. Refreshing..."}</p>}
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
                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 visited:text-purple-600">{file.name}</a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">No files found.</td>
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
