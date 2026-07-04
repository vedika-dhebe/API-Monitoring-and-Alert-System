const express = require("express");

const app = express();

app.use(express.json());

app.post("/send-email", async (req, res) => {

  await new Promise(r => setTimeout(r, 300));

  console.log("Email sent:", req.body);

  res.json({
    success: true,
    channel: "email"
  });
});

app.post("/send-sms", async (req, res) => {

  await new Promise(r => setTimeout(r, 200));

  res.json({
    success: true,
    channel: "sms"
  });
});

app.get("/health", (req, res) => {
  res.json({
    service: "notification-service",
    status: "UP"
  });
});

app.listen(3006, () => {
  console.log("notification-service running on 3006");
});