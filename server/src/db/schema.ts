import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const faqs = sqliteTable("faqs", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  tags: text("tags", { mode: "json" }).$type<string[]>().notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  ops_note: text("ops_note"),
  answer_en: text("answer_en"),
  linked_sop: text("linked_sop"),
  linked_template: text("linked_template"),
  updated_at: text("updated_at").notNull(),
  status: text("status").notNull().default("active"),
});

export const sops = sqliteTable("sops", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  tags: text("tags", { mode: "json" }).$type<string[]>().notNull(),
  rule: text("rule", { mode: "json" }).$type<{
    description: string;
    conditions: string[];
    restrictions: string[];
  }>().notNull(),
  operation: text("operation", { mode: "json" }).$type<{
    steps: { step: number; action: string }[];
  }>().notNull(),
  exceptions: text("exceptions", { mode: "json" }).$type<{
    scenario: string;
    handling: string;
  }[]>().notNull(),
  linked_faq: text("linked_faq", { mode: "json" }).$type<string[]>().notNull(),
  linked_template: text("linked_template", { mode: "json" }).$type<string[]>().notNull(),
  updated_at: text("updated_at").notNull(),
  status: text("status").notNull().default("active"),
});

export const templates = sqliteTable("templates", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  tags: text("tags", { mode: "json" }).$type<string[]>().notNull(),
  title: text("title").notNull(),
  variants: text("variants", { mode: "json" }).$type<{
    variant_id: string;
    label: string;
    description: string;
    body: string;
    fields: { key: string; label: string; placeholder: string }[];
  }[]>().notNull(),
  linked_faq: text("linked_faq"),
  linked_sop: text("linked_sop"),
  updated_at: text("updated_at").notNull(),
  status: text("status").notNull().default("active"),
});

export const announcements = sqliteTable("announcements", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // feature, update, maintenance, emergency
  priority: text("priority").notNull(), // low, normal, high, urgent
  date: text("date").notNull(),
  status: text("status").notNull().default("active"),
});

export const groups = sqliteTable("groups", {
  id: text("id").primaryKey(),
  division: text("division").notNull(),
  name: text("name").notNull(),
  purpose: text("purpose").notNull(),
  use_cases: text("use_cases", { mode: "json" }).$type<string[]>().notNull(),
  contacts: text("contacts", { mode: "json" }).$type<string[]>().notNull(),
  notes: text("notes"),
});

export const tools = sqliteTable("tools", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  name: text("name").notNull(),
  url: text("url"),
  desc: text("desc").notNull(),
  accounts: text("accounts", { mode: "json" }).$type<{
    role: string;
    username: string;
    password: string;
    is_sensitive: boolean;
  }[]>().notNull(),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull().default("使用者"),
  password: text("password").notNull(),
  role: text("role").notNull(), // admin, high-level, operator
  status: text("status").notNull().default("active"),
  lastLogin: text("last_login"),
  createdAt: text("created_at").notNull().default("2026-05-14"),
});

export const auditLogs = sqliteTable("audit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  timestamp: text("timestamp").notNull(),
  admin: text("admin").notNull(),
  action: text("action").notNull(),
  target: text("target").notNull(),
  details: text("details", { mode: "json" }).notNull(),
});
