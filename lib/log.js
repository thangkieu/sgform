const axios = require("axios");

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

module.exports.logger = postToSlack;
