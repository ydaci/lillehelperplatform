import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // augmente si besoin

// --- CONFIG DB : adapte ces valeurs ---
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const PORT = process.env.PORT || 5000;
// ----------------------------------------

let pool;
async function initDb() {
  pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  // Quick check
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS two');
    console.log('✅ DB connection OK, test query result:', rows[0].two);
  } catch (err) {
    console.error('❌ DB connection error:', err);
    process.exit(1);
  }
}

// Helper : check email exists in any auth table
async function emailExists(email) {
  const tables = ['Teacher', 'Student', 'Administrator'];
  for (const table of tables) {
    const [rows] = await pool.query(`SELECT id FROM \`${table}\` WHERE Email = ? LIMIT 1`, [email]);
    if (rows.length > 0) return true;
  }
  return false;
}

// Route: signup, insert
app.post('/api/signup', async (req, res) => {
  try {
    // Accept both lower/upper case role strings from frontend
    let { role, firstName, lastName, email, password, description, video } = req.body || {};

    console.log('📥 /api/signup payload:', { role, firstName, lastName, email, description, video });

    // Basic validation
    if (!role || !email || !password) {
      return res.status(400).json({ success: false, error: 'role, email and password are required' });
    }

    role = String(role).trim();

    // Normalize role values you expect (accept "Learner" or "Student" etc.)
    let roleNormalized;
    if (/^teacher$/i.test(role)) roleNormalized = 'Teacher';
    else if (/^(learner|student)$/i.test(role)) roleNormalized = 'Student';
    else if (/^(admin|administrator)$/i.test(role)) roleNormalized = 'Administrator';
    else return res.status(400).json({ success: false, error: 'Invalid role' });

    // Validate email simple
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    // Check duplicate email across all three tables
    const exists = await emailExists(email);
    if (exists) {
      return res.status(409).json({ success: false, error: 'Email already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Build query & params depending on roleNormalized
    let sql, params;
    if (roleNormalized === 'Teacher') {
      sql = `INSERT INTO Teacher (FirstName, LastName, Email, Password, Description, Video) VALUES (?, ?, ?, ?, ?, ?)`;
      params = [
        firstName || null,
        lastName || null,
        email,
        hashedPassword,
        description || null,
        video || null,
      ];
    } else if (roleNormalized === 'Student') {
      sql = `INSERT INTO Student (FirstName, LastName, Email, Password, Description) VALUES (?, ?, ?, ?, ?)`;
      params = [
        firstName || null,
        lastName || null,
        email,
        hashedPassword,
        description || null,
      ];
    } else if (roleNormalized === 'Administrator') {
      sql = `INSERT INTO Administrator (FirstName, LastName, Email, Password) VALUES (?, ?, ?, ?)`;
      params = [
        firstName || null,
        lastName || null,
        email,
        hashedPassword,
      ];
    } else {
      return res.status(400).json({ success: false, error: 'Unhandled role' });
    }

    // Execute insert
    const [result] = await pool.query(sql, params);

    console.log('✅ Insert OK, insertId:', result.insertId, 'table:', roleNormalized);
    return res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('❌ /api/signup error:', err);
    // try to give a sensible message
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Login

app.post('/api/login', async (req, res) => {
  const { role, email, password } = req.body;

  if (!role || !email || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    // Sélectionne la table selon le rôle
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

    // Vérifie dans la bonne table
    const [rows] = await pool.query(`SELECT * FROM ${tableName} WHERE Email = ?`, [email]);

    console.log(req.body);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];

    // Vérifie le mot de passe hashé
    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Succès
    res.json({
      user: {
        id: user.id,
        firstName: user.FirstName,
        lastName: user.LastName,
        role,
      },
    });
  } catch (err) {
    console.error('❌ Server error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint pour récupérer les événements
app.get('/api/teachers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Teacher');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get("/api/events", async (req, res) => {
  try {
    const { dateFilter } = req.query;

    // La colonne eventDateReal est déjà DATE
    let query = "SELECT * FROM Event";
    const params = [];

    if (dateFilter === "today") {
      query += " WHERE eventDateReal = CURDATE()";
    } else if (dateFilter === "week") {
      query += " WHERE YEARWEEK(eventDateReal, 1) = YEARWEEK(CURDATE(), 1)";
    } else if (dateFilter === "month") {
      query += " WHERE YEAR(eventDateReal) = YEAR(CURDATE()) AND MONTH(eventDateReal) = MONTH(CURDATE())";
    }

    const [rows] = await pool.query(query, params);
    res.json(rows || []); // jamais undefined
  } catch (err) {
    console.error("Erreur backend /api/events :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Endpoint pour ajouter un événement
app.post('/api/events', async (req, res) => {
  try {
    const { title, eventDate, frequency, location, description, type } = req.body;

    if (!title || !eventDate ||!frequency || !location || !description) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    const [result] = await pool.query(
      'INSERT INTO Event (title, eventDate, frequency, location, description) VALUES (?, ?, ?, ?, ?)',
      [title, eventDate, frequency, location, description, type || null]
    );

    // GET /api/teachers
  


    // Retourne l'événement inséré avec son ID
    const newEvent = { id: result.insertId, title, eventDate, frequency, location, description, type };
    res.status(201).json(newEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la création de l’événement.' });
  }
});


// Start server after DB init
const PORT = process.env.PORT || 5000;
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
  });
});
