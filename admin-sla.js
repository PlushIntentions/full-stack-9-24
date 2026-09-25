async function loadSLAMonitor(filters = {}) {
  const { status, start, end } = filters;

  let query = supabase.from("jobs").select("*");

  if (status) query = query.eq("status", status);
  if (start) query = query.gte("scheduled_start", start + "T00:00:00");
  if (end) query = query.lte("scheduled_start", end + "T23:59:59");

  const { data: jobs } = await query.order("scheduled_start", { ascending: true });

  const container = document.getElementById("slaList");
  container.innerHTML = "";

  const now = new Date();

  jobs?.forEach(job => {
    const scheduled = new Date(job.scheduled_start);
    const assigned = job.technician_id;
    const started = job.started_at ? new Date(job.started_at) : null;
    const completed = job.completed_at ? new Date(job.completed_at) : null;

    let warnings = [];

    // 1️⃣ Overdue job (not started)
    if (!started && now > scheduled) {
      warnings.push("Job is overdue — technician has not started.");
    }

    // 2️⃣ Assigned but no check-in
    if (assigned && !started && now - scheduled > 30 * 60 * 1000) {
      warnings.push("Technician assigned but no check-in for 30+ minutes.");
    }

    // 3️⃣ In progress too long
    if (started && !completed) {
      const duration = (now - started) / (1000 * 60);
      if (duration > 180) {
        warnings.push("Job in progress for over 3 hours.");
      }
    }

    // 4️⃣ No technician assigned
    if (!assigned && now > scheduled) {
      warnings.push("Job has no technician assigned and is past scheduled time.");
    }

    // 5️⃣ Missing completion photos
    if (completed && !job.completion_photos) {
      warnings.push("Job completed but missing completion photos.");
    }

    // If no warnings, skip
    if (warnings.length === 0) return;

    const card = document.createElement("div");
    card.className = "sla-card";

    card.innerHTML = `
      <div class="sla-title">Job #${job.id} — ${job.title}</div>
      <div class="sla-meta">Client: ${job.client_id}</div>
      <div class="sla-meta">Technician: ${job.technician_id || "Unassigned"}</div>
      <div class="sla-meta">Scheduled: ${scheduled.toLocaleString()}</div>
      <div class="sla-meta">Status: ${job.status}</div>
      ${warnings.map(w => `<div class="sla-warning">${w}</div>`).join("")}
      <button class="edit-btn" onclick="openJob(${job.id})">Open Job</button>
    `;

    container.appendChild(card);
  });

  if (!jobs || container.innerHTML === "") {
    container.innerHTML = "<p>No SLA issues detected.</p>";
  }
}

// Open job editor
function openJob(id) {
  window.location.href = `admin-job-editor.html?job_id=${id}`;
}

// Apply filters
document.getElementById("applyFilters").addEventListener("click", () => {
  const filters = {
    status: document.getElementById("filterStatus").value || null,
    start: document.getElementById("filterStart").value || null,
    end: document.getElementById("filterEnd").value || null
  };

  loadSLAMonitor(filters);
});

loadSLAMonitor();
