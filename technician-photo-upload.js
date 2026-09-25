async function loadCurrentPhoto() {
  const params = new URLSearchParams(window.location.search);
  const user_id = params.get("user_id");

  const { data, error } = await supabase
    .from("technicians")
    .select("profile_photo")
    .eq("user_id", user_id)
    .single();

  const img = document.getElementById("currentPhoto");

  if (error || !data.profile_photo) {
    img.src = "";
    return;
  }

  // If profile_photo is a URL, show it
  img.src = data.profile_photo;
}

document.getElementById("uploadBtn").addEventListener("click", async () => {
  const params = new URLSearchParams(window.location.search);
  const user_id = params.get("user_id");

  const fileInput = document.getElementById("photoInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a photo first.");
    return;
  }

  const fileName = `${user_id}-${Date.now()}`;

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("technician_photos")
    .upload(fileName, file);

  if (uploadError) {
    alert("Upload failed.");
    console.error(uploadError);
    return;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("technician_photos")
    .getPublicUrl(fileName);

  const photoURL = urlData.publicUrl;

  // Save URL to technicians.profile_photo
  const { error: updateError } = await supabase
    .from("technicians")
    .update({ profile_photo: photoURL })
    .eq("user_id", user_id);

  if (updateError) {
    alert("Failed to update technician photo.");
    return;
  }

  alert("Photo updated!");
  document.getElementById("currentPhoto").src = photoURL;
});

loadCurrentPhoto();
