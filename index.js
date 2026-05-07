const express = require('express');
const { Pool } = require('pg');
const cors = require('cors'); // 1. Birinchi importlar
import dotenv from 'dotenv';
dotenv.config();

const app = express(); // 2. KEYIN app ni yaratamiz

app.use(cors()); // 3. ENDI cors ni ishlatsak bo'ladi
app.use(express.json()); // JSON o'qish uchun

// Baza bilan bog'lanish
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD, // Parol joyida, super!
  port:process.env.DB_PORT,
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

app.listen(3000, () => {
  console.log('Server 3000-portda yondi: http://localhost:3000');
});