import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';

const router = express.Router();
const DATA_DIR = path.join(__dirname, '../data');

router.get('/faq', (req, res) => {
  const filePath = path.join(DATA_DIR, 'faq.json');
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read FAQ data' });
  }
});

router.get('/sop', (req, res) => {
  const filePath = path.join(DATA_DIR, 'sop.json');
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read SOP data' });
  }
});

// Add more routes as needed...

export default router;
