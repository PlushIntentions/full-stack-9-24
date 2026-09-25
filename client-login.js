document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = new FormData(e.target);
  const email = form.get("email");
  const password = form.get("password");

  const errorBox = document.getElementById("loginError");
  errorBox.textContent = "";

  // 1️⃣ Supabase Auth Login
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (authError) {
    errorBox.textContent = "Invalid email or password.";
    return;
  }

  const user = authData.user;

  // 2️⃣ Find matching client record
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("*")
    .eq("email", email)
    .single();

  if (clientError || !client) {
    errorBox.textContent = "No client account found for this email.";
    return;
  }

  // 3️⃣ Redirect to client dashboard
  window.location.href = `client.html?client_id=${client.client_id}`;
});
