async function loadEarnings() {
  const params = new URLSearchParams(window.location.search);
  const user_id = params.get("user_id");

  const container = document.getElementById("earningsContainer");

  // 1️⃣ JOB-BASED EARNINGS
  const { data: jobs } = await supabase
    .from("jobs")
    .select("payout_amount, bonus_amount, penalty_amount")
    .eq("technician_id", user_id);

  let jobTotal = 0;
  let jobBonus = 0;
  let jobPenalty = 0;

  jobs?.forEach(j => {
    jobTotal += Number(j.payout_amount || 0);
    jobBonus += Number(j.bonus_amount || 0);
    jobPenalty += Number(j.penalty_amount || 0);
  });

  // 2️⃣ earnings table
  const { data: earnings } = await supabase
    .from("earnings")
    .select("amount")
    .eq("technician_id", user_id);

  let earningsTotal = 0;
  earnings?.forEach(e => earningsTotal += Number(e.amount || 0));

  // 3️⃣ payouts table
  const { data: payouts } = await supabase
    .from("payouts")
    .select("*")
    .eq("technician_id", user_id);

  let payoutTotal = 0;
  payouts?.forEach(p => payoutTotal += Number(p.amount || 0));

  // 4️⃣ payroll table
  const { data: payroll } = await supabase
    .from("payroll")
    .select("*")
    .eq("technician_id", user_id);

  let payrollTotal = 0;
  payroll?.forEach(p => payrollTotal += Number(p.total || 0));

  // 5️⃣ technician_earnings table
  const { data: techEarn } = await supabase
    .from("technician_earnings")
    .select("amount")
    .eq("technician_uuid", user_id);

  let techEarnTotal = 0;
  techEarn?.forEach(t => techEarnTotal += Number(t.amount || 0));

  // FINAL TOTAL
  const grandTotal =
    jobTotal +
    jobBonus -
    jobPenalty +
    earningsTotal +
    payoutTotal +
    payrollTotal +
    techEarnTotal;

  container.innerHTML = `
    <div class="earn-card">
      <div class="earn-title">Total Earnings</div>
      <div class="earn-value">$${grandTotal.toFixed(2)}</div>
      <div class="earn-sub">Combined from jobs, payouts, payroll, and earnings logs</div>
    </div>

    <div class="earn-card">
      <div class="earn-title">Job Earnings</div>
      <div class="earn-value">$${jobTotal.toFixed(2)}</div>
      <div class="earn-sub">Bonus: $${jobBonus.toFixed(2)} | Penalty: -$${jobPenalty.toFixed(2)}</div>
    </div>

    <div class="earn-card">
      <div class="earn-title">Earnings Table</div>
      <div class="earn-value">$${earningsTotal.toFixed(2)}</div>
    </div>

    <div class="earn-card">
      <div class="earn-title">Payouts</div>
      <div class="earn-value">$${payoutTotal.toFixed(2)}</div>
    </div>

    <div class="earn-card">
      <div class="earn-title">Payroll</div>
      <div class="earn-value">$${payrollTotal.toFixed(2)}</div>
    </div>

    <div class="earn-card">
      <div class="earn-title">Technician Earnings Logs</div>
      <div class="earn-value">$${techEarnTotal.toFixed(2)}</div>
    </div>

    <h2 class="section-title">Payout Periods</h2>
    ${payouts?.map(p => `
      <div class="list-card">
        <strong>$${p.amount}</strong><br>
        ${p.period_start} → ${p.period_end}<br>
        Status: ${p.status}
      </div>
    `).join("")}
  `;
}

loadEarnings();
