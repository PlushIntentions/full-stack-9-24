async function loadJobEditor() {
  const params = new URLSearchParams(window.location.search);
  const job_id = params.get("job_id");

  // Load job
  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", job_id)
    .single();

  document.getElementById("jobCard").innerHTML = `
    <div class="admin-title">${job.title}</div>
    <div class="admin-meta">Client: ${job.client_id}</div>
    <div class="admin-meta">Technician: ${job.technician_id || "Unassigned"}</div>
    <div class="admin-meta">Status: ${job.status}</div>
    <div class="admin-meta">Scheduled: ${job.scheduled_start}</div>
  `;

  // Fill form
  const form = document.getElementById("jobForm");
  form.title.value = job.title;
  form.description.value = job.description || "";
  form.scheduled_start.value = job.scheduled_start.slice(0, 16);
  form.status.value = job.status;

  loadTechnicians(job.technician_id);
  loadPhotos(job_id);
  loadNotes(job_id);
  loadMessages(job_id);
}

// Save job changes
document.getElementById("jobForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const params = new URLSearchParams(window.location.search);
  const job_id = params.get("job_id");

  const form = new FormData(e.target);

  const updated = {
    title: form.get("title"),
    description: form.get("description"),
    scheduled_start: form.get("scheduled_start"),
    status: form.get("status")
  };

  const { error } = await supabase
    .from("jobs")
    .update(updated)
    .eq("id", job_id);

  const msg = document.getElementById("jobMessage");

  if (error) {
    msg.style.color = "red";
    msg.textContent = "Failed to update job.";
    return;
  }

  msg.style.color = "green";
  msg.textContent = "Job updated!";
  loadJobEditor();
});

// Load technicians
async function loadTechnicians(currentTech) {
  const { data: techs } = await supabase
    .from("technicians")
    .select("*")
    .order("name", { ascending: true });

  const select = document.getElementById("techSelect");
  select.innerHTML = "";

  techs.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t.user_id;
    opt.textContent = t.name;
    if (t.user_id === currentTech) opt.selected = true;
    select.appendChild(opt);
  });
}

// Assign technician
document.getElementById("assignForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const params = new URLSearchParams(window.location.search);
  const job_id = params.get("job_id");

  const form = new FormData(e.target);
  const tech_id = form.get("technician_id");

  const { error } = await supabase
    .from("jobs")
    .update({ technician_id: tech_id, status: "assigned" })
    .eq("id", job_id);

  const msg = document.getElementById("assignMessage");

  if (error) {
    msg.style.color = "red";
    msg.textContent = "Failed to assign technician.";
    return;
  }

  msg.style.color = "green";
  msg.textContent = "Technician assigned!";
  loadJobEditor();
});

// Load photos
async function loadPhotos(job_id) {
  const { data: photos } = await supabase
    .from("job_photos")
    .select("*")
    .eq("job_id", job_id);

  const container = document.getElementById("photoList");
  container.innerHTML = "";

  photos?.forEach(p => {
    const card = document.createElement("div");
    card.className = "admin-card";

    card.innerHTML = `
      <div class="admin-title">${p.type.toUpperCase()} Photo</div>
      <img src="${p.url}" style="width:100%;border-radius:10px;margin-top:10px;">
      <div class="admin-meta">${new Date(p.created_at).toLocaleString()}</div>
    `;

    container.appendChild(card);
  });

  if (!photos || photos.length === 0) {
    container.innerHTML = "<p>No photos uploaded.</p>";
  }
}

// Load notes
async function loadNotes(job_id) {
  const { data: notes } = await supabase
    .from("job_notes")
    .select("*")
    .eq("job_id", job_id)
    .order("created_at", { ascending: false });

  const container = document.getElementById("noteList");
  container.innerHTML = "";

  notes?.forEach(n => {
    const card = document.createElement("div");
    card.className = "admin-card";

    card.innerHTML = `
      <div class="admin-title">Note</div>
      <div>${n.note}</div>
      <div class="admin-meta">${new Date(n.created_at).toLocaleString()}</div>
    `;

    container.appendChild(card);
  });

  if (!notes || notes.length === 0) {
    container.innerHTML = "<p>No notes.</p>";
  }
}

// Load messages
async function loadMessages(job_id) {
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("job_id", job_id)
    .order("created_at", { ascending: false });

  const container = document.getElementById("msgList");
  container.innerHTML = "";

  messages?.forEach(msg => {
    const card = document.createElement("div");
    card.className = "admin-card";

    card.innerHTML = `
      <div class="admin-title">${msg.sender}</div>
      <div>${msg.content}</div>
      <div class="admin-meta">${new Date(msg.created_at).toLocaleString()}</div>
    `;

    container.appendChild(card);
  });

  if (!messages || messages.length === 0) {
    container.innerHTML = "<p>No messages.</p>";
  }
}

// Delete job
document.getElementById("deleteBtn").addEventListener("click", async () => {
  if (!confirm("Are you sure you want to delete this job?")) return;

  const params = new URLSearchParams(window.location.search);
  const job_id = params.get("job_id");

  await supabase
    .from("jobs")
    .delete()
    .eq("id", job_id);

  alert("Job deleted.");
  window.location.href = "admin-dispatch.html";
});

loadJobEditor();
