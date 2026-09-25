async function loadMessaging() {
  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");

  // Load jobs for dropdown + grouping
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title")
    .eq("client_id", client_id);

  const jobSelect = document.getElementById("jobSelect");
  jobSelect.innerHTML = "";

  jobs.forEach(job => {
    const opt = document.createElement("option");
    opt.value = job.id;
    opt.textContent = `${job.title} (Job #${job.id})`;
    jobSelect.appendChild(opt);
  });

  const jobIds = jobs.map(j => j.id);

  // Load messages
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .in("job_id", jobIds)
    .order("created_at", { ascending: false });

  const container = document.getElementById("conversationList");
  container.innerHTML = "";

  if (!messages || messages.length === 0) {
    container.innerHTML = "<p>No messages yet.</p>";
    return;
  }

  // Group by job
  const grouped = {};
  messages.forEach(msg => {
    if (!grouped[msg.job_id]) grouped[msg.job_id] = [];
    grouped[msg.job_id].push(msg);
  });

  // Render conversations
  jobs.forEach(job => {
    const header = document.createElement("div");
    header.className = "comm-job-header";
    header.textContent = `Job #${job.id} — ${job.title}`;
    container.appendChild(header);

    const jobMessages = grouped[job.id] || [];

    jobMessages.forEach(msg => {
      const card = document.createElement("div");
      card.className = "msg-card";

      card.innerHTML = `
        <div class="msg-sender">${msg.sender}</div>
        <div class="msg-content">${msg.content}</div>
        <div class="msg-time">${new Date(msg.created_at).toLocaleString()}</div>
      `;

      container.appendChild(card);
    });
  });
}

// Send new message
document.getElementById("sendForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");

  const form = new FormData(e.target);

  const newMessage = {
    job_id: form.get("job_id"),
    sender: "client",
    content: form.get("content"),
    created_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from("messages")
    .insert(newMessage);

  const messageBox = document.getElementById("sendMessage");

  if (error) {
    messageBox.style.color = "red";
    messageBox.textContent = "Failed to send message.";
    return;
  }

  messageBox.style.color = "green";
  messageBox.textContent = "Message sent!";
  loadMessaging();
});

loadMessaging();
