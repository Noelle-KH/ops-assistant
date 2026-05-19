import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

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

    // Sign JWT
    const token = jwt.sign(
      { 
        username: user.username, 
        role: user.role,
        name: user.displayName 
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({
      message: '登入成功',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '伺服器內部錯誤' });
  }
});

export default router;
