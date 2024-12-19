import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: "us-west-2",
  credentials: {
    // accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    // secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    // argbarg
    // TODO: add keys
    accessKeyId: "",
    secretAccessKey: "",
  },
});

export const putToS3 = async (
  bucket: string,
  fileName: string,
  content: string
) => {
  console.log("putting to s3 | bucket:", bucket, "filename:", fileName);
  try {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: fileName,
      Body: content,
    });

    const response = await client.send(command);

    console.log("response from s3", response);
  } catch (e) {
    console.log("error putting to s3", e);
  }
};
