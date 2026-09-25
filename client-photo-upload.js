async function loadCurrentPhoto() {
  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");

  const { data, error } = await supabase
    .from("clients")
    .select("profile_photo")
    .eq("id", client_id)
    .single();

  const img = document.getElementById("currentPhoto");

  if (error || !data.profile_photo) {
    img.src = "";
    return;
  }

  img.src = data.profile_photo;
}

document.getElementById("uploadBtn").addEventListener("click", async () => {
  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");

  const fileInput = document.getElementById("photoInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a photo first.");
    return;
  }

  const fileName = `client-${client_id}-${Date.now()}`;

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("client_photos")
    .upload(fileName, file);

  if (uploadError) {
    alert("Upload failed.");
    console.error(uploadError);
    return;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("client_photos")
    .getPublicUrl(fileName);

  const photoURL = urlData.publicUrl;

  // Save URL to clients.profile_photo
  const { error: updateError } = await supabase
    .from("clients")
    .update({ profile_photo: photoURL })
    .eq("id", client_id);

  if (updateError) {
    alert("Failed to update client photo.");
    return;
  }

  alert("Photo updated!");
  document.getElementById("currentPhoto").src = photoURL;
});

loadCurrentPhoto();
