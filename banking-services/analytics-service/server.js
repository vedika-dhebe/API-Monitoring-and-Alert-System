const express = require("express");

const app = express();

app.use(express.json());

app.post("/process", async (req, res) => {

  const delay = 500 + Math.random() * 2000;

  await new Promise(r => setTimeout(r, delay));

  res.json({
    success: true,
    processingTime: delay
  });
});

app.get("/health", (req, res) => {
  res.json({
    service: "analytics-service",
    status: "UP"
  });
});

app.listen(3010, () => {
  console.log("analytics-service running on 3010");
});