require("dotenv").config();
const express = require("express");
const axios = require("axios");
const nodemailer = require("nodemailer");
const { marked } = require("marked");
const cors = require("cors");
const PDFDocument = require("pdfkit");

const app = express();
app.use(express.json());
app.use(cors());

const PROMETHEUS_URL = "http://prometheus:9090";  // Docker service name
const LOKI_URL = "http://loki:3100";              // Docker service name

const activeIncidents = new Set();
const activeIncidentData = [];

/* ===============================
   1️⃣ MANUAL RCA (Optional)
================================ */
app.get("/rca", async (req, res) => {
  const service = req.query.service;
  if (!service) return res.status(400).json({ error: "Provide ?service=" });

  const report = await generateRCA(service);
  res.json(report);
});

async function getLogs(service) {
  try {
    const query = `{service="${service}"}`; // adjust label if needed

    const res = await axios.get(`${LOKI_URL}/loki/api/v1/query_range`, {
      params: {
        query,
        limit: 20,
        direction: "backward"
      }
    });

    const streams = res.data.data.result;

    let logs = [];

    streams.forEach(stream => {
      stream.values.forEach(v => {
        logs.push(v[1]);
      });
    });

    return logs.slice(0, 10).join("\n"); // top 10 logs
  } catch (err) {
    console.error("Log fetch error:", err.message);
    return "No logs available";
  }
}

async function getTraces(service) {

  try {

    const res = await axios.get(
      `http://tempo:3200/api/search`,
      {
        params: {
          tags: `service.name=${service}`,
          limit: 5
        }
      }
    );

    const traces = res.data.traces || [];

    return traces.map(t => ({
      traceID: t.traceID,
      durationMs: t.durationMs,
      rootServiceName: t.rootServiceName
    }));

  } catch (err) {

    console.error("Trace fetch error:", err.message);

    return [];
  }
}

/* ===============================
   2️⃣ ALERTMANAGER WEBHOOK
================================ */
app.post("/alert", async (req, res) => {
  try {
    const alerts = req.body.alerts || [];

    for (const alert of alerts) {

      const labels = alert.labels || {};

      const service =
        labels.exported_job ||
        labels.service_name ||
        labels.job;

      if (!service) continue;

      /* 🔴 ALERT RESOLVED */
      if (alert.status === "resolved") {
        activeIncidents.delete(service);
        console.log(`✅ Incident resolved for ${service}`);
        continue;
      }

      /* 🔥 ALERT FIRING */
      if (alert.status === "firing") {

        // if (activeIncidents.has(service)) continue;

        // activeIncidents.add(service);

        const alertType = alert.labels.alertname || "unknown";
        const incidentKey = `${service}-${alertType}`;

        if (activeIncidents.has(incidentKey)) continue;

        activeIncidents.add(incidentKey);

        const report = await generateRCA(service);

        const severity = calculateSeverity(
          report.metrics.latencyP95,
          report.metrics.errorRate
        );

        activeIncidentData.push({
          service,
          severity,
          report,
          time: new Date().toISOString()
        });

        if (activeIncidentData.length > 50) {
          activeIncidentData.shift();
        }

        console.log("🚨 INCIDENT REPORT");
        console.log(JSON.stringify(report, null, 2));

        await sendToSlack(report);
        await sendEmail(report);
      }
    }

    res.status(200).send("Alert processed");

  } catch (err) {
    console.error("Webhook error:", err.message);
    res.status(500).send("Error");
  }
});

/* ===============================
   LLM
================================ */

async function getLLMExplanation(service, errorRate, latency, logs, traces) {
  try {
    const response = await axios.post("http://host.docker.internal:11434/api/generate", {
      model: "gemma3:1b",
      prompt: `
You are a senior Site Reliability Engineer performing production-grade RCA.

Service: ${service}

Metrics:
- Error Rate: ${errorRate}
- Latency P95: ${latency}

Recent Logs:
${logs}

Recent Traces:
${JSON.stringify(traces, null, 2)}

Tasks:
1. Write the problem name (It should be short not long explaination, just a name.).
2. Explain what happened
3. Identify MOST LIKELY root cause
4. Explain why it happened
5. Give TOP 5 fixes: (Rank fixes as:
   - Critical
   - High
   - Moderate
   - Low)
6. Give confidence %
7. Write a short summary in bullet point wise manner so engineer can just read it if there's no time to read huge explaination above.

Rules:
- Use traces + metrics + logs together
- Avoid generic answers
- Prioritize realistic infrastructure causes
- Keep concise 
- Do not ask for more data
- Do not say any thing else less or more other than the mentioned tasks. Not even a single word extra, like not inven intro or outro.
- remember this has no separate database it purely runs on local storage but that should not be mentioned in message but also should be considered while generating the analysis.

`


,
      stream: false
    });

    return response.data.response;
  } catch (err) {
    console.error("LLM error:", err.message);
    return "LLM analysis unavailable";
  }
}



/* ===============================
   RCA LOGIC
================================ */

async function generateRCA(service) {
  const [errorRate, latency] = await Promise.all([
    getErrorRate(service),
    getLatency(service)
  ]);

  const [logs, traces] = await Promise.all([
    getLogs(service),
    getTraces(service)
  ]);

  // let rootCause = "No anomaly detected";
  // let confidence = "LOW";

  // if (latency > 800 && errorRate > 0) {
  //   rootCause = "High latency + 5xx errors";
  //   confidence = "VERY HIGH";
  // } else if (latency > 800) {
  //   rootCause = "High P95 latency";
  //   confidence = "HIGH";
  // } else if (errorRate > 0) {
  //   rootCause = "5xx error spike";
  //   confidence = "HIGH";
  // }

  const aiAnalysis = await getLLMExplanation(
    service,
    errorRate,
    latency,
    logs,
    traces
  );

return {
  service,
  metrics: {
    errorRate,
    latencyP95: latency
  },
  aiAnalysis,
  timestamp: new Date().toISOString()
};
}

/* ===============================
   PROMETHEUS QUERIES
================================ */

async function getErrorRate(service) {
  const query = `
    (
      sum(rate(bank_http_client_duration_milliseconds_count{
        exported_job="${service}",
        http_status_code=~"5.."
      }[5m])) or vector(0)
    )
    /
    sum(rate(bank_http_client_duration_milliseconds_count{
      exported_job="${service}"
    }[5m]))
  `;

  const res = await axios.get(
    `${PROMETHEUS_URL}/api/v1/query`,
    { params: { query } }
  );

  return parseFloat(res.data.data.result[0]?.value[1] || 0);
}

async function getLatency(service) {
  const query = `
    histogram_quantile(0.95,
      sum by (le) (
        rate(bank_http_client_duration_milliseconds_bucket{
          exported_job="${service}"
        }[5m])
      )
    )
  `;

  const res = await axios.get(
    `${PROMETHEUS_URL}/api/v1/query`,
    { params: { query } }
  );

  return parseFloat(res.data.data.result[0]?.value[1] || 0);
}

async function sendToSlack(report) {
  try {
    await axios.post(process.env.SLACK_WEBHOOK_URL, {
      text: `🚨 *INCIDENT DETECTED*\n
*Service:* ${report.service}

*AI Analysis:* 
${report.aiAnalysis}

*Latency P95:* ${report.metrics.latencyP95.toFixed(2)} ms
*Error Rate:* ${(report.metrics.errorRate * 100).toFixed(2)}%

*Time:* ${report.timestamp}`
    });
  } catch (err) {
    console.error("Slack error:", err.message);
  }
}


async function sendEmail(report) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const formattedAnalysis = marked(report.aiAnalysis);
    
    await transporter.sendMail({
      from: `"RCA Monitor" <${process.env.EMAIL_USER}>`,
      to: process.env.ALERT_EMAIL,
      subject: `🚨 INCIDENT: ${report.service}`,
      html: `
        <h2>Incident Report</h2>

        <p><b>Service:</b> ${report.service}</p>

        <p><b>AI Analysis:</b></p>
        <div>${formattedAnalysis}</div>

        <p><b>Latency P95:</b> ${report.metrics.latencyP95.toFixed(2)} ms</p>
        <p><b>Error Rate:</b> ${(report.metrics.errorRate * 100).toFixed(2)}%</p>

        <p><b>Time:</b> ${report.timestamp}</p>
      `
    });

  } catch (err) {
    console.error("Email error:", err.message);
  }
}

function calculateSeverity(latency, errorRate) {

  if (latency > 1800 || errorRate > 0.30)
    return "Critical";

  if (latency > 1000 || errorRate > 0.15)
    return "High";

  if (latency > 500 || errorRate > 0.05)
    return "Moderate";

  return "Low";
}

app.get("/incidents", (req, res) => {
  res.json(activeIncidentData.slice(-20).reverse());
});

app.get("/download-rca", async (req, res) => {

  try {

    const service = req.query.service;

    if (!service) {
      return res.status(400).send("Service required");
    }

    const incident = activeIncidentData.find(
      i => i.service === service
    );

    if (!incident) {
      return res.status(404).send("Incident not found");
    }

    const doc = new PDFDocument();

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${service}-RCA.pdf`
    );

    doc.pipe(res);

    doc.fontSize(22)
      .text("AI Incident RCA Report", {
        align: "center"
      });

    doc.moveDown();

    doc.fontSize(16)
      .text(`Service: ${incident.service}`);

    doc.text(`Severity: ${incident.severity}`);

    doc.text(`Timestamp: ${incident.time}`);

    doc.moveDown();

    doc.fontSize(18)
      .text("AI Root Cause Analysis");

    doc.moveDown();

    doc.fontSize(12)
      .text(incident.report.aiAnalysis, {
        lineGap: 5
      });

    doc.end();

  } catch (err) {

    console.error(err);

    res.status(500).send("Failed to generate PDF");

  }
});

app.listen(4000, () =>
  console.log("RCA Service running on port 4000")
);
