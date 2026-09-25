document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = new FormData(e.target);
  const email = form.get("email");
  const password = form.get("password");

  const errorBox = document.getElementById("loginError");
  errorBox.textContent = "";

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    errorBox.textContent = "Invalid email or password.";
    return;
  }

  window.location.href = "/admin_dashboard.html";
});
