async function loadSettings() {
  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", client_id)
    .single();

  const form = document.getElementById("settingsForm");

  form.full_name.value = client.full_name || "";
  form.email.value = client.email || "";
  form.phone.value = client.phone || "";
  form.address.value = client.address || "";
  form.preferred_contact.value = client.preferred_contact || "email";
}

document.getElementById("settingsForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");

  const form = new FormData(e.target);

  const updateData = {
    full_name: form.get("full_name"),
    email: form.get("email"),
    phone: form.get("phone"),
    address: form.get("address"),
    preferred_contact: form.get("preferred_contact")
  };

  const { error } = await supabase
    .from("clients")
    .update(updateData)
    .eq("id", client_id);

  if (error) {
    alert("Failed to update settings.");
    return;
  }

  alert("Settings updated!");
});

document.getElementById("passwordForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = new FormData(e.target);
  const password = form.get("password");

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    alert("Failed to update password.");
    return;
  }

  alert("Password updated!");
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "client-login.html";
});

loadSettings();
