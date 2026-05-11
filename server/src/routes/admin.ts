import express from 'express';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const DATA_DIR = path.join(__dirname, '../data');

// Helper to write JSON file
const writeJsonFile = (fileName: string, data: any) => {
  const filePath = path.join(DATA_DIR, fileName);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${fileName}:`, error);
    return false;
  }
};

// Helper to log audit events
const logAudit = (admin: string, action: string, target: string, details: any) => {
  const logPath = path.join(DATA_DIR, 'audit.json');
  let logs = [];
  try {
    if (fs.existsSync(logPath)) {
      logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    }
  } catch (e) {
    console.error("Failed to read audit logs:", e);
  }

  const newLog = {
    timestamp: new Date().toISOString(),
    admin,
    action,
    target,
    details
  };

  logs.unshift(newLog); // Newest first
  fs.writeFileSync(logPath, JSON.stringify(logs.slice(0, 1000), null, 2), 'utf8'); // Keep last 1000
};

// Generic update endpoint
router.post('/update/:type', (req, res) => {
  const { type } = req.params;
  const { data, admin } = req.body;
  const fileName = `${type}.json`;

  if (!['faq', 'sop', 'templates', 'groups', 'tools', 'users', 'announcements'].includes(type)) {
    return res.status(400).json({ error: 'Invalid data type' });
  }

  const success = writeJsonFile(fileName, data);
  if (success) {
    logAudit(admin || 'Unknown Admin', 'UPDATE', fileName, { count: data.length });
    res.json({ message: `${type} updated successfully` });
  } else {
    res.status(500).json({ error: `Failed to update ${type}` });
  }
});

// Get Users
router.get('/users', (req, res) => {
  const logPath = path.join(DATA_DIR, 'users.json');
  try {
    if (fs.existsSync(logPath)) {
      const users = JSON.parse(fs.readFileSync(logPath, 'utf8'));
      res.json(users);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to read users' });
  }
});

// Get Audit Logs
router.get('/audit', (req, res) => {
  const logPath = path.join(DATA_DIR, 'audit.json');
  try {
    if (fs.existsSync(logPath)) {
      const logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
      res.json(logs);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to read audit logs' });
  }
});

export default router;
