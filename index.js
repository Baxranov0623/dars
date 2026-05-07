const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- MANA SHU QISMNI QO'SHDIK ---
// Bu funksiya server yonganda bazada "users" jadvalini avtomat yaratadi
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      );
    `);
    console.log("Ma'lumotlar bazasi va jadval tayyor!");
  } catch (err) {
    console.error("Jadval yaratishda xato:", err);
  }
};
initDb();
// -------------------------------

app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    // Xatoni aniqroq ko'rish uchun err.message ni qo'shdik
    res.status(500).json({ error: err.message });
  }
});

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
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishlamoqda...`);
});