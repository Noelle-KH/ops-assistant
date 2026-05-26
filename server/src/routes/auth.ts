import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { logAudit } from '../utils/audit';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only';

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);

    if (!user) {
      return res.status(401).json({ error: '使用者名稱或密碼錯誤' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: '使用者名稱或密碼錯誤' });
    }

    const { password: _, ...userWithoutPassword } = user;
    
    // Update last login timestamp
    const now = new Date().toISOString();
    await db.update(users)
      .set({ lastLogin: now })
      .where(eq(users.id, user.id));

    // Log login action to audit logs
    await logAudit(user.username, 'LOGIN', 'user_session', { 
      displayName: user.displayName,
      role: user.role,
      ip: req.ip 
    });

    // Sign JWT
    const token = jwt.sign(
      { 
        username: user.username, 
        role: user.role,
        name: user.displayName 
      }, 
      JWT_SECRET, 
      { expiresIn: '8h' }
    );

    res.json({
      message: '登入成功',
      token,
      user: userWithoutPassword
    });
  } catch (error: any) {
    console.error('Login error:', error);
    if (error.cause) console.error('Login error cause:', error.cause);
    res.status(500).json({ 
      error: '伺服器內部錯誤',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;
