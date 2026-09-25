async function loadProfile() {
  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");

  const { data: client, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", client_id)
    .single();

  if (error) {
    document.getElementById("profileCard").innerHTML = "<p>Error loading profile.</p>";
    return;
  }

  const card = document.getElementById("profileCard");

  card.innerHTML = `
    ${client.profile_photo ? `<img class="profile-photo" src="${client.profile_photo}" alt="Profile Photo">` : ""}

    <div class="profile-field">
      <label class="profile-label">Name</label>
      <div class="profile-value">${client.name || client.full_name || ""}</div>
    </div>

    <div class="profile-field">
      <label class="profile-label">Email</label>
      <div class="profile-value">${client.email || ""}</div>
    </div>

    <div class="profile-field">
      <label class="profile-label">Phone</label>
      <div class="profile-value">${client.phone || ""}</div>
    </div>

    <div class="profile-field">
      <label class="profile-label">Address</label>
      <div class="profile-value">${client.address || ""}</div>
    </div>

    <div class="profile-field">
      <label class="profile-label">Preferred Contact</label>
      <div class="profile-value">${client.preferred_contact || "email"}</div>
    </div>

    <div class="profile-field">
      <label class="profile-label">Account Created</label>
      <div class="profile-value">${new Date(client.created_at).toLocaleString()}</div>
    </div>
  `;
}

function goTo(page) {
  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");
  window.location.href = `${page}?client_id=${client_id}`;
}

loadProfile();
