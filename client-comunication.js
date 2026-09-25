async function loadCommunication() {
  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");

  // Load all jobs for this client
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title")
    .eq("client_id", client_id);

  const jobIds = jobs.map(j => j.id);

  // Load all messages for these jobs
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .in("job_id", jobIds)
    .order("created_at", { ascending: false });

  const container = document.getElementById("commList");
  container.innerHTML = "";

  if (!messages || messages.length === 0) {
    container.innerHTML = "<p>No communication found.</p>";
    return;
  }

  // Group messages by job
  const grouped = {};
  messages.forEach(msg => {
    if (!grouped[msg.job_id]) grouped[msg.job_id] = [];
    grouped[msg.job_id].push(msg);
  });

  // Render each job section
  jobs.forEach(job => {
    const header = document.createElement("div");
    header.className = "comm-job-header";
    header.textContent = `Job #${job.id} — ${job.title}`;
    container.appendChild(header);

    const jobMessages = grouped[job.id] || [];

    jobMessages.forEach(msg => {
      const card = document.createElement("div");
      card.className = "comm-card";

      card.innerHTML = `
        <div class="comm-sender">${msg.sender}</div>
        <div>${msg.content}</div>
        <div class="comm-time">${new Date(msg.created_at).toLocaleString()}</div>
      `;

      container.appendChild(card);
    });
  });
}

// Send new message
document.getElementById("messageForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");

  const form = new FormData(e.target);

  const job_id = form.get("job_id") || null;

  const newMessage = {
    job_id,
    sender: form.get("sender"),
    content: form.get("content"),
    created_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from("messages")
    .insert(newMessage);

  if (error) {
    alert("Failed to send message.");
    console.error(error);
    return;
  }

  alert("Message sent!");
  loadCommunication();
});

loadCommunication();
