async function loadSchedule() {
  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("client_id", client_id)
    .order("scheduled_start", { ascending: true });

  const container = document.getElementById("scheduleList");
  container.innerHTML = "";

  if (error) {
    container.innerHTML = "<p>Error loading schedule.</p>";
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = "<p>No scheduled jobs.</p>";
    return;
  }

  data.forEach(job => {
    const card = document.createElement("div");
    card.className = "schedule-card";

    card.innerHTML = `
      <div class="schedule-title">${job.title}</div>
      <div class="schedule-status">Status: ${job.status}</div>

      <div class="schedule-meta"><strong>Start:</strong> ${job.scheduled_start || "N/A"}</div>
      <div class="schedule-meta"><strong>Duration:</strong> ${job.scheduled_duration || 0} minutes</div>
      <div class="schedule-meta"><strong>Technician:</strong> ${job.technician_id || "Unassigned"}</div>

      <button class="view-btn" onclick="viewJob(${job.id})">View Job</button>
    `;

    container.appendChild(card);
  });
}

function viewJob(job_id) {
  window.location.href = `job.html?job_id=${job_id}`;
}

document.getElementById("scheduleForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");

  const form = new FormData(e.target);

  const newJob = {
    client_id,
    title: form.get("title"),
    description: form.get("description"),
    scheduled_start: form.get("scheduled_start"),
    scheduled_duration: Number(form.get("scheduled_duration")),
    technician_id: form.get("technician_id"),
    status: "scheduled",
    created_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from("jobs")
    .insert(newJob);

  if (error) {
    alert("Failed to schedule job.");
    console.error(error);
    return;
  }

  alert("Job scheduled!");
  loadSchedule();
});

loadSchedule();
