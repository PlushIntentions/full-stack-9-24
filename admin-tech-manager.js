async function loadTechnicians() {
  const { data: techs } = await supabase
    .from("technicians")
    .select("*")
    .order("name", { ascending: true });

  const container = document.getElementById("techList");
  container.innerHTML = "";

  techs?.forEach(t => {
    const card = document.createElement("div");
    card.className = "tech-card";

    card.innerHTML = `
      <div class="tech-title">${t.name}</div>
      <div class="tech-meta">Phone: ${t.phone || "N/A"}</div>
      <div class="tech-meta">Email: ${t.email || "N/A"}</div>
      <div class="tech-meta">Skills: ${t.skills || "None"}</div>
      <div class="tech-meta">Status: ${t.status}</div>
      <div class="tech-meta">Available: ${t.available ? "Yes" : "No"}</div>

      <button class="tech-btn" onclick="editTech('${t.user_id}')">Edit</button>
      <button class="tech-btn" onclick="viewHistory('${t.user_id}')">Job History</button>
      <button class="tech-btn" onclick="viewEarnings('${t.user_id}')">Earnings</button>
      <button class="tech-btn" onclick="viewLocation('${t.user_id}')">Location</button>
      <button class="tech-btn" onclick="toggleActive('${t.user_id}', ${t.active})">
        ${t.active ? "Deactivate" : "Activate"}
      </button>
      <button class="tech-btn" onclick="deleteTech('${t.user_id}')">Delete</button>
    `;

    container.appendChild(card);
  });

  if (!techs || techs.length === 0) {
    container.innerHTML = "<p>No technicians found.</p>";
  }
}

// Add technician
document.getElementById("addTechForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = new FormData(e.target);

  const newTech = {
    name: form.get("name"),
    phone: form.get("phone"),
    email: form.get("email"),
    skills: form.get("skills"),
    status: "active",
    available: true,
    active: true
  };

  const { error } = await supabase
    .from("technicians")
    .insert(newTech);

  const msg = document.getElementById("addMessage");

  if (error) {
    msg.style.color = "red";
    msg.textContent = "Failed to add technician.";
    return;
  }

  msg.style.color = "green";
  msg.textContent = "Technician added!";
  loadTechnicians();
});

// Edit technician
function editTech(tech_id) {
  window.location.href = `admin-tech-edit.html?tech_id=${tech_id}`;
}

// Job history
function viewHistory(tech_id) {
  window.location.href = `admin-tech-history.html?tech_id=${tech_id}`;
}

// Earnings
function viewEarnings(tech_id) {
  window.location.href = `admin-tech-earnings.html?tech_id=${tech_id}`;
}

// Location
async function viewLocation(tech_id) {
  const { data: loc } = await supabase
    .from("technician_locations")
    .select("*")
    .eq("technician_id", tech_id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (!loc) {
    alert("No location data available.");
    return;
  }

  window.open(`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`);
}

// Activate/deactivate
async function toggleActive(tech_id, active) {
  await supabase
    .from("technicians")
    .update({ active: !active })
    .eq("user_id", tech_id);

  loadTechnicians();
}

// Delete technician
async function deleteTech(tech_id) {
  if (!confirm("Are you sure you want to delete this technician?")) return;

  await supabase
    .from("technicians")
    .delete()
    .eq("user_id", tech_id);

  loadTechnicians();
}

loadTechnicians();
