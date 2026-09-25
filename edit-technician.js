async function loadTechnician() {
  const params = new URLSearchParams(window.location.search);
  const user_id = params.get("user_id");

  const { data, error } = await supabase
    .from("technicians")
    .select("*")
    .eq("user_id", user_id)
    .single();

  if (error) {
    alert("Error loading technician");
    return;
  }

  const form = document.getElementById("editForm");

  form.full_name.value = data.full_name || "";
  form.phone.value = data.phone || "";
  form.email.value = data.email || "";
  form.skills.value = data.skills || "";
  form.radius.value = data.radius || "";
  form.status.value = data.status || "";
  form.role.value = data.role || "";
  form.available.value = data.available ? "true" : "false";
  form.same_day_service.value = data.same_day_service ? "true" : "false";
  form.lat.value = data.lat || "";
  form.lng.value = data.lng || "";
}

document.getElementById("editForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const params = new URLSearchParams(window.location.search);
  const user_id = params.get("user_id");

  const form = new FormData(e.target);

  const updateData = {
    full_name: form.get("full_name"),
    phone: form.get("phone"),
    email: form.get("email"),
    skills: form.get("skills"),
    radius: Number(form.get("radius")),
    status: form.get("status"),
    role: form.get("role"),
    available: form.get("available") === "true",
    same_day_service: form.get("same_day_service") === "true",
    lat: Number(form.get("lat")),
    lng: Number(form.get("lng"))
  };

  const { error } = await supabase
    .from("technicians")
    .update(updateData)
    .eq("user_id", user_id);

  if (error) {
    alert("Update failed");
    console.error(error);
    return;
  }

  window.location.href = `technician.html?user_id=${user_id}`;
});

loadTechnician();
