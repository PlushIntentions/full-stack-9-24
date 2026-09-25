async function loadFilters() {
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .order("name", { ascending: true });

  const filterClient = document.getElementById("filterClient");

  clients.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.name;
    filterClient.appendChild(opt);
  });
}

async function loadBillingConsole(filters = {}) {
  const { client_id, status, start, end } = filters;

  let query = supabase.from("client_invoices").select("*");

  if (client_id) query = query.eq("client_id", client_id);
  if (status === "paid") query = query.eq("paid", true);
  if (status === "unpaid") query = query.eq("paid", false);
  if (start) query = query.gte("created_at", start + "T00:00:00");
  if (end) query = query.lte("created_at", end + "T23:59:59");

  const { data: invoices } = await query.order("created_at", { ascending: false });

  const invoiceList = document.getElementById("invoiceList");
  invoiceList.innerHTML = "";

  let totalOutstanding = 0;
  let totalPaid = 0;

  invoices?.forEach(inv => {
    const amount = Number(inv.total_amount || 0);
    if (inv.paid) totalPaid += amount;
    else totalOutstanding += amount;

    const card = document.createElement("div");
    card.className = "billing-card";

    card.innerHTML = `
      <div class="billing-title">Invoice #${inv.id}</div>
      <div class="billing-meta">Client: ${inv.client_id}</div>
      <div class="billing-meta">Amount: $${amount.toFixed(2)}</div>
      <div class="billing-meta">Status: ${inv.paid ? "Paid" : "Unpaid"}</div>
      <div class="billing-meta">Created: ${new Date(inv.created_at).toLocaleString()}</div>
      ${inv.description ? `<div class="billing-meta">Description: ${inv.description}</div>` : ""}
      ${!inv.paid ? `<button class="billing-btn" onclick="markPaid(${inv.id})">Mark as Paid</button>` : ""}
      <button class="billing-btn" onclick="deleteInvoice(${inv.id})">Delete</button>
    `;

    invoiceList.appendChild(card);
  });

  if (!invoices || invoices.length === 0) {
    invoiceList.innerHTML = "<p>No invoices found.</p>";
  }

  document.getElementById("billingSummary").innerHTML = `
    <div class="profile-field">
      <label>Total Outstanding</label>
      <div>$${totalOutstanding.toFixed(2)}</div>
    </div>
    <div class="profile-field">
      <label>Total Paid</label>
      <div>$${totalPaid.toFixed(2)}</div>
    </div>
    <div class="profile-field">
      <label>Total Invoices</label>
      <div>${invoices ? invoices.length : 0}</div>
    </div>
  `;
}

// Apply filters
document.getElementById("applyFilters").addEventListener("click", () => {
  const filters = {
    client_id: document.getElementById("filterClient").value || null,
    status: document.getElementById("filterStatus").value || null,
    start: document.getElementById("filterStart").value || null,
    end: document.getElementById("filterEnd").value || null
  };

  loadBillingConsole(filters);
});

// Init
loadFilters();
loadBillingConsole();
document.getElementById("exportCSV").addEventListener("click", () => {
  const rows = [];

  // Header row
  rows.push([
    "Invoice ID",
    "Client ID",
    "Amount",
    "Description",
    "Paid",
    "Paid At",
    "Created At"
  ]);

  // Read current invoice cards from the DOM
  const cards = document.querySelectorAll(".billing-card");

  cards.forEach(card => {
    const id = card.querySelector(".billing-title").textContent.replace("Invoice #", "");
    const metas = card.querySelectorAll(".billing-meta");

    const client = metas[0].textContent.replace("Client: ", "");
    const amount = metas[1].textContent.replace("Amount: $", "");
    const status = metas[2].textContent.replace("Status: ", "");
    const created = metas[3].textContent.replace("Created: ", "");

    // Optional description
    let description = "";
    if (metas[4] && metas[4].textContent.startsWith("Description:")) {
      description = metas[4].textContent.replace("Description: ", "");
    }

    rows.push([
      id,
      client,
      amount,
      description,
      status,
      status === "Paid" ? created : "",
      created
    ]);
  });

  // Convert to CSV
  let csvContent = "data:text/csv;charset=utf-8,";
  rows.forEach(row => {
    csvContent += row.map(v => `"${v}"`).join(",") + "\n";
  });

  // Trigger download
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "billing_export.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
});
