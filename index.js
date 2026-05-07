const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config(); // import o'rniga shunday yoziladi

const app = express();

app.use(cors());
app.use(express.json());

// Baza bilan bog'lanish - Render uchun eng to'g'ri variant
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // .env dagi uzun linkni oladi
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// GET so'rovi
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Xatolik yuz berdi" });
  }
});

// POST so'rovi
app.post('/users', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name kiritilmadi" });

  try {
    const newUser = await pool.query(
      'INSERT INTO users (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Saqlashda xatolik yuz berdi" });
  }
});

// Portni Render beradigan o'zgaruvchiga bog'laymiz
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishlamoqda...`);
});