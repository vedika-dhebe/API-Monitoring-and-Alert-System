const express = require("express");

const app = express();

app.use(express.json());

app.post("/check", (req, res) => {

  if (Math.random() < 0.2) {

    return res
      .status(500)
      .json({ error: "Fraud engine timeout" });

  }

  res.json({
    fraudRisk: "LOW"
  });

});

app.get("/health", (req, res) => {
  res.json({
    service: "fraud-service",
    status: "UP"
  });
});

app.listen(3007, () => {
  console.log("fraud-service running on 3007");
});