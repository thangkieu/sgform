// This example uses Express to receive webhooks
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const { logger } = require("./lib/log");
const express = require("express");
const { sendToS3 } = require("./aws-s3");

const app = express();
app.use(express.json());

// Instantiating formsg-sdk without parameters default to using the package's
// production public signing key.
const formsg = require("@opengovsg/formsg-sdk")();

// This is where your domain is hosted, and should match
// the URI supplied to FormSG in the form dashboard
const POST_URI = process.env.POST_URI;

// Your form's secret key downloaded from FormSG upon form creation
const formSecretKey = process.env.FORM_SECRET_KEY;

// Set to true if you need to download and decrypt attachments from submissions
const HAS_ATTACHMENTS = false;

app.post(
  "/submissions",
  async function (req, res, next) {
    try {
      formsg.webhooks.authenticate(req.get("X-FormSG-Signature"), POST_URI);
      return next();
    } catch (e) {
      logger(`Authenticate Error:: \`${e.message}\``);

      return res.status(401).send({ message: "Unauthorized" });
    }
  },
  // Decrypt the submission
  async function (req, res, next) {
    try {
      // If `verifiedContent` is provided in `req.body.data`, the return object
      // will include a verified key.
      const submission = HAS_ATTACHMENTS
        ? await formsg.crypto.decryptWithAttachments(
            formSecretKey,
            req.body.data
          )
        : formsg.crypto.decrypt(formSecretKey, req.body.data);

      // If the decryption failed, submission will be `null`.
      // submission schema: DecryptedContent | DecryptedContentAndAttachments | null
      // check types.d.ts
      if (submission) {
        // Continue processing the submission
        sendToS3(`submission.json`, JSON.stringify(submission));
      }
    } catch (e) {}
  }
);

const port = process.env.PORT || "3000";
app.listen(port, () => console.log(`Running on port ${port}`));
