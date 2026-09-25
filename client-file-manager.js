async function loadFiles() {
  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");

  const { data: client } = await supabase
    .from("clients")
    .select("documents")
    .eq("id", client_id)
    .single();

  const docs = client.documents || {};
  const container = document.getElementById("fileList");
  container.innerHTML = "";

  Object.entries(docs).forEach(([name, url]) => {
    const card = document.createElement("div");
    card.className = "file-card";

    card.innerHTML = `
      <div class="file-title">${name}</div>
      <a href="${url}" target="_blank">View / Download</a>

      <div class="file-actions">
        <button class="file-btn" onclick="deleteFile('${name}')">Delete</button>
      </div>
    `;

    container.appendChild(card);
  });

  if (Object.keys(docs).length === 0) {
    container.innerHTML = "<p>No files uploaded.</p>";
  }
}

document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");

  const form = new FormData(e.target);
  const docName = form.get("doc_name");
  const file = form.get("file");

  const messageBox = document.getElementById("uploadMessage");
  messageBox.textContent = "";

  const fileName = `client-${client_id}-${Date.now()}-${file.name}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("client_documents")
    .upload(fileName, file);

  if (uploadError) {
    messageBox.style.color = "red";
    messageBox.textContent = "Upload failed.";
    return;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("client_documents")
    .getPublicUrl(fileName);

  const fileURL = urlData.publicUrl;

  // Update JSONB field
  const { data: client } = await supabase
    .from("clients")
    .select("documents")
    .eq("id", client_id)
    .single();

  const docs = client.documents || {};
  docs[docName] = fileURL;

  const { error: saveError } = await supabase
    .from("clients")
    .update({ documents: docs })
    .eq("id", client_id);

  if (saveError) {
    messageBox.style.color = "red";
    messageBox.textContent = "Failed to save file.";
    return;
  }

  messageBox.style.color = "green";
  messageBox.textContent = "File uploaded successfully!";
  loadFiles();
});

async function deleteFile(name) {
  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");

  // Load current docs
  const { data: client } = await supabase
    .from("clients")
    .select("documents")
    .eq("id", client_id)
    .single();

  const docs = client.documents || {};
  const fileURL = docs[name];

  // Extract filename from URL
  const path = fileURL.split("/").pop();

  // Delete from storage
  await supabase.storage
    .from("client_documents")
    .remove([path]);

  // Remove from JSONB
  delete docs[name];

  await supabase
    .from("clients")
    .update({ documents: docs })
    .eq("id", client_id);

  loadFiles();
}

loadFiles();
