import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { S3Client } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { promisify } from "util";
const randomBytes = promisify(crypto.randomBytes);

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
});

// Create an instance of Express
const app = express();
app.use(cors());
app.use(bodyParser.json());

const bucketName = process.env.AWS_BUCKET_NAME;

app.get("/check", (req, res) => {
  res.send("hello world");
});

// Define a route
app.post("/s3", async (req, res) => {
  const { contentType } = req.body;

  const rawBytes = await randomBytes(16);
  const fileName = rawBytes.toString("hex");

  const data = await createPresignedPost(s3Client, {
    Bucket: bucketName,
    Key: "public/" + fileName,
    Conditions: [
      ["content-length-range", 0, 10485760],
      ["starts-with", "$Content-Type", contentType],
    ],
    Expires: 60000,
  });

  res.json(data);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
