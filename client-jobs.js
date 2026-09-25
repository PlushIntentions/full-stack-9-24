async function loadJobHistory() {
  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("client_id", client_id)
    .order("created_at", { ascending: false });

  if (error) {
    document.getElementById("jobHistory").innerHTML = "<p>Error loading job history.</p>";
    return;
  }

  const container = document.getElementById("jobHistory");
  container.innerHTML = "";

  if (!data || data.length === 0) {
    container.innerHTML = "<p>No jobs found for this client.</p>";
    return;
  }

  data.forEach(job => {
    const card = document.createElement("div");
    card.className = "job-card";

    card.innerHTML = `
      <div class="job-title">${job.title}</div>
      <div class="job-status">Status: ${job.status}</div>

      <div class="job-meta"><strong>Scheduled:</strong> ${job.scheduled_start || "N/A"}</div>
      <div class="job-meta"><strong>Completed:</strong> ${job.completed_time || "N/A"}</div>

      <div class="job-meta"><strong>Payout:</strong> $${job.payout_amount || 0}</div>
      <div class="job-meta"><strong>Bonus:</strong> $${job.bonus_amount || 0}</div>
      <div class="job-meta"><strong>Penalty:</strong> $${job.penalty_amount || 0}</div>

      <button class="view-btn" onclick="viewJob(${job.id})">View Job</button>
    `;

    container.appendChild(card);
  });
}

function viewJob(job_id) {
  window.location.href = `job.html?job_id=${job_id}`;
}

loadJobHistory();
