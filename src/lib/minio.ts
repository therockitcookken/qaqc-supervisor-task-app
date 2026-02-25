import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
const client = new S3Client({
  region: process.env.MINIO_REGION,
  endpoint: process.env.MINIO_ENDPOINT,
  forcePathStyle: true,
  credentials: { accessKeyId: process.env.MINIO_ACCESS_KEY || "", secretAccessKey: process.env.MINIO_SECRET_KEY || "" }
});
export const signUpload = (key: string) => getSignedUrl(client, new PutObjectCommand({ Bucket: process.env.MINIO_BUCKET, Key: key }), { expiresIn: 300 });
export const signDownload = (key: string) => getSignedUrl(client, new GetObjectCommand({ Bucket: process.env.MINIO_BUCKET, Key: key }), { expiresIn: 300 });
