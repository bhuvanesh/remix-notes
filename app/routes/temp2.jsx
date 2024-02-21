import { uploadFileToS3 } from "../utils/s3-utils";
import { useActionData, Form} from "@remix-run/react"; 

export const action = async ({ request }) => {
  const formData = await request.formData();
  const file = formData.get("file");

  if (file && file.size > 0) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const s3Response = await uploadFileToS3(buffer, file.name);
      return s3Response;
    } catch (error) {
      return { error: error.message };
    }
  } else {
    return { error: "No file uploaded." };
  }
};

export default function Upload() {
  const actionData = useActionData();

  return (
    <div className="App">
      <Form method="post" encType="multipart/form-data">
        <input type="file" name="file" />
        <button type="submit">Upload</button>
      </Form>
      <div>
        {actionData && <p>{actionData.error ? actionData.error : "File uploaded successfully."}</p>}
      </div>
    </div>
  );
}