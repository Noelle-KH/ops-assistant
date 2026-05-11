import fs from "fs";
import path from "path";
import { db } from "../db";
import { 
  faqs, 
  sops, 
  templates, 
  announcements, 
  groups, 
  tools, 
  users, 
  auditLogs 
} from "../db/schema";

const DATA_DIR = path.join(__dirname, "../../src/data");

async function migrate() {
  console.log("Starting migration...");

  // Migrate FAQs
  const faqData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "faq.json"), "utf8"));
  for (const item of faqData) {
    await db.insert(faqs).values({
      id: item.id,
      category: item.category,
      tags: item.tags,
      question: item.question,
      answer: item.answer,
      ops_note: item.ops_note,
      answer_en: item.answer_en,
      linked_sop: item.linked_sop,
      linked_template: item.linked_template,
      updated_at: item.updated_at,
      status: item.status,
    }).onConflictDoNothing();
  }
  console.log("FAQs migrated.");

  // Migrate SOPs
  const sopData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "sop.json"), "utf8"));
  for (const item of sopData) {
    await db.insert(sops).values({
      id: item.id,
      title: item.title,
      category: item.category,
      tags: item.tags,
      rule: item.rule,
      operation: item.operation,
      exceptions: item.exceptions,
      linked_faq: item.linked_faq,
      linked_template: item.linked_template,
      updated_at: item.updated_at,
      status: item.status,
    }).onConflictDoNothing();
  }
  console.log("SOPs migrated.");

  // Migrate Templates
  const templateData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "templates.json"), "utf8"));
  for (const item of templateData) {
    await db.insert(templates).values({
      id: item.id,
      category: item.category,
      tags: item.tags,
      title: item.title,
      variants: item.variants,
      linked_faq: item.linked_faq,
      linked_sop: item.linked_sop,
      updated_at: item.updated_at,
      status: item.status,
    }).onConflictDoNothing();
  }
  console.log("Templates migrated.");

  // Migrate Announcements
  const annData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "announcements.json"), "utf8"));
  for (const item of annData) {
    await db.insert(announcements).values({
      id: item.id,
      title: item.title,
      content: item.content,
      type: item.type,
      priority: item.priority,
      date: item.date,
      status: item.status || "active",
    }).onConflictDoNothing();
  }
  console.log("Announcements migrated.");

  // Migrate Groups
  const groupData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "groups.json"), "utf8"));
  for (const item of groupData) {
    await db.insert(groups).values({
      id: item.id,
      division: item.division,
      name: item.name,
      purpose: item.purpose,
      use_cases: item.use_cases || [],
      contacts: item.contacts || [],
      notes: item.notes,
    }).onConflictDoNothing();
  }
  console.log("Groups migrated.");

  // Migrate Tools
  const toolData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "tools.json"), "utf8"));
  for (const item of toolData) {
    await db.insert(tools).values({
      id: item.id,
      category: item.category,
      name: item.name,
      url: item.url,
      desc: item.desc,
      accounts: item.accounts || [],
    }).onConflictDoNothing();
  }
  console.log("Tools migrated.");

  // Migrate Users
  const userData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "users.json"), "utf8"));
  for (const item of userData) {
    await db.insert(users).values({
      id: item.id,
      username: item.username,
      password: item.password || "admin123", // Default password for initial users
      role: item.role,
      status: item.status,
    }).onConflictDoNothing();
  }
  console.log("Users migrated.");

  // Migrate Audit Logs
  const auditPath = path.join(DATA_DIR, "audit.json");
  if (fs.existsSync(auditPath)) {
    const auditData = JSON.parse(fs.readFileSync(auditPath, "utf8"));
    for (const item of auditData) {
      await db.insert(auditLogs).values({
        timestamp: item.timestamp,
        admin: item.admin,
        action: item.action,
        target: item.target,
        details: item.details,
      });
    }
    console.log("Audit logs migrated.");
  }

  console.log("Migration completed successfully.");
}

migrate().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
