async function loadFilters() {
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .order("name", { ascending: true });

  const { data: techs } = await supabase
    .from("technicians")
    .select("user_id, name")
    .order("name", { ascending: true });

  const filterClient = document.getElementById("filterClient");
  const filterTech = document.getElementById("filterTech");

  clients.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.name;
    filterClient.appendChild(opt);
  });

  techs.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t.user_id;
    opt.textContent = t.name;
    filterTech.appendChild(opt);
  });
}

async function loadRevenue(filters = {}) {
  const { client_id, tech_id, start, end } = filters;

  let query = supabase.from("client_invoices").select("*");

  if (client_id) query = query.eq("client_id", client_id);
  if (start) query = query.gte("created_at", start + "T00:00:00");
  if (end) query = query.lte("created_at", end + "T23:59:59");

  const { data: invoices } = await query.order("created_at", { ascending: false });

  // Summary totals
  let totalRevenue = 0;
  let paidRevenue = 0;
  let unpaidRevenue = 0;

  invoices.forEach(inv => {
    const amount = Number(inv.total_amount);
    totalRevenue += amount;
    if (inv.paid) paidRevenue += amount;
    else unpaidRevenue += amount;
  });

  document.getElementById("summaryCard").innerHTML = `
    <div class="profile-field">
      <label>Total Revenue</label>
      <div>$${totalRevenue.toFixed(2)}</div>
    </div>
    <div class="profile-field">
      <label>Paid Revenue</label>
      <div>$${paidRevenue.toFixed(2)}</div>
    </div>
    <div class="profile-field">
      <label>Unpaid Revenue</label>
      <div>$${unpaidRevenue.toFixed(2)}</div>
    </div>
  `;

  // Revenue by month
  const monthMap = {};
  invoices.forEach(inv => {
    const month = inv.created_at.slice(0, 7); // YYYY-MM
    monthMap[month] = (monthMap[month] || 0) + Number(inv.total_amount);
  });

  const monthList = document.getElementById("monthList");
  monthList.innerHTML = "";

  Object.entries(monthMap).forEach(([month, amount]) => {
    const card = document.createElement("div");
    card.className = "rev-card";

    card.innerHTML = `
      <div class="rev-title">${month}</div>
      <div class="rev-meta">$${amount.toFixed(2)}</div>
    `;

    monthList.appendChild(card);
  });

  // Revenue by client
  const clientMap = {};
  invoices.forEach(inv => {
    clientMap[inv.client_id] = (clientMap[inv.client_id] || 0) + Number(inv.total_amount);
  });

  const clientList = document.getElementById("clientList");
  clientList.innerHTML = "";

  Object.entries(clientMap).forEach(([client, amount]) => {
    const card = document.createElement("div");
    card.className = "rev-card";

    card.innerHTML = `
      <div class="rev-title">Client ${client}</div>
      <div class="rev-meta">$${amount.toFixed(2)}</div>
    `;

    clientList.appendChild(card);
  });

  // Revenue by technician (based on jobs)
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, technician_id, client_id");

  const techMap = {};

  invoices.forEach(inv => {
    const job = jobs.find(j => j.client_id === inv.client_id);
    if (!job) return;

    const tech = job.technician_id;
    techMap[tech] = (techMap[tech] || 0) + Number(inv.total_amount);
  });

  const techList = document.getElementById("techList");
  techList.innerHTML = "";

  Object.entries(techMap).forEach(([tech, amount]) => {
    const card = document.createElement("div");
    card.className = "rev-card";

    card.innerHTML = `
      <div class="rev-title">Tech ${tech}</div>
      <div class="rev-meta">$${amount.toFixed(2)}</div>
    `;

    techList.appendChild(card);
  });
}

// Apply filters
document.getElementById("applyFilters").addEventListener("click", () => {
  const filters = {
    client_id: document.getElementById("filterClient").value || null,
    tech_id: document.getElementById("filterTech").value || null,
    start: document.getElementById("filterStart").value || null,
    end: document.getElementById("filterEnd").value || null
  };

  loadRevenue(filters);
});

// Export CSV
document.getElementById("exportCSV").addEventListener("click", () => {
  const rows = [];
  rows.push(["Month", "Client", "Technician", "Amount"]);

  const cards = document.querySelectorAll(".rev-card");

  cards.forEach(card => {
    const title = card.querySelector(".rev-title").textContent;
    const amount = card.querySelector(".rev-meta").textContent.replace("$", "");

    rows.push([title, "", "", amount]);
  });

  let csvContent = "data:text/csv;charset=utf-8,";
  rows.forEach(row => {
    csvContent += row.map(v => `"${v}"`).join(",") + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "revenue_export.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
});

loadFilters();
loadRevenue();
