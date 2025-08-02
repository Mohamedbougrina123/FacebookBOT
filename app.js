const express = require("express");
const axios = require("axios");
const gtts = require("node-gtts");
const tesseract = require("tesseract");
const app = express();

app.use(express.json());

app.post("/webhook", (req, res) => {
  if (req.body.object === "page") {
    req.body.entry.forEach((entry) => {
      entry.messaging.forEach((msg) => {
        if (msg.message && msg.message.attachments) {
          msg.message.attachments.forEach((attachment) => {
            if (attachment.type === "image") {
              const urlimg = attachment.payload.url;
              axios.get(urlimg, { responseType: "arraybuffer" })
                .then((response) => {
                  const buffer = Buffer.from(response.data, "binary");
                  return tesseract.recongnize(buffer, {
                    lang: "ara",
                  });
                })
                .then((text) => {
                  axios.post("https://graph.facebook.com/v13.0/me/messages?access_token=" + token, {
                    recipient: { id: msg.sender.id },
                    message: { text: `Text Image : ${text}` },
                  });
                })
                .catch((error) => {
                  axios.post("https://graph.facebook.com/v13.0/me/messages?access_token=" + token, {
                    recipient: { id: msg.sender.id },
                    message: { text: `error: ${error}` },
                  });
                });
            }
          });
        }
      });
    });
    res.status(200).send("success");
  } else {
    res.status(404).send("ERROR 404");
  }
});

app.get("/webhook", (req, res) => {
  if (req.query["hub.verify_token"] == "bougrinabot") {
    res.send(req.query["hub.challenge"]);
  } else {
    res.status(403).send("error");
  }
});

app.listen(8080, () => {
  console.log("Join url : http://localhost:8080/webhook");
});
