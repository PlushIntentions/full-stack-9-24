async function loadNotes() {
  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");

  const { data, error } = await supabase
    .from("client_notes")
    .select("*")
    .eq("client_id", client_id)
    .order("created_at", { ascending: false });

  const container = document.getElementById("notesList");
  container.innerHTML = "";

  if (error) {
    container.innerHTML = "<p>Error loading notes.</p>";
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = "<p>No notes yet.</p>";
    return;
  }

  data.forEach(note => {
    const card = document.createElement("div");
    card.className = "note-card";

    card.innerHTML = `
      <div class="note-text">${note.note}</div>
      <div class="note-meta">
        Added by: ${note.created_by || "unknown"}<br>
        ${new Date(note.created_at).toLocaleString()}
      </div>
    `;

    container.appendChild(card);
  });
}

document.getElementById("noteForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");

  const form = new FormData(e.target);

  const newNote = {
    client_id,
    note: form.get("note"),
    created_by: form.get("created_by"),
    created_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from("client_notes")
    .insert(newNote);

  if (error) {
    alert("Failed to add note.");
    console.error(error);
    return;
  }

  alert("Note added!");
  loadNotes();
});

loadNotes();
