import AWS from "aws-sdk";

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

export { uploadFileToS3 };
