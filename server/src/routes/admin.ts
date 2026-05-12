import express from 'express';
import bcrypt from 'bcrypt';
import { db } from '../db';
import { 
  faqs, 
  sops, 
  templates, 
  announcements, 
  groups, 
  tools, 
  users, 
  auditLogs 
} from '../db/schema';
import { sql } from 'drizzle-orm';

const router = express.Router();

// Helper to log audit events to DB
const logAudit = async (admin: string, action: string, target: string, details: any) => {
  try {
    await db.insert(auditLogs).values({
      timestamp: new Date().toISOString(),
      admin,
      action,
      target,
      details
    });
  } catch (e) {
    console.error("Failed to log audit event:", e);
  }
};

// Generic update endpoint
router.post('/update/:type', async (req, res) => {
  const { type } = req.params;
  const { data, admin } = req.body;

  const tableMap: Record<string, any> = {
    faq: faqs,
    sop: sops,
    templates: templates,
    announcements: announcements,
    groups: groups,
    tools: tools,
    users: users
  };

  const table = tableMap[type];
  if (!table) {
    return res.status(400).json({ error: 'Invalid data type' });
  }

  try {
    await db.transaction(async (tx) => {
      // For bulk sync, we delete existing and re-insert
      await tx.delete(table);
      if (data && data.length > 0) {
        let processedData = data;
        
        // Special handling for users to hash passwords
        if (type === 'users') {
          processedData = await Promise.all(data.map(async (u: any) => {
            if (u.password && !u.password.startsWith('$2b$') && !u.password.startsWith('$2a$')) {
              const hashedPassword = await bcrypt.hash(u.password, 10);
              return { ...u, password: hashedPassword };
            }
            return u;
          }));
        }
        
        await tx.insert(table).values(processedData);
      }
    });

    await logAudit(admin || 'Unknown Admin', 'UPDATE', type, { count: data.length });
    res.json({ message: `${type} updated successfully` });
  } catch (error) {
    console.error(`Error updating ${type}:`, error);
    res.status(500).json({ error: `Failed to update ${type}` });
  }
});

// Get Users
router.get('/users', async (req, res) => {
  try {
    const data = await db.select().from(users);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read users' });
  }
});

// Get Audit Logs
router.get('/audit', async (req, res) => {
  try {
    const data = await db.select().from(auditLogs).orderBy(sql`${auditLogs.timestamp} desc`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read audit logs' });
  }
});

export default router;
