document.getElementById("newPasswordForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = new FormData(e.target);
  const password = form.get("password");

  const messageBox = document.getElementById("newPassMessage");
  messageBox.textContent = "";

  const { data, error } = await supabase.auth.updateUser({
    password
  });

  if (error) {
    messageBox.style.color = "red";
    messageBox.textContent = "Failed to update password.";
    return;
  }

  messageBox.style.color = "green";
  messageBox.textContent = "Password updated successfully.";

  setTimeout(() => {
    window.location.href = "client-login.html";
  }, 1500);
});
