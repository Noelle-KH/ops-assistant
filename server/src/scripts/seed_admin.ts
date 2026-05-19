import { db } from '../db';
import { users } from '../db/schema';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
  console.log("Seeding admin user to database...");
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await db.insert(users).values({
      id: crypto.randomUUID(), // Manually provide ID
      username: 'admin',
      password: hashedPassword,
      displayName: '系統管理員',
      role: 'admin'
    });
    
    console.log("SUCCESS: Admin user created!");
    console.log("Username: admin");
    console.log("Password: admin123");
  } catch (error: any) {
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      console.log("INFO: Admin user already exists.");
    } else {
      console.error("FAILED to seed admin:", error);
    }
  }
}

seedAdmin();
