async function loadEarnings() {
  const params = new URLSearchParams(window.location.search);
  const tech_id = params.get("tech_id");

  // Load earnings
  const { data: earnings } = await supabase
    .from("earnings")
    .select("*")
    .eq("technician_id", tech_id)
    .order("created_at", { ascending: false });

  // Summary
  let total = 0;
  let weekTotal = 0;
  let monthTotal = 0;

  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  earnings?.forEach(e => {
    const amount = Number(e.amount);
    const created = new Date(e.created_at);

    total += amount;
    if (created >= weekStart) weekTotal += amount;
    if (created >= monthStart) monthTotal += amount;
  });

  document.getElementById("summaryCard").innerHTML = `
    <div class="profile-field">
      <label>Total Earnings</label>
      <div>$${total.toFixed(2)}</div>
    </div>
    <div class="profile-field">
      <label>This Week</label>
      <div>$${weekTotal.toFixed(2)}</div>
    </div>
    <div class="profile-field">
      <label>This Month</label>
      <div>$${monthTotal.toFixed(2)}</div>
    </div>
  `;

  // Recent earnings list
  const earnList = document.getElementById("earnList");
  earnList.innerHTML = "";

  earnings?.forEach(e => {
    const card = document.createElement("div");
    card.className = "earn-card";

    card.innerHTML = `
      <div class="earn-title">Job #${e.job_id}</div>
      <div class="earn-meta">Amount: $${Number(e.amount).toFixed(2)}</div>
      <div class="earn-meta">Date: ${new Date(e.created_at).toLocaleString()}</div>
    `;

    earnList.appendChild(card);
  });

  if (!earnings || earnings.length === 0) {
    earnList.innerHTML = "<p>No earnings yet.</p>";
  }

  // Payout history
  const { data: payouts } = await supabase
    .from("payouts")
    .select("*")
    .eq("technician_id", tech_id)
    .order("created_at", { ascending: false });

  const payoutList = document.getElementById("payoutList");
  payoutList.innerHTML = "";

  payouts?.forEach(p => {
    const card = document.createElement("div");
    card.className = "earn-card";

    card.innerHTML = `
      <div class="earn-title">Payout</div>
      <div class="earn-meta">Amount: $${Number(p.amount).toFixed(2)}</div>
      <div class="earn-meta">Date: ${new Date(p.created_at).toLocaleString()}</div>
      <div class="earn-meta">Status: ${p.status}</div>
    `;

    payoutList.appendChild(card);
  });

  if (!payouts || payouts.length === 0) {
    payoutList.innerHTML = "<p>No payouts yet.</p>";
  }
}

loadEarnings();
