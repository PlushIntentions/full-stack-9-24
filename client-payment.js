async function loadInvoices() {
  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");

  const { data: invoices, error } = await supabase
    .from("client_invoices")
    .select("*")
    .eq("client_id", client_id)
    .order("created_at", { ascending: false });

  const list = document.getElementById("invoiceList");
  const select = document.getElementById("invoiceSelect");

  list.innerHTML = "";
  select.innerHTML = "";

  if (error || !invoices || invoices.length === 0) {
    list.innerHTML = "<p>No invoices found.</p>";
    return;
  }

  invoices.forEach(inv => {
    const card = document.createElement("div");
    card.className = "invoice-card";

    card.innerHTML = `
      <div class="invoice-title">Invoice #${inv.id}</div>
      <div class="invoice-meta">Amount: $${Number(inv.total_amount || 0).toFixed(2)}</div>
      <div class="invoice-meta">Status: ${inv.paid ? "Paid" : "Unpaid"}</div>
      <div class="invoice-meta">Created: ${new Date(inv.created_at).toLocaleString()}</div>
    `;

    list.appendChild(card);

    if (!inv.paid) {
      const opt = document.createElement("option");
      opt.value = inv.id;
      opt.textContent = `Invoice #${inv.id} — $${Number(inv.total_amount || 0).toFixed(2)}`;
      select.appendChild(opt);
    }
  });

  if (!select.options.length) {
    select.innerHTML = `<option value="">No unpaid invoices</option>`;
  }
}

document.getElementById("paymentForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = new FormData(e.target);
  const invoice_id = form.get("invoice_id");
  const card_number = form.get("card_number");
  const expiry = form.get("expiry");
  const cvc = form.get("cvc");

  const messageBox = document.getElementById("paymentMessage");
  messageBox.textContent = "";

  if (!invoice_id) {
    messageBox.style.color = "red";
    messageBox.textContent = "No unpaid invoice selected.";
    return;
  }

  // 🔐 Mock payment validation
  if (!card_number || card_number.replace(/\s/g, "").length < 16) {
    messageBox.style.color = "red";
    messageBox.textContent = "Invalid card number.";
    return;
  }

  // Here is where you'd call Stripe/processor in a real integration.

  // ✅ Mark invoice as paid
  const { error } = await supabase
    .from("client_invoices")
    .update({
      paid: true,
      paid_at: new Date().toISOString()
    })
    .eq("id", invoice_id);

  if (error) {
    messageBox.style.color = "red";
    messageBox.textContent = "Payment failed while updating invoice.";
    return;
  }

  messageBox.style.color = "green";
  messageBox.textContent = "Payment successful! Thank you.";

  loadInvoices();
});

loadInvoices();
