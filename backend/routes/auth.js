import express from 'express';
import multer from 'multer';
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import path from 'path';

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, '../uploads/') });

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'ton_mdp',
  database: 'lingodb',
});

router.post('/signup', upload.single('video'), async (req, res) => {
  try {
    const { role, email, password, firstName, lastName, description } = req.body;
    const video = req.file ? req.file.filename : null;
    const hashedPassword = await bcrypt.hash(password, 10);

    let query = '';
    let params = [];

    if (role === 'Teacher') {
      query = `INSERT INTO Teacher (FirstName, LastName, Email, Password, Description, Video) VALUES (?, ?, ?, ?, ?, ?)`;
      params = [firstName, lastName, email, hashedPassword, description || null, video];
    } else if (role === 'Learner') {
      query = `INSERT INTO Student (FirstName, LastName, Email, Password, Description) VALUES (?, ?, ?, ?, ?)`;
      params = [firstName, lastName, email, hashedPassword, description || null];
    } else if (role === 'Admin') {
      query = `INSERT INTO Administrator (FirstName, LastName, Email, Password) VALUES (?, ?, ?, ?)`;
      params = [firstName, lastName, email, hashedPassword];
    } else {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }

    const [result] = await pool.execute(query, params);
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
