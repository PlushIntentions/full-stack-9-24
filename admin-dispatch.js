async function loadDispatchBoard() {
  // 1️⃣ Load unassigned jobs
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .is("technician_id", null)
    .order("created_at", { ascending: true });

  const unassignedList = document.getElementById("unassignedList");
  unassignedList.innerHTML = "";

  jobs?.forEach(job => {
    const card = document.createElement("div");
    card.className = "dispatch-card";

    card.innerHTML = `
      <div class="dispatch-title">${job.title}</div>
      <div class="dispatch-meta">Client: ${job.client_id}</div>
      <div class="dispatch-meta">Scheduled: ${job.scheduled_start}</div>
      <button class="assign-btn" onclick="assignJob(${job.id})">Assign Job</button>
    `;

    unassignedList.appendChild(card);
  });

  if (!jobs || jobs.length === 0) {
    unassignedList.innerHTML = "<p>No unassigned jobs.</p>";
  }

  // 2️⃣ Load technicians
  const { data: techs } = await supabase
    .from("technicians")
    .select("*")
    .order("name", { ascending: true });

  const techList = document.getElementById("techList");
  techList.innerHTML = "";

  techs?.forEach(tech => {
    const card = document.createElement("div");
    card.className = "dispatch-card";

    card.innerHTML = `
      <div class="dispatch-title">${tech.name}</div>
      <div class="dispatch-meta">Status: ${tech.status}</div>
      <div class="dispatch-meta">Available: ${tech.available ? "Yes" : "No"}</div>
      <button class="assign-btn" onclick="assignToTech('${tech.user_id}')">Assign to ${tech.name}</button>
    `;

    techList.appendChild(card);
  });
}

// 3️⃣ Assign job to technician
let selectedTech = null;

function assignToTech(tech_id) {
  selectedTech = tech_id;
  alert("Technician selected. Now choose a job to assign.");
}

async function assignJob(job_id) {
  if (!selectedTech) {
    alert("Select a technician first.");
    return;
  }

  await supabase
    .from("jobs")
    .update({ technician_id: selectedTech, status: "assigned" })
    .eq("id", job_id);

  // Send notification
  await supabase
    .from("notifications")
    .insert({
      technician_id: selectedTech,
      title: "New Job Assigned",
      message: `You have been assigned Job #${job_id}`,
      created_at: new Date().toISOString()
    });

  selectedTech = null;
  loadDispatchBoard();
}

// 4️⃣ Open map with technician locations
async function openMap() {
  const { data: locs } = await supabase
    .from("technician_locations")
    .select("*");

  const markers = locs.map(l => `${l.lat},${l.lng}`).join("|");

  window.open(`https://www.google.com/maps/dir/${markers}`);
}

loadDispatchBoard();
