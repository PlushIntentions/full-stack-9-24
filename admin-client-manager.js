async function loadClients() {
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("name", { ascending: true });

  const container = document.getElementById("clientList");
  container.innerHTML = "";

  clients?.forEach(c => {
    const card = document.createElement("div");
    card.className = "client-card-admin";

    card.innerHTML = `
      <div class="client-title">${c.name}</div>
      <div class="client-meta">Phone: ${c.phone || "N/A"}</div>
      <div class="client-meta">Email: ${c.email || "N/A"}</div>
      <div class="client-meta">Address: ${c.address || "N/A"}</div>

      <button class="client-btn" onclick="editClient('${c.id}')">Edit</button>
      <button class="client-btn" onclick="viewJobs('${c.id}')">Jobs</button>
      <button class="client-btn" onclick="viewInvoices('${c.id}')">Invoices</button>
      <button class="client-btn" onclick="viewDocuments('${c.id}')">Documents</button>
      <button class="client-btn" onclick="viewNotes('${c.id}')">Notes</button>
      <button class="client-btn" onclick="viewMessages('${c.id}')">Messages</button>
      <button class="client-btn" onclick="navigate('${c.address}')">Navigate</button>
      <button class="client-btn" onclick="deleteClient('${c.id}')">Delete</button>
    `;

    container.appendChild(card);
  });

  if (!clients || clients.length === 0) {
    container.innerHTML = "<p>No clients found.</p>";
  }
}

// Add client
document.getElementById("addClientForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = new FormData(e.target);

  const newClient = {
    name: form.get("name"),
    phone: form.get("phone"),
    email: form.get("email"),
    address: form.get("address"),
    documents: {}
  };

  const { error } = await supabase
    .from("clients")
    .insert(newClient);

  const msg = document.getElementById("addMessage");

  if (error) {
    msg.style.color = "red";
    msg.textContent = "Failed to add client.";
    return;
  }

  msg.style.color = "green";
  msg.textContent = "Client added!";
  loadClients();
});

// Navigation
function navigate(address) {
  if (!address) {
    alert("No address available.");
    return;
  }
  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`);
}

// Edit client
function editClient(client_id) {
  window.location.href = `admin-client-edit.html?client_id=${client_id}`;
}

// View jobs
function viewJobs(client_id) {
  window.location.href = `admin-client-jobs.html?client_id=${client_id}`;
}

// View invoices
function viewInvoices(client_id) {
  window.location.href = `admin-client-invoices.html?client_id=${client_id}`;
}

// View documents
function viewDocuments(client_id) {
  window.location.href = `admin-client-documents.html?client_id=${client_id}`;
}

// View notes
function viewNotes(client_id) {
  window.location.href = `admin-client-notes.html?client_id=${client_id}`;
}

// View messages
function viewMessages(client_id) {
  window.location.href = `admin-client-messages.html?client_id=${client_id}`;
}

// Delete client
async function deleteClient(client_id) {
  if (!confirm("Are you sure you want to delete this client?")) return;

  await supabase
    .from("clients")
    .delete()
    .eq("id", client_id);

  loadClients();
}

loadClients();
