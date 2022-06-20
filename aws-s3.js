const { logger } = require("./lib/log");

const {
  S3,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
} = require("@aws-sdk/client-s3");

const clientS3 = new S3({
  region: process.env.AWS_REGION || "ap-southeast-1",
});

async function sendToS3(filename, fileContent, foldername = "formsg") {
  const now = new Date();
  const nowStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;

  // async/await.
  try {
    const data = await clientS3.send(
      new CreateMultipartUploadCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${foldername}/${nowStr}-${filename}`,
      })
    );

    const upload = await clientS3.send(
      new UploadPartCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        UploadId: data.UploadId,
        Key: data.Key,
        Body: fileContent,
        PartNumber: 1,
      })
    );

    const complete = await clientS3.send(
      new CompleteMultipartUploadCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        UploadId: data.UploadId,
        Key: data.Key,
        MultipartUpload: {
          Parts: [{ ETag: upload.ETag, PartNumber: 1 }],
        },
      })
    );

    logger("Uploaded to Bucket:", complete.Bucket);
    logger("Location:", complete.Location);
    // process data.
  } catch (error) {
    // error handling.
    logger("`Send To S3 error::`", error);
  }
}

module.exports.sendToS3 = sendToS3;
