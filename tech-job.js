async function loadJob() {
  const params = new URLSearchParams(window.location.search);
  const job_id = params.get("job_id");
  const tech_id = params.get("tech_id");

  // Load job
  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", job_id)
    .single();

  document.getElementById("jobCard").innerHTML = `
    <div class="job-title">${job.title}</div>
    <div class="job-meta">Scheduled: ${job.scheduled_start}</div>
    <div class="job-meta">Status: ${job.status}</div>
    <div class="job-meta">Description: ${job.description || "None"}</div>
  `;

  // Load client
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", job.client_id)
    .single();

  document.getElementById("clientCard").innerHTML = `
    <div class="profile-field"><label>Name</label><div>${client.name}</div></div>
    <div class="profile-field"><label>Phone</label><div>${client.phone}</div></div>
    <div class="profile-field"><label>Address</label><div>${client.address}</div></div>
    <button class="view-btn" onclick="openMaps('${client.address}')">Navigate</button>
  `;

  loadMessages(job_id);
}

function openMaps(address) {
  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`);
}

// Check-in
document.getElementById("checkInBtn").addEventListener("click", async () => {
  const params = new URLSearchParams(window.location.search);
  const job_id = params.get("job_id");

  await supabase
    .from("jobs")
    .update({ status: "in_progress", check_in: new Date().toISOString() })
    .eq("id", job_id);

  loadJob();
});

// Check-out
document.getElementById("checkOutBtn").addEventListener("click", async () => {
  const params = new URLSearchParams(window.location.search);
  const job_id = params.get("job_id");

  await supabase
    .from("jobs")
    .update({ check_out: new Date().toISOString() })
    .eq("id", job_id);

  loadJob();
});

// Complete job
document.getElementById("completeBtn").addEventListener("click", async () => {
  const params = new URLSearchParams(window.location.search);
  const job_id = params.get("job_id");
  const tech_id = params.get("tech_id");

  await supabase
    .from("jobs")
    .update({ status: "completed", completed_time: new Date().toISOString() })
    .eq("id", job_id);

  // Add earnings
  await supabase
    .from("earnings")
    .insert({
      technician_id: tech_id,
      job_id,
      amount: 75.00, // or dynamic
      created_at: new Date().toISOString()
    });

  loadJob();
});

// Upload photo
document.getElementById("photoForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const params = new URLSearchParams(window.location.search);
  const job_id = params.get("job_id");

  const form = new FormData(e.target);
  const type = form.get("type");
  const file = form.get("file");

  const fileName = `job-${job_id}-${type}-${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("job_photos")
    .upload(fileName, file);

  const messageBox = document.getElementById("photoMessage");

  if (uploadError) {
    messageBox.style.color = "red";
    messageBox.textContent = "Upload failed.";
    return;
  }

  const { data: urlData } = supabase.storage
    .from("job_photos")
    .getPublicUrl(fileName);

  await supabase
    .from("job_photos")
    .insert({
      job_id,
      type,
      url: urlData.publicUrl,
      created_at: new Date().toISOString()
    });

  messageBox.style.color = "green";
  messageBox.textContent = "Photo uploaded!";
});

// Notes
document.getElementById("noteForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const params = new URLSearchParams(window.location.search);
  const job_id = params.get("job_id");

  const form = new FormData(e.target);
  const note = form.get("note");

  await supabase
    .from("job_notes")
    .insert({
      job_id,
      note,
      created_at: new Date().toISOString()
    });

  document.getElementById("noteMessage").textContent = "Note saved!";
});

// Messages
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
    card.className = "msg-card";

    card.innerHTML = `
      <div class="msg-sender">${msg.sender}</div>
      <div class="msg-content">${msg.content}</div>
      <div class="msg-time">${new Date(msg.created_at).toLocaleString()}</div>
    `;

    container.appendChild(card);
  });
}

document.getElementById("msgForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const params = new URLSearchParams(window.location.search);
  const job_id = params.get("job_id");

  const form = new FormData(e.target);
  const content = form.get("content");

  await supabase
    .from("messages")
    .insert({
      job_id,
      sender: "technician",
      content,
      created_at: new Date().toISOString()
    });

  document.getElementById("msgMessage").textContent = "Message sent!";
  loadMessages(job_id);
});

loadJob();
