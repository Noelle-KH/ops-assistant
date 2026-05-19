import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

async function hashExistingPasswords() {
  console.log("Starting password hashing...");
  
  const allUsers = await db.select().from(users);
  
  for (const user of allUsers) {
    // Check if already hashed (bcrypt hashes start with $2b$ or $2a$)
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
      console.log(`Skipping ${user.username}, already hashed.`);
      continue;
    }
    
    console.log(`Hashing password for ${user.username}...`);
    const hashedPassword = await bcrypt.hash(user.password, 10);
    
    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, user.id));
  }
  
  console.log("Password hashing completed.");
}

hashExistingPasswords().catch(err => {
  console.error("Hashing failed:", err);
  process.exit(1);
});
