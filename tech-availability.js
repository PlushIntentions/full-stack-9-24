async function loadAvailability() {
  const params = new URLSearchParams(window.location.search);
  const tech_id = params.get("tech_id");

  // Current availability flag
  const { data: tech } = await supabase
    .from("technicians")
    .select("available")
    .eq("user_id", tech_id)
    .single();

  document.getElementById("currentAvail").innerHTML = `
    <div class="profile-field">
      <label>Current Status</label>
      <div>${tech.available ? "Available" : "Unavailable"}</div>
    </div>
    <button class="view-btn" onclick="toggleAvailable()">
      Toggle Availability
    </button>
  `;

  // Weekly schedule
  const { data: slots } = await supabase
    .from("technician_availability")
    .select("*")
    .eq("technician_id", tech_id)
    .order("day", { ascending: true });

  const scheduleList = document.getElementById("scheduleList");
  scheduleList.innerHTML = "";

  const dayLabels = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday"
  };

  slots?.forEach(slot => {
    const card = document.createElement("div");
    card.className = "avail-card";

    card.innerHTML = `
      <div class="avail-title">${dayLabels[slot.day]}</div>
      <div class="avail-meta">${slot.start_time} – ${slot.end_time}</div>
      <button class="file-btn" onclick="deleteSlot(${slot.id})">Remove</button>
    `;

    scheduleList.appendChild(card);
  });

  if (!slots || slots.length === 0) {
    scheduleList.innerHTML = "<p>No availability set.</p>";
  }
}

// Add availability slot
document.getElementById("availForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const params = new URLSearchParams(window.location.search);
  const tech_id = params.get("tech_id");

  const form = new FormData(e.target);
  const day = form.get("day");
  const start_time = form.get("start_time");
  const end_time = form.get("end_time");

  const messageBox = document.getElementById("availMessage");
  messageBox.textContent = "";

  if (start_time >= end_time) {
    messageBox.style.color = "red";
    messageBox.textContent = "End time must be after start time.";
    return;
  }

  const { error } = await supabase
    .from("technician_availability")
    .insert({
      technician_id: tech_id,
      day,
      start_time,
      end_time
    });

  if (error) {
    messageBox.style.color = "red";
    messageBox.textContent = "Failed to save availability.";
    return;
  }

  messageBox.style.color = "green";
  messageBox.textContent = "Availability added.";
  loadAvailability();
});

// Toggle global availability
async function toggleAvailable() {
  const params = new URLSearchParams(window.location.search);
  const tech_id = params.get("tech_id");

  const { data: tech } = await supabase
    .from("technicians")
    .select("available")
    .eq("user_id", tech_id)
    .single();

  await supabase
    .from("technicians")
    .update({ available: !tech.available })
    .eq("user_id", tech_id);

  loadAvailability();
}

// Delete slot
async function deleteSlot(id) {
  await supabase
    .from("technician_availability")
    .delete()
    .eq("id", id);

  loadAvailability();
}

loadAvailability();
