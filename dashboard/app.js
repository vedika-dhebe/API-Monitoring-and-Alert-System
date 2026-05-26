function showSection(sectionId) {

  const sections = document.querySelectorAll("section");

  sections.forEach(section => {
    section.classList.add("hidden");
  });

  document.getElementById(sectionId)
    .classList.remove("hidden");
}

async function loadIncidents() {

  try {

    const response = await fetch("http://localhost:4000/incidents");

    const incidents = await response.json();

    updateHomeStats(incidents);

    updateIncidentTable(incidents);

  } catch (err) {

    console.error("Dashboard fetch error:", err);

  }
}

function updateHomeStats(incidents) {

  const totalServices = 4;

  const activeAlerts = incidents.length;

  const critical = incidents.filter(
    i => i.severity === "Critical"
  ).length;

  document.getElementById("services-count").innerText =
    totalServices;

  document.getElementById("alerts-count").innerText =
    activeAlerts;

  document.getElementById("critical-count").innerText =
    critical;

  document.getElementById("system-status").innerText =
    activeAlerts > 0 ? "Warning" : "Healthy";

  const criticalCount = incidents.filter(
  i => i.severity === "Critical"
).length;

const highCount = incidents.filter(
  i => i.severity === "High"
).length;

const moderateCount = incidents.filter(
  i => i.severity === "Moderate"
).length;

const lowCount = incidents.filter(
  i => i.severity === "Low"
).length;

const failedApis = incidents.length;
const healthyApis = totalServices - failedApis;

document.getElementById("up-count").innerText =
  healthyApis;

document.getElementById("down-count").innerText =
  failedApis;

document.getElementById("critical-total").innerText =
  criticalCount;

document.getElementById("high-total").innerText =
  highCount;

document.getElementById("moderate-total").innerText =
  moderateCount;

document.getElementById("low-total").innerText =
  lowCount;
}

function updateIncidentTable(incidents) {

  const table = document.getElementById("incident-table");

  if (!table) return;

  table.innerHTML = "";

  incidents.forEach(incident => {

    const row = `
      <tr>
        <td>${incident.service}</td>

        <td>
          ${incident.report.aiAnalysis.slice(0, 80)}...
        </td>

        <td>
          <span class="badge ${incident.severity.toLowerCase()}">
            ${incident.severity}
          </span>
        </td>

        <td>
          <button class="download-btn"
            onclick="downloadRCA('${incident.service}')">
            Download PDF
          </button>
        </td>

        <td>
          <span class="badge moderate">
            Active
          </span>
        </td>
      </tr>
    `;

    table.innerHTML += row;
  });
}

setInterval(loadIncidents, 5000);

loadIncidents();

function downloadRCA(service) {

  window.open(
    `http://localhost:4000/download-rca?service=${service}`,
    "_blank"
  );
}