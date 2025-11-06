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
let isPostgres = false;

// --- INITIALISATION DE LA DB --- //
async function initDb() {
  console.log('🔧 Démarrage de l’initialisation de la base de données...');
  console.log('🌍 DATABASE_URL =', DATABASE_URL || 'Non définie');
  console.log('🧩 Environnement Vercel =', !!process.env.VERCEL);

  // Si DATABASE_URL existe, on utilise PostgreSQL (Supabase)
  if (DATABASE_URL && DATABASE_URL.length > 0) {
    console.log('🌐 Utilisation PostgreSQL (Supabase)');
    isPostgres = true;
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    try {
      const client = await pool.connect();
      const { rows } = await client.query('SELECT NOW()');
      console.log('✅ Connecté à Supabase PostgreSQL à', rows[0].now);
      client.release();
    } catch (err) {
      console.error('❌ Erreur de connexion PostgreSQL:', err.message);
      process.exit(1);
    }
    return; // 🔹 Important : on sort ici pour ne pas essayer MySQL
  }

  // Sinon, on tombe sur MySQL local
  console.log('💻 Mode local → MySQL');
  try {
    pool = await mysql.createPool({
      host: DB_HOST || 'localhost',
      user: DB_USER || 'root',
      password: DB_PASSWORD || '',
      database: DB_NAME || 'lingodb',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    const [rows] = await pool.query('SELECT 1 + 1 AS test');
    console.log('✅ Connecté à MySQL, test OK:', rows[0].test);
  } catch (err) {
    console.error('❌ Erreur MySQL locale:', err.message);
    process.exit(1);
  }
}


// --- Helper unifié pour exécuter des requêtes --- //
async function queryDB(sql, params = []) {
  if (isPostgres) {
    let index = 0;
    const pgSql = sql.replace(/\?/g, () => `$${++index}`);
    const result = await pool.query(pgSql, params);
    return result.rows;
  } else {
    const [rows] = await pool.query(sql, params);
    return rows;
  }
}

// --- Vérifie si un email existe --- //
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
      return res.status(400).json({ success: false, error: 'role, email et password sont requis' });
    }

    role = String(role).trim();
    let roleNormalized;
    if (/^teacher$/i.test(role)) roleNormalized = 'Teacher';
    else if (/^(learner|student)$/i.test(role)) roleNormalized = 'Student';
    else if (/^(admin|administrator)$/i.test(role)) roleNormalized = 'Administrator';
    else return res.status(400).json({ success: false, error: 'Rôle invalide' });

    const exists = await emailExists(email);
    if (exists) {
      return res.status(409).json({ success: false, error: 'Email déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let sql, params;
    if (roleNormalized === 'Teacher') {
      sql = `INSERT INTO Teacher (FirstName, LastName, Email, Password, Description, Video) VALUES (?, ?, ?, ?, ?, ?)`;
      params = [firstName || null, lastName || null, email, hashedPassword, description || null, video || null];
    } else if (roleNormalized === 'Student') {
      sql = `INSERT INTO Student (FirstName, LastName, Email, Password, Description) VALUES (?, ?, ?, ?, ?)`;
      params = [firstName || null, lastName || null, email, hashedPassword, description || null];
    } else {
      sql = `INSERT INTO Administrator (FirstName, LastName, Email, Password) VALUES (?, ?, ?, ?)`;
      params = [firstName || null, lastName || null, email, hashedPassword];
    }

    await queryDB(sql, params);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ /api/signup error:', err.message);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// --- LOGIN --- //
app.post('/api/login', async (req, res) => {
  const { role, email, password } = req.body;

  if (!role || !email || !password) {
    return res.status(400).json({ message: 'Champs manquants' });
  }

  try {
    const tableMap = { Admin: 'Administrator', Teacher: 'Teacher', Learner: 'Student' };
    const table = tableMap[role];
    if (!table) return res.status(400).json({ message: 'Rôle invalide' });

    const rows = await queryDB(`SELECT * FROM ${table} WHERE Email = ?`, [email]);
    if (rows.length === 0) return res.status(401).json({ message: 'Identifiants invalides' });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) return res.status(401).json({ message: 'Identifiants invalides' });

    res.json({
      user: {
        id: user.id,
        firstName: user.FirstName,
        lastName: user.LastName,
        role,
      },
    });
  } catch (err) {
    console.error('❌ /api/login error:', err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// --- TEACHERS --- //
app.get('/api/teachers', async (req, res) => {
  try {
    const rows = await queryDB('SELECT * FROM Teacher');
    res.json(rows);
  } catch (err) {
    console.error('❌ /api/teachers error:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// --- EVENTS --- //
app.get('/api/events', async (req, res) => {
  try {
    const { dateFilter } = req.query;
    let query = 'SELECT * FROM Event';
    if (dateFilter === 'today') {
      query += isPostgres ? " WHERE eventDateReal = CURRENT_DATE" : " WHERE DATE(eventDateReal) = CURDATE()";
    } else if (dateFilter === 'week') {
      query += isPostgres
        ? " WHERE DATE_PART('week', eventDateReal) = DATE_PART('week', CURRENT_DATE)"
        : " WHERE YEARWEEK(eventDateReal, 1) = YEARWEEK(CURDATE(), 1)";
    } else if (dateFilter === 'month') {
      query += isPostgres
        ? " WHERE DATE_PART('month', eventDateReal) = DATE_PART('month', CURRENT_DATE)"
        : " WHERE MONTH(eventDateReal) = MONTH(CURDATE())";
    }

    const rows = await queryDB(query);
    res.json(rows || []);
  } catch (err) {
    console.error('❌ /api/events error:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const { title, eventDate, frequency, location, description } = req.body;
    if (!title || !eventDate || !frequency || !location || !description) {
      return res.status(400).json({ error: 'Champs requis manquants.' });
    }

    const sql = 'INSERT INTO Event (title, eventDate, frequency, location, description) VALUES (?, ?, ?, ?, ?)';
    await queryDB(sql, [title, eventDate, frequency, location, description]);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('❌ /api/events POST error:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// --- START SERVER --- //
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
    console.log(`📡 Mode actuel : ${isPostgres ? 'Supabase (PostgreSQL)' : 'Local (MySQL)'}`);
  });
});
