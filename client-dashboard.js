async function loadDashboard() {
  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");

  // 1️⃣ Load client info
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", client_id)
    .single();

  document.getElementById("clientHeader").innerHTML = `
    <div class="client-field">
      <label>Name</label>
      <span>${client.name}</span>
    </div>
    <div class="client-field">
      <label>Address</label>
      <span>${client.address}</span>
    </div>
    <div class="client-field">
      <label>Phone</label>
      <span>${client.phone}</span>
    </div>
  `;

  // 2️⃣ Upcoming job
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("client_id", client_id)
    .order("scheduled_start", { ascending: true });

  const upcoming = jobs?.find(j => j.status === "scheduled");

  document.getElementById("upcomingJob").innerHTML = upcoming
    ? `
      <div class="dashboard-card">
        <div class="dashboard-title">${upcoming.title}</div>
        <div class="dashboard-meta">Scheduled: ${upcoming.scheduled_start}</div>
        <div class="dashboard-meta">Technician: ${upcoming.technician_id || "Unassigned"}</div>
      </div>
    `
    : "<p>No upcoming jobs.</p>";

  // 3️⃣ Recent messages
  const jobIds = jobs.map(j => j.id);

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .in("job_id", jobIds)
    .order("created_at", { ascending: false })
    .limit(3);

  const msgContainer = document.getElementById("recentMessages");
  msgContainer.innerHTML = "";

  messages?.forEach(msg => {
    msgContainer.innerHTML += `
      <div class="dashboard-card">
        <div class="dashboard-title">${msg.sender}</div>
        <div>${msg.content}</div>
        <div class="dashboard-meta">${new Date(msg.created_at).toLocaleString()}</div>
      </div>
    `;
  });

  if (!messages || messages.length === 0) {
    msgContainer.innerHTML = "<p>No recent communication.</p>";
  }

  // 4️⃣ Invoice status
  const { data: invoices } = await supabase
    .from("client_invoices")
    .select("*")
    .eq("client_id", client_id)
    .order("paid_at", { ascending: false });

  const latestInvoice = invoices?.[0];

  document.getElementById("invoiceStatus").innerHTML = latestInvoice
    ? latestInvoice.paid
      ? `<p>Last invoice paid on ${latestInvoice.paid_at}</p>`
      : `<p>Invoice outstanding — please review billing.</p>`
    : "<p>No invoices found.</p>";

  // 5️⃣ Document preview
  const docs = client.documents || {};

  const docContainer = document.getElementById("docPreview");
  docContainer.innerHTML = "";

  Object.entries(docs).slice(0, 3).forEach(([key, value]) => {
    docContainer.innerHTML += `
      <div class="dashboard-card">
        <div class="dashboard-title">${key}</div>
        <div class="dashboard-meta">Tap to view full documents</div>
      </div>
    `;
  });

  if (Object.keys(docs).length === 0) {
    docContainer.innerHTML = "<p>No documents uploaded.</p>";
  }
}

function goTo(page) {
  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");
  window.location.href = `${page}?client_id=${client_id}`;
}

loadDashboard();
