// -----------------------------
// ROLE SELECTION
// -----------------------------
let selectedRole = null;

// Attach click listeners to role buttons
document.querySelectorAll(".role-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    selectedRole = btn.dataset.role;

    // Visual feedback (optional)
    document.querySelectorAll(".role-btn").forEach(b => b.classList.remove("active-role"));
    btn.classList.add("active-role");

    console.log("Selected role:", selectedRole);
  });
});

// -----------------------------
// LOGIN SUBMISSION
// -----------------------------
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const errorBox = document.getElementById("loginError");
  errorBox.textContent = "";

  // Ensure role is selected
  if (!selectedRole) {
    errorBox.textContent = "Please select a role.";
    return;
  }

  // Get form values
  const form = new FormData(e.target);
  const email = form.get("email");
  const password = form.get("password");

  // Ensure Supabase is initialized
  if (typeof supabase === "undefined") {
    errorBox.textContent = "Supabase is not initialized.";
    console.error("Supabase object is undefined.");
    return;
  }

  try {
    // Authenticate
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      errorBox.textContent = "Invalid email or password.";
      console.error(error);
      return;
    }

    // -----------------------------
    // ROLE‑BASED REDIRECTS
    // -----------------------------
    if (selectedRole === "admin") {
      window.location.href = "/admin_dashboard.html";
      return;
    }

    if (selectedRole === "technician") {
      window.location.href = "/tech_dashboard.html";
      return;
    }

    if (selectedRole === "fsc") {
      window.location.href = "/fsc_dashboard.html";
      return;
    }

    if (selectedRole === "woc") {
      window.location.href = "/woc_dashboard.html";
      return;
    }

  } catch (err) {
    errorBox.textContent = "A connection error occurred.";
    console.error(err);
  }
});
