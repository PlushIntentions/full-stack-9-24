async function loadNotifications(filters = {}) {
  const { type, start, end } = filters;

  let query = supabase.from("notifications").select("*");

  if (type) query = query.eq("recipient_type", type);
  if (start) query = query.gte("created_at", start + "T00:00:00");
  if (end) query = query.lte("created_at", end + "T23:59:59");

  const { data: notifs } = await query.order("created_at", { ascending: false });

  const container = document.getElementById("notifList");
  container.innerHTML = "";

  notifs?.forEach(n => {
    const card = document.createElement("div");
    card.className = "notif-card";

    card.innerHTML = `
      <div class="notif-title">${n.title}</div>
      <div class="notif-meta">${n.recipient_type.toUpperCase()}</div>
      <div class="notif-meta">Recipient: ${n.recipient_id || "Broadcast"}</div>
      <div class="notif-meta">${new Date(n.created_at).toLocaleString()}</div>
      <div class="notif-content">${n.message}</div>
      <button class="edit-btn" onclick="deleteNotif(${n.id})">Delete</button>
    `;

    container.appendChild(card);
  });

  if (!notifs || notifs.length === 0) {
    container.innerHTML = "<p>No notifications found.</p>";
  }
}

// Apply filters
document.getElementById("applyFilters").addEventListener("click", () => {
  const filters = {
    type: document.getElementById("filterType").value || null,
    start: document.getElementById("filterStart").value || null,
    end: document.getElementById("filterEnd").value || null
  };

  loadNotifications(filters);
});

// Send notification
document.getElementById("sendForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = new FormData(e.target);

  const newNotif = {
    recipient_type: form.get("recipient_type"),
    recipient_id: form.get("recipient_id") || null,
    title: form.get("title"),
    message: form.get("message"),
    created_at: new Date().toISOString()
  };

  const msg = document.getElementById("sendMessage");

  const { error } = await supabase
    .from("notifications")
    .insert(newNotif);

  if (error) {
    msg.style.color = "red";
    msg.textContent = "Failed to send notification.";
    return;
  }

  msg.style.color = "green";
  msg.textContent = "Notification sent!";
  loadNotifications();
});

// Delete notification
async function deleteNotif(id) {
  if (!confirm("Delete this notification?")) return;

  await supabase
    .from("notifications")
    .delete()
    .eq("id", id);

  loadNotifications();
}

loadNotifications();
