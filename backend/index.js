const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';

app.use(cors());
app.use(express.json());

// ---------- Helper functions for data storage ----------
const DATA_FILE = path.join(__dirname, 'data.json');
const USERS_FILE = path.join(__dirname, 'users.json');

function loadData() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')); } catch (_) { return []; }
}
function saveData(data) { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); }

function loadUsers() {
  try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8')); } catch (_) { return []; }
}
function saveUsers(users) { fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2)); }

// ---------- Auth middleware ----------
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// ---------- Public routes ----------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Register new user
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  const users = loadUsers();
  if (users.find(u => u.username === username)) return res.status(409).json({ error: 'User already exists' });
  const hashed = await bcrypt.hash(password, 10);
  users.push({ username, password: hashed });
  saveUsers(users);
  res.status(201).json({ message: 'User registered' });
});

// Login and get JWT
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// ---------- Protected CRUD routes (require JWT) ----------
app.get('/api/items', authenticateToken, (req, res) => {
  const items = loadData();
  res.json(items);
});

app.post('/api/items', authenticateToken, (req, res) => {
  const items = loadData();
  const newItem = req.body;
  if (!newItem.id) return res.status(400).json({ error: 'Missing id' });
  items.push(newItem);
  saveData(items);
  res.status(201).json(newItem);
});

app.put('/api/items/:id', authenticateToken, (req, res) => {
  const items = loadData();
  const { id } = req.params;
  const index = items.findIndex(i => i.id == id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  const updated = { ...items[index], ...req.body };
  items[index] = updated;
  saveData(items);
  res.json(updated);
});

app.delete('/api/items/:id', authenticateToken, (req, res) => {
  let items = loadData();
  const { id } = req.params;
  const before = items.length;
  items = items.filter(i => i.id != id);
  if (items.length === before) return res.status(404).json({ error: 'Not found' });
  saveData(items);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
