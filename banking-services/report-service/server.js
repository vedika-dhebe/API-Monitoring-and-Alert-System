const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

const ANALYTICS_URL =
  process.env.ANALYTICS_SERVICE_URL ||
  "http://analytics-service:3010";

app.get("/daily-summary", async (req, res) => {

  try {

    const analytics = await axios.post(
      `${ANALYTICS_URL}/process`,
      {}
    );

    await new Promise(r => setTimeout(r, 300));

    res.json({
      reportGenerated: true,
      analytics: analytics.data
    });

  } catch (err) {

    res.status(500).json({
      error: "Report generation failed"
    });
  }
});

app.get("/health", (req, res) => {
  res.json({
    service: "report-service",
    status: "UP"
  });
});

app.listen(3011, () => {
  console.log("report-service running on 3011");
});