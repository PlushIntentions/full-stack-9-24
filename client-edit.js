async function loadClient() {
  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("client_id", client_id)
    .single();

  if (error) {
    alert("Error loading client");
    return;
  }

  const form = document.getElementById("editForm");

  form.full_name.value = data.full_name || "";
  form.email.value = data.email || "";
  form.phone.value = data.phone || "";
  form.address.value = data.address || "";
  form.lat.value = data.lat || "";
  form.lng.value = data.lng || "";
  form.status.value = data.status || "";
  form.preferred_contact.value = data.preferred_contact || "";
  form.notes.value = data.notes || "";
}

document.getElementById("editForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");

  const form = new FormData(e.target);

  const updateData = {
    full_name: form.get("full_name"),
    email: form.get("email"),
    phone: form.get("phone"),
    address: form.get("address"),
    lat: Number(form.get("lat")),
    lng: Number(form.get("lng")),
    status: form.get("status"),
    preferred_contact: form.get("preferred_contact"),
    notes: form.get("notes")
  };

  const { error } = await supabase
    .from("clients")
    .update(updateData)
    .eq("client_id", client_id);

  if (error) {
    alert("Update failed");
    console.error(error);
    return;
  }

  alert("Client updated!");
  window.location.href = `client.html?client_id=${client_id}`;
});

function viewDocuments() {
  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");
  window.location.href = `client-documents.html?client_id=${client_id}`;
}

function viewJobs() {
  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");
  window.location.href = `client-jobs.html?client_id=${client_id}`;
}

loadClient();
