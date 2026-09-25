async function loadServiceHistory() {
  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");

  const timeline = [];

  // 1️⃣ Load jobs
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("client_id", client_id);

  jobs?.forEach(job => {
    timeline.push({
      type: "Job",
      title: job.title,
      timestamp: job.completed_time || job.scheduled_start || job.created_at,
      meta: `Status: ${job.status} | Technician: ${job.technician_id || "Unassigned"}`,
      content: `
        Base: $${job.payout_amount || 0}<br>
        Bonus: $${job.bonus_amount || 0}<br>
        Penalty: -$${job.penalty_amount || 0}
      `
    });
  });

  // 2️⃣ Load notes
  const { data: notes } = await supabase
    .from("client_notes")
    .select("*")
    .eq("client_id", client_id);

  notes?.forEach(note => {
    timeline.push({
      type: "Note",
      title: "Client Note",
      timestamp: note.created_at,
      meta: `Added by: ${note.created_by}`,
      content: note.note
    });
  });

  // 3️⃣ Load messages (communication)
  const jobIds = jobs.map(j => j.id);

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .in("job_id", jobIds);

  messages?.forEach(msg => {
    timeline.push({
      type: "Message",
      title: `Message for Job #${msg.job_id}`,
      timestamp: msg.created_at,
      meta: `Sender: ${msg.sender}`,
      content: msg.content
    });
  });

  // Sort timeline newest → oldest
  timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Render
  const container = document.getElementById("historyTimeline");
  container.innerHTML = "";

  if (timeline.length === 0) {
    container.innerHTML = "<p>No service history found.</p>";
    return;
  }

  timeline.forEach(entry => {
    const card = document.createElement("div");
    card.className = "timeline-entry";

    card.innerHTML = `
      <div class="timeline-title">${entry.title}</div>
      <div class="timeline-type">${entry.type}</div>
      <div class="timeline-meta">${new Date(entry.timestamp).toLocaleString()}</div>
      <div class="timeline-meta">${entry.meta}</div>
      <div class="timeline-content">${entry.content}</div>
    `;

    container.appendChild(card);
  });
}

loadServiceHistory();
