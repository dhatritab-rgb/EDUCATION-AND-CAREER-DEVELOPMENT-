const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'careerpath-academy-secure-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: false }
}));

const users = {};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CareerPath Academy backend running' });
});

app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 8) {
    return res.status(400).json({ error: 'Please provide a valid name, email, and password (8+ chars).' });
  }

  if (users[email]) {
    return res.status(409).json({ error: 'This email is already registered.' });
  }

  users[email] = { name, email, password };
  res.status(201).json({ message: 'Account created successfully.' });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users[email];
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  req.session.user = { name: user.name, email: user.email };
  res.json({ message: 'Login successful.', user: req.session.user });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out.' });
  });
});

app.get('/api/session', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  res.json({ user: req.session.user });
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`CareerPath Academy server running on http://localhost:${PORT}`);
});
