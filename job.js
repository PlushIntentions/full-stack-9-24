async function loadJob() {
  const params = new URLSearchParams(window.location.search);
  const job_id = params.get("job_id");

  // Load job
  const { data: job, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", job_id)
    .single();

  if (error) {
    document.getElementById("jobDetails").innerHTML = "<p>Error loading job.</p>";
    return;
  }

  const container = document.getElementById("jobDetails");

  container.innerHTML = `
    <div class="detail-card">

      <div class="detail-field">
        <label>title</label>
        <span>${job.title}</span>
      </div>

      <div class="detail-field">
        <label>description</label>
        <span>${job.description || ""}</span>
      </div>

      <div class="detail-field">
        <label>status</label>
        <span>${job.status}</span>
      </div>

      <div class="detail-field">
        <label>scheduled_start</label>
        <span>${job.scheduled_start || "N/A"}</span>
      </div>

      <div class="detail-field">
        <label>completed_time</label>
        <span>${job.completed_time || "N/A"}</span>
      </div>

      <div class="detail-field">
        <label>payout_amount</label>
        <span>$${job.payout_amount || 0}</span>
      </div>

      <div class="detail-field">
        <label>bonus_amount</label>
        <span>$${job.bonus_amount || 0}</span>
      </div>

      <div class="detail-field">
        <label>penalty_amount</label>
        <span>$${job.penalty_amount || 0}</span>
      </div>

      <div class="detail-field">
        <label>minutes_late</label>
        <span>${job.minutes_late || 0}</span>
      </div>

      <div class="detail-field">
        <label>lat / lng</label>
        <span>${job.lat || ""} / ${job.lng || ""}</span>
      </div>

      <div class="detail-field">
        <label>admin_notes</label>
        <span>${job.admin_notes || ""}</span>
      </div>

    </div>

    <h2 class="section-title">Photos</h2>
    <div id="photos"></div>

    <h2 class="section-title">Messages</h2>
    <div id="messages"></div>

    <h2 class="section-title">Status History</h2>
    <div id="statusHistory"></div>

    <h2 class="section-title">Penalty Logs</h2>
    <div id="penalties"></div>
  `;

  loadPhotos(job_id);
  loadMessages(job_id);
  loadStatusHistory(job_id);
  loadPenalties(job_id);
}

async function loadPhotos(job_id) {
  const { data, error } = await supabase
    .from("job_photos")
    .select("*")
    .eq("job_id", job_id);

  const container = document.getElementById("photos");

  if (!data || data.length === 0) {
    container.innerHTML = "<p>No photos.</p>";
    return;
  }

  container.innerHTML = `<div class="photo-grid"></div>`;
  const grid = container.querySelector(".photo-grid");

  data.forEach(photo => {
    const img = document.createElement("img");
    img.src = photo.url;
    grid.appendChild(img);
  });
}

async function loadMessages(job_id) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("job_id", job_id)
    .order("created_at", { ascending: true });

  const container = document.getElementById("messages");

  if (!data || data.length === 0) {
    container.innerHTML = "<p>No messages.</p>";
    return;
  }

  data.forEach(msg => {
    const card = document.createElement("div");
    card.className = "message-card";
    card.innerHTML = `
      <strong>${msg.sender}</strong>
      <p>${msg.content}</p>
      <small>${msg.created_at}</small>
    `;
    container.appendChild(card);
  });
}

async function loadStatusHistory(job_id) {
  const { data, error } = await supabase
    .from("job_status_history")
    .select("*")
    .eq("job_id", job_id)
    .order("changed_at", { ascending: true });

  const container = document.getElementById("statusHistory");

  if (!data || data.length === 0) {
    container.innerHTML = "<p>No status changes.</p>";
    return;
  }

  data.forEach(s => {
    const card = document.createElement("div");
    card.className = "status-history";
    card.innerHTML = `
      <strong>${s.old_status} → ${s.new_status}</strong>
      <p>${s.changed_at}</p>
    `;
    container.appendChild(card);
  });
}

async function loadPenalties(job_id) {
  const { data, error } = await supabase
    .from("penalty_logs")
    .select("*")
    .eq("job_id", job_id);

  const container = document.getElementById("penalties");

  if (!data || data.length === 0) {
    container.innerHTML = "<p>No penalties.</p>";
    return;
  }

  data.forEach(p => {
    const card = document.createElement("div");
    card.className = "detail-card";
    card.innerHTML = `
      <div class="detail-field">
        <label>minutes_late</label>
        <span>${p.minutes_late}</span>
      </div>

      <div class="detail-field">
        <label>penalty_amount</label>
        <span>$${p.penalty_amount}</span>
      </div>

      <div class="detail-field">
        <label>override_reason</label>
        <span>${p.override_reason || ""}</span>
      </div>

      <div class="detail-field">
        <label>override_admin</label>
        <span>${p.override_admin || ""}</span>
      </div>

      <div class="detail-field">
        <label>override_timestamp</label>
        <span>${p.override_timestamp || ""}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

loadJob();
