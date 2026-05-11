import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const DATA_DIR = path.join(__dirname, '../data');

// Helper to read JSON file
const readJsonFile = (fileName: string) => {
  const filePath = path.join(DATA_DIR, fileName);
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${fileName}:`, error);
    return null;
  }
};

router.get('/faq', (req, res) => {
  const data = readJsonFile('faq.json');
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to read FAQ data' });
  }
});

router.get('/sop', (req, res) => {
  const data = readJsonFile('sop.json');
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to read SOP data' });
  }
});

router.get('/templates', (req, res) => {
  const data = readJsonFile('templates.json');
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to read templates data' });
  }
});

router.get('/groups', (req, res) => {
  const data = readJsonFile('groups.json');
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to read groups data' });
  }
});

router.get('/tools', (req, res) => {
  const data = readJsonFile('tools.json');
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to read tools data' });
  }
});

router.get('/announcements', (req, res) => {
  const data = readJsonFile('announcements.json');
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to read announcements data' });
  }
});

export default router;
