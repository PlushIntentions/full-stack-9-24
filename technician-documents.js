async function loadDocuments() {
  const params = new URLSearchParams(window.location.search);
  const user_id = params.get("user_id");

  const { data, error } = await supabase
    .from("technicians")
    .select("documents, full_name")
    .eq("user_id", user_id)
    .single();

  if (error) {
    document.getElementById("docsContainer").innerHTML = "<p>Error loading documents.</p>";
    return;
  }

  const docs = data.documents;
  const container = document.getElementById("docsContainer");

  if (!docs || Object.keys(docs).length === 0) {
    container.innerHTML = "<p>No documents uploaded.</p>";
    return;
  }

  container.innerHTML = "";

  Object.entries(docs).forEach(([key, value]) => {
    const card = document.createElement("div");
    card.className = "doc-card";

    let linksHTML = "";

    if (Array.isArray(value)) {
      value.forEach((url, i) => {
        linksHTML += `<a class="doc-link" href="${url}" target="_blank">View ${key} #${i + 1}</a>`;
      });
    } else {
      linksHTML = `<a class="doc-link" href="${value}" target="_blank">View ${key}</a>`;
    }

    card.innerHTML = `
      <div class="doc-title">${key}</div>
      ${linksHTML}
    `;

    container.appendChild(card);
  });
}

loadDocuments();
