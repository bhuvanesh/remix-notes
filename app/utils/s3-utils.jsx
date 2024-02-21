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

const uploadFileToS3 = (file, fileName) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: file,
  };

  return s3.upload(params).promise();
};

// Function to list the contents of an S3 bucket
const listContentsOfBucket = async () => {
  const params = {
    Bucket: BUCKET_NAME,
  };

  try {
    const data = await s3.listObjectsV2(params).promise();
    return data.Contents.map(item => {
      const url = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${item.Key}`;
      return { name: item.Key, url };
    });
  } catch (error) {
    console.error("Error listing bucket contents:", error);
    throw error; // Re-throw the error to handle it in the caller
  }
};

export { uploadFileToS3, listContentsOfBucket };