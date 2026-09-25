document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = new FormData(e.target);

  const full_name = form.get("full_name");
  const email = form.get("email");
  const phone = form.get("phone");
  const address = form.get("address");
  const password = form.get("password");

  const errorBox = document.getElementById("registerError");
  errorBox.textContent = "";

  // 1️⃣ Create Supabase Auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password
  });

  if (authError) {
    errorBox.textContent = "Registration failed. Email may already be in use.";
    return;
  }

  // 2️⃣ Create client record
  const { data: clientData, error: clientError } = await supabase
    .from("clients")
    .insert({
      full_name,
      email,
      phone,
      address,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (clientError) {
    errorBox.textContent = "Account created, but client record failed.";
    return;
  }

  // 3️⃣ Redirect to dashboard
  window.location.href = `client-dashboard.html?client_id=${clientData.client_id}`;
});
