const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Placeholder for future routes (e.g., auth, CRUD)

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});

