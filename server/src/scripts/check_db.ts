import { db } from '../db';
import { users } from '../db/schema';

async function checkAdmin() {
  console.log("Checking database for admin user...");
  try {
    const allUsers = await db.select().from(users);
    console.log(`Found ${allUsers.length} users.`);
    allUsers.forEach(u => {
      console.log(`- Username: ${u.username}, Role: ${u.role}`);
    });
    
    if (allUsers.length === 0) {
      console.log("CRITICAL: No users found in database!");
    }
  } catch (error) {
    console.error("Database check failed:", error);
  }
}

checkAdmin();
