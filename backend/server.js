// server.js
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import pkg from 'pg';
dotenv.config();

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- CONFIG --- //
const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DATABASE_URL,
  PORT = 5000
} = process.env;

let pool;

// --- CHOIX DU MODE : LOCAL (MySQL) OU DEPLOIEMENT (PostgreSQL) --- //
async function initDb() {
  if (DATABASE_URL) {
    console.log('🌐 Using PostgreSQL (Supabase) connection');
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    try {
      const client = await pool.connect();
      await client.query('SELECT NOW()');
      console.log('✅ Connected to PostgreSQL successfully');
      client.release();
    } catch (err) {
      console.error('❌ PostgreSQL connection error:', err);
      process.exit(1);
    }
  } else {
    console.log('💻 Using local MySQL connection');
    pool = await mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    try {
      const [rows] = await pool.query('SELECT 1 + 1 AS two');
      console.log('✅ MySQL connection OK, test query result:', rows[0].two);
    } catch (err) {
      console.error('❌ MySQL connection error:', err);
      process.exit(1);
    }
  }
}

// --- Helper unifié pour exécuter des requêtes --- //
async function queryDB(sql, params = []) {
  if (DATABASE_URL) {
    // PostgreSQL → remplacer les ? par $1, $2, ...
    const pgSql = sql.replace(/\?/g, (_, i, s) => `$${(s.slice(0, i).match(/\?/g) || []).length + 1}`);
    const result = await pool.query(pgSql, params);
    return result.rows;
  } else {
    // MySQL
    const [rows] = await pool.query(sql, params);
    return rows;
  }
}

// --- Vérifie si un email existe dans une des tables --- //
async function emailExists(email) {
  const tables = ['Teacher', 'Student', 'Administrator'];
  for (const table of tables) {
    const rows = await queryDB(`SELECT id FROM ${table} WHERE Email = ? LIMIT 1`, [email]);
    if (rows.length > 0) return true;
  }
  return false;
}

// --- SIGNUP --- //
app.post('/api/signup', async (req, res) => {
  try {
    let { role, firstName, lastName, email, password, description, video } = req.body || {};

    if (!role || !email || !password) {
      return res.status(400).json({ success: false, error: 'role, email and password are required' });
    }

    role = String(role).trim();
    let roleNormalized;
    if (/^teacher$/i.test(role)) roleNormalized = 'Teacher';
    else if (/^(learner|student)$/i.test(role)) roleNormalized = 'Student';
    else if (/^(admin|administrator)$/i.test(role)) roleNormalized = 'Administrator';
    else return res.status(400).json({ success: false, error: 'Invalid role' });

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    const exists = await emailExists(email);
    if (exists) {
      return res.status(409).json({ success: false, error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let sql, params;
    if (roleNormalized === 'Teacher') {
      sql = `INSERT INTO Teacher (FirstName, LastName, Email, Password, Description, Video) VALUES (?, ?, ?, ?, ?, ?)`;
      params = [firstName || null, lastName || null, email, hashedPassword, description || null, video || null];
    } else if (roleNormalized === 'Student') {
      sql = `INSERT INTO Student (FirstName, LastName, Email, Password, Description) VALUES (?, ?, ?, ?, ?)`;
      params = [firstName || null, lastName || null, email, hashedPassword, description || null];
    } else if (roleNormalized === 'Administrator') {
      sql = `INSERT INTO Administrator (FirstName, LastName, Email, Password) VALUES (?, ?, ?, ?)`;
      params = [firstName || null, lastName || null, email, hashedPassword];
    }

    await queryDB(sql, params);
    return res.json({ success: true });
  } catch (err) {
    console.error('❌ /api/signup error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// --- LOGIN --- //
app.post('/api/login', async (req, res) => {
  const { role, email, password } = req.body;

  if (!role || !email || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    let tableName;
    switch (role) {
      case 'Admin':
        tableName = 'Administrator';
        break;
      case 'Teacher':
        tableName = 'Teacher';
        break;
      case 'Learner':
        tableName = 'Student';
        break;
      default:
        return res.status(400).json({ message: 'Invalid role' });
    }

    const rows = await queryDB(`SELECT * FROM ${tableName} WHERE Email = ?`, [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      user: {
        id: user.id,
        firstName: user.FirstName,
        lastName: user.LastName,
        role,
      },
    });
  } catch (err) {
    console.error('❌ /api/login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- GET TEACHERS --- //
app.get('/api/teachers', async (req, res) => {
  try {
    const rows = await queryDB('SELECT * FROM Teacher');
    res.json(rows);
  } catch (err) {
    console.error('❌ /api/teachers error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// --- GET EVENTS --- //
app.get('/api/events', async (req, res) => {
  try {
    const dateFilter = req.query.dateFilter;
    let query = 'SELECT * FROM Event';

    if (dateFilter === 'today') {
      query += ' WHERE eventDateReal = CURRENT_DATE';
    } else if (dateFilter === 'week') {
      query += DATABASE_URL
        ? " WHERE DATE_PART('week', eventDateReal) = DATE_PART('week', CURRENT_DATE)"
        : ' WHERE YEARWEEK(eventDateReal, 1) = YEARWEEK(CURDATE(), 1)';
    } else if (dateFilter === 'month') {
      query += DATABASE_URL
        ? " WHERE DATE_PART('month', eventDateReal) = DATE_PART('month', CURRENT_DATE)"
        : ' WHERE YEAR(eventDateReal) = YEAR(CURDATE()) AND MONTH(eventDateReal) = MONTH(CURDATE())';
    }

    const rows = await queryDB(query);
    res.json(rows || []);
  } catch (err) {
    console.error('❌ /api/events error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// --- POST EVENTS --- //
app.post('/api/events', async (req, res) => {
  try {
    const { title, eventDate, frequency, location, description, type } = req.body;

    if (!title || !eventDate || !frequency || !location || !description) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    const sql = 'INSERT INTO Event (title, eventDate, frequency, location, description) VALUES (?, ?, ?, ?, ?)';
    await queryDB(sql, [title, eventDate, frequency, location, description]);

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('❌ /api/events POST error:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la création de l’événement.' });
  }
});

// --- START SERVER --- //
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
  });
});
