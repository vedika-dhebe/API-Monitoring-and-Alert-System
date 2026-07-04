const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

const FRAUD_URL =
  process.env.FRAUD_SERVICE_URL ||
  "http://fraud-service:3007";

app.post("/apply", async (req, res) => {

  try {

    const fraud = await axios.post(
      `${FRAUD_URL}/check`,
      req.body
    );

    await new Promise(r => setTimeout(r, 500));

    res.json({
      approved: !fraud.data.suspicious,
      fraudScore: fraud.data.fraudScore
    });

  } catch (err) {

    res.status(500).json({
      error: "Loan processing failed"
    });
  }
});

app.get("/health", (req, res) => {
  res.json({
    service: "loan-service",
    status: "UP"
  });
});

app.listen(3008, () => {
  console.log("loan-service running on 3008");
});