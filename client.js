async function loadClient() {
  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("client_id", client_id)
    .single();

  if (error) {
    document.getElementById("clientProfile").innerHTML = "<p>Error loading client.</p>";
    return;
  }

  const c = data;

  document.getElementById("clientProfile").innerHTML = `
    <div class="client-card">

      <img class="client-photo"
           src="${c.profile_photo || ''}"
           alt="Client Photo">

      <div class="client-field">
        <label>full_name</label>
        <span>${c.full_name || ''}</span>
      </div>

      <div class="client-field">
        <label>email</label>
        <span>${c.email || ''}</span>
      </div>

      <div class="client-field">
        <label>phone</label>
        <span>${c.phone || ''}</span>
      </div>

      <div class="client-field">
        <label>address</label>
        <span>${c.address || ''}</span>
      </div>

      <div class="client-field">
        <label>lat / lng</label>
        <span>${c.lat || ''} / ${c.lng || ''}</span>
      </div>

      <div class="client-field">
        <label>status</label>
        <span>${c.status || ''}</span>
      </div>

      <div class="client-field">
        <label>preferred_contact</label>
        <span>${c.preferred_contact || ''}</span>
      </div>

      <div class="client-field">
        <label>notes</label>
        <span>${c.notes || ''}</span>
      </div>

      <button class="view-btn" onclick="viewDocuments('${c.client_id}')">
        View Documents
      </button>

      <button class="view-btn" onclick="viewJobs('${c.client_id}')">
        View Jobs
      </button>

    </div>
  `;
}

function viewDocuments(client_id) {
  window.location.href = `client-documents.html?client_id=${client_id}`;
}

function viewJobs(client_id) {
  window.location.href = `client-jobs.html?client_id=${client_id}`;
}

loadClient();
