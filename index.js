// This example uses Express to receive webhooks
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const axios = require("axios");
const express = require("express");
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
  // Endpoint authentication by verifying signatures
  async function (req, res, next) {
    postToSlack("Request Details::", {
      header: { "X-FormSG-Signature": req.get("X-FormSG-Signature") },
      body: req.body,
    });

    try {
      formsg.webhooks.authenticate(req.get("X-FormSG-Signature"), POST_URI);
      // Continue processing the POST body
      return next();
    } catch (e) {
      postToSlack(`Authenticate Error:: \`${e.message}\``);

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
        postToSlack("Submission Data", submission);
      } else {
        // Could not decrypt the submission
        postToSlack("Could not decrypt the submission. I don't know why");
      }
    } catch (e) {
      postToSlack("Could not decrypt the submission");
    }
  }
);

const port = process.env.PORT || "3000";
app.listen(port, () => console.log(`Running on port ${port}`));

function postToSlack(message, body) {
  if (!process.env.SLACK_WEBHOOK) {
    console.log(
      "WARNING:: SLACK_WEBHOOK is missing, please add this environment variable to notify error message to your Slack channel"
    );

    return;
  }

  axios
    .post(process.env.SLACK_WEBHOOK, {
      text: message,
      blocks: [
        {
          type: "section",
          text: { type: "mrkdwn", text: message },
        },
        ...(body
          ? [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: "```" + JSON.stringify(body, null, 2) + "```",
                },
              },
            ]
          : []),
      ],
    })
    .catch(function (error) {
      console.log(error);
    });
}
