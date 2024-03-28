import AWS from 'aws-sdk';

const REGION = process.env.AWS_S3_REGION;
const ACCESS_KEY_ID = process.env.AWS_S3_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.AWS_S3_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

AWS.config.update({
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: SECRET_ACCESS_KEY,
  region: REGION,
});

const s3 = new AWS.S3();

const generatePresignedUrl = async (fileName) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Expires: 60, // URL expiration time in seconds
  };

  try {
    const presignedUrl = await s3.getSignedUrlPromise('putObject', params);
    return presignedUrl;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
};

const uploadFileToS3 = async (file, fileName) => {
  try {
    const presignedUrl = await generatePresignedUrl(fileName);

    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file to S3');
    }

    const objectUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${fileName}`;
    return objectUrl;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};
// Function to list the contents of a user-specific folder in an S3 bucket
const listContentsOfBucket = async (userId) => {
  const params = {
    Bucket: BUCKET_NAME,
    Prefix: `${userId}/`, // Use userId as the folder name
  };

  try {
    const data = await s3.listObjectsV2(params).promise();
    // Filter out the folder itself if it's listed as an object
    const contents = data.Contents.filter(item => item.Key !== `${userId}/`);
    return contents.map(item => {
      const url = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${item.Key}`;
      // Extract the file name from the Key by removing the userId prefix
      const name = item.Key.replace(`${userId}/`, '');
      return { name, url };
    });
  } catch (error) {
    console.error("Error listing bucket contents:", error);
    throw error; // Re-throw the error to handle it in the caller
  }
};

export { uploadFileToS3, listContentsOfBucket };