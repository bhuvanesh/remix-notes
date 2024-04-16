import { useState } from 'react';
import { Form, useActionData } from '@remix-run/react';
import { uploadFileToS3 } from '../utils/s3-utils';

export async function action({ request }) {
  const form = await request.formData();
  const file = form.get('pdf');
  const userId = 'temp'; // Replace with the actual user ID
  const projectId = 'project456'; // Replace with the actual project ID

  console.log('Received file:', file);

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = `${userId}/${projectId}_${file.name}`; // Include projectId in the filename
    const objectUrl = await uploadFileToS3(buffer, filePath);
    console.log('Object URL:', objectUrl);
    return { objectUrl };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { error: 'Failed to upload file' };
  }
}

export default function UploadPDF() {
  const actionData = useActionData();
  const [uploading, setUploading] = useState(false);

  return (
    <div>
      <Form
        method="post"
        encType="multipart/form-data"
        onSubmit={() => {
          setUploading(true);
          console.log('Form submitted');
        }}
      >
        <input type="file" name="pdf" accept=".pdf" />
        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </Form>
      {actionData?.objectUrl && (
        <div>
          <p>Object URL: {actionData.objectUrl}</p>
        </div>
      )}
      {actionData?.error && (
        <div>
          <p>Error: {actionData.error}</p>
        </div>
      )}
    </div>
  );
}