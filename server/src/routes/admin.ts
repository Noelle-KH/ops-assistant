import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { 
  faqs, 
  sops, 
  templates, 
  announcements, 
  groups, 
  tools, 
  users, 
  auditLogs,
  categories
} from '../db/schema';
import { sql } from 'drizzle-orm';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { logAudit } from '../utils/audit';

const router = express.Router();

// Apply admin protection to all routes in this file
router.use(authenticateToken);
router.use(requireAdmin);

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
    users: users,
    categories: categories
  };

  const table = tableMap[type];
  if (!table) {
    return res.status(400).json({ error: 'Invalid data type' });
  }

  try {
    // 1. Fetch old data to calculate diff
    const oldData = await db.select().from(table);
    const oldMap = new Map(oldData.map((item: any) => [item.id, item]));
    const newMap = new Map(data.map((item: any) => [item.id, item]));

    const added = data.filter((item: any) => !oldMap.has(item.id)).map((item: any) => item.id || item.username);
    const deleted = oldData.filter((item: any) => !newMap.has(item.id)).map((item: any) => item.id || item.username);
    const modified: string[] = [];

    data.forEach((newItem: any) => {
      const oldItem = oldMap.get(newItem.id);
      if (oldItem) {
        // Simple comparison of JSON strings to detect changes
        if (JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
          modified.push(newItem.id || newItem.username);
        }
      }
    });

    const auditDetails = {
      total_count: data.length,
      added,
      modified,
      deleted
    };

    await db.transaction(async (tx) => {
      // For bulk sync, we delete existing and re-insert
      await tx.delete(table);
      if (data && data.length > 0) {
      let processedData = data;

      // Special handling for users to hash passwords
      if (type === 'users') {
        processedData = await Promise.all(data.map(async (u: any) => {
          let passwordToHash = u.password;
          const isExistingUser = oldMap.has(u.id);

          // If it's a new user (not in old database) and no password provided, use default
          if (!passwordToHash && !isExistingUser) {
            passwordToHash = "OpsNavigator@2026";
          }

          // If password is not yet hashed, hash it
          if (passwordToHash && !passwordToHash.startsWith('$2b$') && !passwordToHash.startsWith('$2a$')) {
            const hashedPassword = await bcrypt.hash(passwordToHash, 10);
            return { ...u, password: hashedPassword };
          }

          // If editing existing user without changing password, password might be missing from UI model
          // but required by DB. We should find the old password if it's null.
          if (!passwordToHash && isExistingUser) {
            const oldItem = oldMap.get(u.id);
            return { ...u, password: oldItem?.password };
          }

          return u;
        }));
      }

      // Defensive filtering for tools to prevent saving masked passwords
      if (type === 'tools') {
        processedData = data.map((tool: any) => {
          if (!tool.accounts || !Array.isArray(tool.accounts)) return tool;

          const oldTool = oldMap.get(tool.id);
          const updatedAccounts = tool.accounts.map((acc: any, idx: number) => {
            // If password contains masking string, attempt to restore it from old data
            if (acc.password && acc.password.includes('●●●●●●●●')) {
              const oldAccount = oldTool?.accounts?.[idx];
              // Only restore if it matches the role and username to avoid misalignment
              if (oldAccount && oldAccount.role === acc.role && oldAccount.username === acc.username) {
                return { ...acc, password: oldAccount.password };
              }
            }
            return acc;
          });

          return { ...tool, accounts: updatedAccounts };
        });
      }

      await tx.insert(table).values(processedData);
      }    });

    await logAudit(admin || 'Unknown Admin', 'UPDATE', type, auditDetails);
    res.json({ message: `${type} updated successfully`, details: auditDetails });
  } catch (error) {
    console.error(`Error updating ${type}:`, error);
    res.status(500).json({ error: `Failed to update ${type}` });
  }
});

// Rename category across all associated tables
router.post('/rename-category', async (req, res) => {
  const { type, oldName, newName, admin } = req.body;

  if (!type || !oldName || !newName) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const tableMap: Record<string, any> = {
    faq: faqs,
    sop: sops,
    templates: templates,
    tools: tools
  };

  const targetTable = tableMap[type];
  if (!targetTable) {
    return res.status(400).json({ error: 'Invalid category type' });
  }

  // Handle plural/singular mapping for categories table
  const categoryTypeMap: Record<string, string> = {
    faq: 'faq',
    sop: 'sop',
    templates: 'template',
    tools: 'tool'
  };

  const categoryType = categoryTypeMap[type] || type;

  try {
    await db.transaction(async (tx) => {
      // 1. Update the categories table
      await tx.update(categories)
        .set({ name: newName })
        .where(sql`${categories.name} = ${oldName} AND ${categories.type} = ${categoryType}`);

      // 2. Update the target records table (faqs, sops, etc.)
      // Note: We use the column name "category" which is consistent across these tables
      await tx.update(targetTable)
        .set({ category: newName })
        .where(sql`category = ${oldName}`);
    });

    await logAudit(admin || 'Unknown Admin', 'RENAME_CATEGORY', type, { oldName, newName });
    res.json({ message: `Category renamed from ${oldName} to ${newName} for ${type}` });
  } catch (error) {
    console.error(`Error renaming category:`, error);
    res.status(500).json({ error: 'Failed to rename category' });
  }
});

// Get Users
router.get('/users', async (req, res) => {
  try {
    const data = await db.select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      role: users.role,
      status: users.status,
      lastLogin: users.lastLogin,
      createdAt: users.createdAt
    }).from(users);
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
