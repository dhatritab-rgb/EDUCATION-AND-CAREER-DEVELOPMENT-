const messageBox = document.getElementById('messageBox');
const STORAGE_KEYS = { users: 'careerpath-users', session: 'careerpath-session' };

function setMessage(text, isError = false) {
  if (!messageBox) return;
  messageBox.textContent = text;
  messageBox.style.color = isError ? '#dc2626' : '#0f766e';
}

function readUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '{}');
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.session) || 'null');
  } catch {
    return null;
  }
}

function setSession(user) {
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify({ name: user.name, email: user.email }));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.session);
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const users = readUsers();
  const user = users[email];

  if (!user) {
    setMessage('No account found for that email.', true);
    return;
  }

  const passwordHash = await hashPassword(password);
  if (passwordHash !== user.passwordHash) {
    setMessage('Invalid password. Please try again.', true);
    return;
  }

  setSession(user);
  setMessage('Login successful. Redirecting...');
  window.location.href = 'dashboard.html';
}

async function handleRegister(event) {
  event.preventDefault();
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;

  if (!name || !email || password.length < 8) {
    setMessage('Please enter a valid name, email, and a password of at least 8 characters.', true);
    return;
  }

  const users = readUsers();
  if (users[email]) {
    setMessage('That email is already registered.', true);
    return;
  }

  const passwordHash = await hashPassword(password);
  users[email] = { name, email, passwordHash };
  saveUsers(users);
  setMessage('Account created successfully. You can sign in now.');
  document.getElementById('registerForm').reset();
}

function checkSession() {
  if (getSession()) {
    window.location.href = 'dashboard.html';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);
  if (registerForm) registerForm.addEventListener('submit', handleRegister);
  checkSession();
});
