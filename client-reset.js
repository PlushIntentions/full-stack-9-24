document.getElementById("resetForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = new FormData(e.target);
  const email = form.get("email");

  const messageBox = document.getElementById("resetMessage");
  messageBox.textContent = "";

  // Supabase password reset
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/client-new-password.html"
  });

  if (error) {
    messageBox.style.color = "red";
    messageBox.textContent = "Unable to send reset link.";
    return;
  }

  messageBox.style.color = "green";
  messageBox.textContent = "A reset link has been sent to your email.";
});
