var loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', function () {
    var username = document.getElementById('login-username').value.trim();
    localStorage.setItem('pft_logged_in', 'true');
    localStorage.setItem('pft_current_user', username);
  });
}