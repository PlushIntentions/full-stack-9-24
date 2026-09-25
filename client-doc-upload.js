async function loadDocuments() {
  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");

  const { data: client } = await supabase
    .from("clients")
    .select("documents")
    .eq("id", client_id)
    .single();

  const docs = client.documents || {};
  const container = document.getElementById("docList");
  container.innerHTML = "";

  Object.entries(docs).forEach(([name, url]) => {
    const card = document.createElement("div");
    card.className = "doc-card";

    card.innerHTML = `
      <div class="doc-title">${name}</div>
      <a class="doc-link" href="${url}" target="_blank">View Document</a>
    `;

    container.appendChild(card);
  });

  if (Object.keys(docs).length === 0) {
    container.innerHTML = "<p>No documents uploaded.</p>";
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
  const { data: uploadData, error: uploadError } = await supabase.storage
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
  const { data: client, error: updateError } = await supabase
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
    messageBox.textContent = "Failed to save document.";
    return;
  }

  messageBox.style.color = "green";
  messageBox.textContent = "Document uploaded successfully!";

  loadDocuments();
});

loadDocuments();
