async function loadTechDashboard() {
  const params = new URLSearchParams(window.location.search);
  const tech_id = params.get("tech_id");

  // 1️⃣ Load technician profile
  const { data: tech } = await supabase
    .from("technicians")
    .select("*")
    .eq("user_id", tech_id)
    .single();

  document.getElementById("techHeader").innerHTML = `
    <div class="profile-field">
      <label>Name</label>
      <div>${tech.full_name || tech.name}</div>
    </div>
    <div class="profile-field">
      <label>Status</label>
      <div>${tech.status}</div>
    </div>
    <div class="profile-field">
      <label>Availability</label>
      <div>${tech.available ? "Available" : "Unavailable"}</div>
    </div>
  `;

  // 2️⃣ Load today's jobs
  const today = new Date().toISOString().split("T")[0];

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("technician_id", tech_id)
    .gte("scheduled_start", today + "T00:00:00")
    .lte("scheduled_start", today + "T23:59:59")
    .order("scheduled_start", { ascending: true });

  const jobList = document.getElementById("jobList");
  jobList.innerHTML = "";

  jobs?.forEach(job => {
    const card = document.createElement("div");
    card.className = "job-card";

    card.innerHTML = `
      <div class="job-title">${job.title}</div>
      <div class="job-meta">Start: ${job.scheduled_start}</div>
      <div class="job-meta">Status: ${job.status}</div>
      <button class="view-btn" onclick="openJob(${job.id})">Open Job</button>
    `;

    jobList.appendChild(card);
  });

  if (!jobs || jobs.length === 0) {
    jobList.innerHTML = "<p>No jobs scheduled today.</p>";
  }

  // 3️⃣ Earnings
  const { data: earnings } = await supabase
    .from("earnings")
    .select("*")
    .eq("technician_id", tech_id)
    .order("created_at", { ascending: false });

  const earnBox = document.getElementById("earningsBox");
  earnBox.innerHTML = "";

  let total = 0;
  earnings?.forEach(e => total += Number(e.amount));

  earnBox.innerHTML = `
    <div class="earn-card">
      <div class="earn-meta">Total Earnings: $${total.toFixed(2)}</div>
      <div class="earn-meta">Jobs Completed: ${earnings.length}</div>
    </div>
  `;

  // 4️⃣ Notifications
  const { data: notifs } = await supabase
    .from("notifications")
    .select("*")
    .eq("technician_id", tech_id)
    .order("created_at", { ascending: false });

  const notifList = document.getElementById("notifList");
  notifList.innerHTML = "";

  notifs?.forEach(n => {
    const card = document.createElement("div");
    card.className = "notif-card";

    card.innerHTML = `
      <div class="job-title">${n.title}</div>
      <div class="notif-meta">${new Date(n.created_at).toLocaleString()}</div>
      <div>${n.message}</div>
    `;

    notifList.appendChild(card);
  });

  if (!notifs || notifs.length === 0) {
    notifList.innerHTML = "<p>No notifications.</p>";
  }
}

// 5️⃣ Toggle availability
document.getElementById("toggleAvail").addEventListener("click", async () => {
  const params = new URLSearchParams(window.location.search);
  const tech_id = params.get("tech_id");

  const { data: tech } = await supabase
    .from("technicians")
    .select("available")
    .eq("user_id", tech_id)
    .single();

  await supabase
    .from("technicians")
    .update({ available: !tech.available })
    .eq("user_id", tech_id);

  loadTechDashboard();
});

// 6️⃣ Update location
document.getElementById("updateLocation").addEventListener("click", async () => {
  const params = new URLSearchParams(window.location.search);
  const tech_id = params.get("tech_id");

  navigator.geolocation.getCurrentPosition(async (pos) => {
    await supabase
      .from("technician_locations")
      .insert({
        technician_id: tech_id,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        updated_at: new Date().toISOString()
      });

    alert("Location updated!");
  });
});

function openJob(job_id) {
  const params = new URLSearchParams(window.location.search);
  const tech_id = params.get("tech_id");
  window.location.href = `tech-job.html?job_id=${job_id}&tech_id=${tech_id}`;
}

loadTechDashboard();
