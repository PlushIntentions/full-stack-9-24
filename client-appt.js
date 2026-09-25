async function loadAppointments() {
  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("client_id", client_id)
    .order("scheduled_start", { ascending: true });

  const container = document.getElementById("apptList");
  container.innerHTML = "";

  jobs?.forEach(job => {
    if (!job.scheduled_start) return;

    const card = document.createElement("div");
    card.className = "appt-card";

    card.innerHTML = `
      <div class="appt-title">${job.title}</div>
      <div class="appt-meta">Scheduled: ${job.scheduled_start}</div>
      <div class="appt-meta">Status: ${job.status}</div>
    `;

    container.appendChild(card);
  });

  if (!jobs || jobs.length === 0) {
    container.innerHTML = "<p>No upcoming appointments.</p>";
  }
}

document.getElementById("apptForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");

  const form = new FormData(e.target);

  const service_type = form.get("service_type");
  const date = form.get("date");
  const time = form.get("time");
  const notes = form.get("notes");

  const scheduled_start = new Date(`${date}T${time}`).toISOString();

  const newJob = {
    client_id,
    title: service_type,
    description: notes,
    scheduled_start,
    scheduled_duration: 60,
    status: "scheduled",
    created_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from("jobs")
    .insert(newJob);

  const messageBox = document.getElementById("apptMessage");

  if (error) {
    messageBox.style.color = "red";
    messageBox.textContent = "Failed to schedule appointment.";
    return;
  }

  messageBox.style.color = "green";
  messageBox.textContent = "Appointment scheduled successfully!";

  loadAppointments();
});

loadAppointments();
