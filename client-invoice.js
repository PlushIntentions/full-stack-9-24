async function loadInvoice() {
  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");

  // Load client info
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", client_id)
    .single();

  // Load jobs for this client
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("client_id", client_id)
    .order("completed_time", { ascending: false });

  const header = document.getElementById("invoiceHeader");
  const items = document.getElementById("invoiceItems");
  const totals = document.getElementById("invoiceTotals");

  header.innerHTML = `
    <div class="client-field">
      <label>Client</label>
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

  let subtotal = 0;
  let bonusTotal = 0;
  let penaltyTotal = 0;

  items.innerHTML = "";

  jobs.forEach(job => {
    const payout = Number(job.payout_amount || 0);
    const bonus = Number(job.bonus_amount || 0);
    const penalty = Number(job.penalty_amount || 0);

    subtotal += payout;
    bonusTotal += bonus;
    penaltyTotal += penalty;

    const card = document.createElement("div");
    card.className = "invoice-item";

    card.innerHTML = `
      <div class="invoice-title">${job.title}</div>
      <div class="invoice-meta">Completed: ${job.completed_time || "N/A"}</div>
      <div class="invoice-meta">Base: $${payout.toFixed(2)}</div>
      <div class="invoice-meta">Bonus: $${bonus.toFixed(2)}</div>
      <div class="invoice-meta">Penalty: -$${penalty.toFixed(2)}</div>
    `;

    items.appendChild(card);
  });

  const total = subtotal + bonusTotal - penaltyTotal;

  totals.innerHTML = `
    <div class="total-line">Subtotal: $${subtotal.toFixed(2)}</div>
    <div class="total-line">Bonuses: $${bonusTotal.toFixed(2)}</div>
    <div class="total-line">Penalties: -$${penaltyTotal.toFixed(2)}</div>
    <div class="total-line">Total Due: $${total.toFixed(2)}</div>
  `;
}

// Mark invoice as paid (creates a record)
document.getElementById("markPaidBtn").addEventListener("click", async () => {
  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");

  const { error } = await supabase
    .from("client_invoices")
    .insert({
      client_id,
      paid: true,
      paid_at: new Date().toISOString()
    });

  if (error) {
    alert("Failed to mark invoice as paid.");
    return;
  }

  alert("Invoice marked as paid!");
});

loadInvoice();
