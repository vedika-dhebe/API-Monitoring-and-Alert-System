const express = require("express");

const app = express();

app.use(express.json());

app.post("/event", async (req, res) => {

  await new Promise(r => setTimeout(r, 150));

  console.log("AUDIT:", req.body);

  res.json({
    success: true,
    recorded: true
  });
});

app.get("/health", (req, res) => {
  res.json({
    service: "audit-service",
    status: "UP"
  });
});

app.listen(3009, () => {
  console.log("audit-service running on 3009");
});