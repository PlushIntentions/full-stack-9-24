let selectedEarnings = [];

async function loadFilters() {
  const { data: techs } = await supabase
    .from("technicians")
    .select("user_id, name")
    .order("name", { ascending: true });

  const filterTech = document.getElementById("filterTech");

  techs.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t.user_id;
    opt.textContent = t.name;
    filterTech.appendChild(opt);
  });
}

async function loadEarnings(filters = {}) {
  const { tech_id, start, end } = filters;

  let query = supabase.from("earnings").select("*").eq("paid_out", false);

  if (tech_id) query = query.eq("technician_id", tech_id);
  if (start) query = query.gte("created_at", start + "T00:00:00");
  if (end) query = query.lte("created_at", end + "T23:59:59");

  const { data: earnings } = await query.order("created_at", { ascending: false });

  const container = document.getElementById("earningsList");
  container.innerHTML = "";
  selectedEarnings = [];

  earnings?.forEach(e => {
    const card = document.createElement("div");
    card.className = "payout-card";

    card.innerHTML = `
      <div class="payout-title">Job #${e.job_id}</div>
      <div class="payout-meta">Tech: ${e.technician_id}</div>
      <div class="payout-meta">Amount: $${Number(e.amount).toFixed(2)}</div>
      <div class="payout-meta">Date: ${new Date(e.created_at).toLocaleString()}</div>
      <button class="payout-btn" onclick="toggleSelect(${e.id})">Select</button>
    `;

    container.appendChild(card);
  });

  if (!earnings || earnings.length === 0) {
    container.innerHTML = "<p>No unpaid earnings.</p>";
  }
}

function toggleSelect(id) {
  if (selectedEarnings.includes(id)) {
    selectedEarnings = selectedEarnings.filter(x => x !== id);
  } else {
    selectedEarnings.push(id);
  }
}

document.getElementById("applyFilters").addEventListener("click", () => {
  const filters = {
    tech_id: document.getElementById("filterTech").value || null,
    start: document.getElementById("filterStart").value || null,
    end: document.getElementById("filterEnd").value || null
  };

  loadEarnings(filters);
});

// Create payout
document.getElementById("createPayoutBtn").addEventListener("click", async () => {
  if (selectedEarnings.length === 0) {
    document.getElementById("payoutMessage").textContent = "No earnings selected.";
    return;
  }

  // Load selected earnings
  const { data: earnings } = await supabase
    .from("earnings")
    .select("*")
    .in("id", selectedEarnings);

  const total = earnings.reduce((sum, e) => sum + Number(e.amount), 0);
  const tech_id = earnings[0].technician_id;

  // Create payout record
  await supabase
    .from("payouts")
    .insert({
      technician_id: tech_id,
      amount: total,
      created_at: new Date().toISOString(),
      status: "pending"
    });

  // Mark earnings as paid out
  await supabase
    .from("earnings")
    .update({ paid_out: true })
    .in("id", selectedEarnings);

  document.getElementById("payoutMessage").textContent = "Payout created!";
  loadEarnings();
  loadPayouts();
});

// Load payout history
async function loadPayouts() {
  const { data: payouts } = await supabase
    .from("payouts")
    .select("*")
    .order("created_at", { ascending: false });

  const container = document.getElementById("payoutList");
  container.innerHTML = "";

  payouts?.forEach(p => {
    const card = document.createElement("div");
    card.className = "payout-card";

    card.innerHTML = `
      <div class="payout-title">Payout #${p.id}</div>
      <div class="payout-meta">Tech: ${p.technician_id}</div>
      <div class="payout-meta">Amount: $${Number(p.amount).toFixed(2)}</div>
      <div class="payout-meta">Status: ${p.status}</div>
      <div class="payout-meta">Date: ${new Date(p.created_at).toLocaleString()}</div>
      ${p.status === "pending" ? `<button class="payout-btn" onclick="markSent(${p.id})">Mark Sent</button>` : ""}
    `;

    container.appendChild(card);
  });

  if (!payouts || payouts.length === 0) {
    container.innerHTML = "<p>No payouts found.</p>";
  }
}

async function markSent(id) {
  await supabase
    .from("payouts")
    .update({ status: "sent" })
    .eq("id", id);

  loadPayouts();
}

loadFilters();
loadEarnings();
loadPayouts();
