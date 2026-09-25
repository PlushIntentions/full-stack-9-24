async function loadAvailability() {
  const params = new URLSearchParams(window.location.search);
  const user_id = params.get("user_id");

  // Load from technicians table
  const { data: tech, error } = await supabase
    .from("technicians")
    .select("available")
    .eq("user_id", user_id)
    .single();

  if (error) {
    alert("Error loading availability");
    return;
  }

  const toggle = document.getElementById("availability-toggle");
  const label = document.getElementById("availability-label");

  toggle.checked = tech.available;
  label.textContent = tech.available ? "Available" : "Unavailable";
}

document.getElementById("availability-toggle").addEventListener("change", (e) => {
  const label = document.getElementById("availability-label");
  label.textContent = e.target.checked ? "Available" : "Unavailable";
});

document.getElementById("saveBtn").addEventListener("click", async () => {
  const params = new URLSearchParams(window.location.search);
  const user_id = params.get("user_id");

  const newAvailability = document.getElementById("availability-toggle").checked;

  // Update technicians.available
  const { error: techError } = await supabase
    .from("technicians")
    .update({ available: newAvailability })
    .eq("user_id", user_id);

  if (techError) {
    alert("Failed to update technician availability");
    return;
  }

  // Update technician_availability table
  const { error: availError } = await supabase
    .from("technician_availability")
    .upsert({
      technician_id: user_id,
      available: newAvailability
    });

  if (availError) {
    alert("Failed to update availability record");
    return;
  }

  alert("Availability updated!");
});

loadAvailability();
