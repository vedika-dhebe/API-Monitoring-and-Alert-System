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

function updateHomeStats(incidents){

const services=[
"customer-api-service",
"customer-service",
"account-service",
"transaction-service",
"notification-service",
"fraud-service",
"loan-service",
"audit-service",
"analytics-service",
"report-service"
];

const totalServices=services.length;

const activeAlerts=incidents.length;

const criticalCount=
incidents.filter(i=>i.severity==="Critical").length;

const highCount=
incidents.filter(i=>i.severity==="High").length;

const moderateCount=
incidents.filter(i=>i.severity==="Moderate").length;

const lowCount=
incidents.filter(i=>i.severity==="Low").length;

const failedServices=
[
...new Set(
incidents.map(i=>i.service)
)
].filter(s=>services.includes(s)).length;

const healthyApis=
Math.max(0,totalServices-failedServices);

document.getElementById("services-count").innerText=
totalServices;

document.getElementById("alerts-count").innerText=
activeAlerts;

document.getElementById("critical-count").innerText=
criticalCount;

document.getElementById("system-status").innerText=
failedServices>0?"Warning":"Healthy";

document.getElementById("up-count").innerText=
healthyApis;

document.getElementById("down-count").innerText=
failedServices;

document.getElementById("critical-total").innerText=
criticalCount;

document.getElementById("high-total").innerText=
highCount;

document.getElementById("moderate-total").innerText=
moderateCount;

document.getElementById("low-total").innerText=
lowCount;

const upHeight=(healthyApis/totalServices)*200;
const downHeight=(failedServices/totalServices)*200;

document.getElementById("up-bar").style.height=
`${Math.max(upHeight,20)}px`;

document.getElementById("down-bar").style.height=
`${Math.max(downHeight,20)}px`;

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
          <button
          class="status-btn active"
          onclick="toggleStatus(this)">
            Active
          </button>
        </td>
      </tr>
    `;

    table.innerHTML += row;
  });
}

function toggleStatus(button){

    if(button.innerText==="Active"){

        button.innerText="Resolved";
        button.classList.remove("active");
        button.classList.add("resolved");

    }else{

        button.innerText="Active";
        button.classList.remove("resolved");
        button.classList.add("active");

    }

}

setInterval(loadIncidents, 5000);

loadIncidents();

function downloadRCA(service) {

  window.open(
    `http://localhost:4000/download-rca?service=${service}`,
    "_blank"
  );
}