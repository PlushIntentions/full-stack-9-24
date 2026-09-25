function selectRole(el) {
  document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  selectedRole = el.dataset.role;
  document.getElementById('btn-label').textContent = ROLE_LABELS[selectedRole];
  document.getElementById('error-msg').classList.remove('show');
}

async function doLogin() {
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errEl    = document.getElementById('error-msg');
  const btn      = document.getElementById('access-btn');
  const spinner  = document.getElementById('spinner');
  const label    = document.getElementById('btn-label');

  errEl.classList.remove('show');

  if (!email || !password) {
    errEl.textContent = 'Please enter your email and password.';
    errEl.classList.add('show');
    return;
  }

  // Loading state
  btn.disabled = true;
  label.style.display = 'none';
  spinner.style.display = 'block';

  // FIRST SUPABASE FLOW — no profiles table
  const { data, error } = await sb.auth.signInWithPassword({
    email,
    password
  });

  // Restore button
  spinner.style.display = 'none';
  label.style.display = 'block';
  btn.disabled = false;

  if (error) {
    errEl.textContent = 'Invalid email or password. Please try again.';
    errEl.classList.add('show');
    return;
  }

  // Redirect based ONLY on selectedRole (original flow)
  window.location.href = ROLE_ROUTES[selectedRole];
}

function redirectByRole(user) {
  // FIRST SUPABASE FLOW — no DB role lookup
  // Just send them to whatever role they last selected
  window.location.href = ROLE_ROUTES[selectedRole];
}

function togglePw() {
  const input = document.getElementById('password');
  input.type = input.type === 'password' ? 'text' : 'password';
}
