import { db } from "../db";
import { 
  faqs, 
  sops, 
  templates, 
  announcements, 
  auditLogs,
  users,
  groups,
  tools
} from "../db/schema";
import bcrypt from "bcrypt";

async function clearData() {
  console.log("⚠️ Starting full data cleanup for production...");

  try {
    // 1. Delete all operational data
    await db.delete(faqs);
    console.log("✅ FAQs cleared.");

    await db.delete(sops);
    console.log("✅ SOPs cleared.");

    await db.delete(templates);
    console.log("✅ Templates cleared.");

    await db.delete(announcements);
    console.log("✅ Announcements cleared.");

    await db.delete(groups);
    console.log("✅ Groups cleared.");

    await db.delete(tools);
    console.log("✅ Tools cleared.");

    await db.delete(auditLogs);
    console.log("✅ Audit logs cleared.");

    // 2. Reset Users (Keep only default admin)
    await db.delete(users);
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await db.insert(users).values({
      id: "u_admin",
      username: "admin",
      password: hashedPassword,
      role: "admin",
      status: "active"
    });
    console.log("✅ Users reset. Default admin created (admin / admin123).");

    console.log("\n✨ Database is now completely clean and ready for production.");
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
  }
}

clearData();
