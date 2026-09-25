const menu = document.getElementById("sideMenu");
const menuBtn = document.getElementById("menuBtn");

menuBtn.addEventListener("click", () => {
  menu.classList.toggle("open");
});

function goTo(page) {
  const params = new URLSearchParams(window.location.search);
  const client_id = params.get("client_id");
  window.location.href = `${page}?client_id=${client_id}`;
}

async function logout() {
  await supabase.auth.signOut();
  window.location.href = "client-login.html";
}
