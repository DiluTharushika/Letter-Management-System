require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      process.env.FRONTEND_URL || "",
    ],
    credentials: true,
  })
);

app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "letter_system",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Health check
app.get("/", (req, res) => res.send("Backend for Letter System is running 🚀"));

// ======================= USER ROUTES =======================

// Register user
app.post("/api/register", async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) return res.status(400).json({ error: "All fields are required" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
    const [result] = await pool.execute(sql, [username, hashedPassword, role]);

    res.status(201).json({
      id: result.insertId,
      username,
      role,
      message: "User registered successfully ✅",
    });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Database insert error" });
  }
});

// User login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.execute("SELECT * FROM users WHERE username = ?", [username]);
    if (rows.length === 0) return res.status(401).json({ error: "Invalid username or password" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid username or password" });

    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      message: "Login successful ✅",
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ======================= LETTER ROUTES =======================

// Get all letters
app.get("/api/letters", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM letters ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching letters:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get single letter
app.get("/api/letters/:id", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM letters WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Letter not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching letter:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Add new letter
app.post("/api/letters", async (req, res) => {
  const { letter_date, address, details, subject_no, letter_type, sent_date } = req.body;

  if (!letter_date || !address || !details || !subject_no || !letter_type) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const sql = `INSERT INTO letters 
      (letter_date, address, details, subject_no, letter_type, sent_date) 
      VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.execute(sql, [
      letter_date,
      address,
      details,
      subject_no,
      letter_type,
      sent_date || null,
    ]);

    res.status(201).json({
      id: result.insertId,
      letter_date,
      address,
      details,
      subject_no,
      letter_type,
      sent_date: sent_date || null,
    });
  } catch (err) {
    console.error("Error inserting letter:", err);
    res.status(500).json({ error: "Database insert error" });
  }
});

// Update letter
app.put("/api/letters/:id", async (req, res) => {
  const { letter_date, address, details, subject_no, letter_type, sent_date } = req.body;
  const { id } = req.params;

  try {
    const sql = `UPDATE letters 
      SET letter_date=?, address=?, details=?, subject_no=?, letter_type=?, sent_date=? 
      WHERE id=?`;
    const [result] = await pool.execute(sql, [
      letter_date,
      address,
      details,
      subject_no,
      letter_type,
      sent_date || null,
      id,
    ]);

    if (result.affectedRows === 0) return res.status(404).json({ error: "Letter not found" });
    res.json({ message: "Letter updated successfully" });
  } catch (err) {
    console.error("Error updating letter:", err);
    res.status(500).json({ error: "Database update error" });
  }
});

// Delete letter
app.delete("/api/letters/:id", async (req, res) => {
  try {
    const [result] = await pool.execute("DELETE FROM letters WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Letter not found" });
    res.json({ message: "Letter deleted successfully" });
  } catch (err) {
    console.error("Error deleting letter:", err);
    res.status(500).json({ error: "Database delete error" });
  }
});

// Start server
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
