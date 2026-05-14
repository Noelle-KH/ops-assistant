import { db } from "../db";
import { faqs, sops, templates } from "../db/schema";

async function dumpData() {
  const f = await db.select().from(faqs);
  const s = await db.select().from(sops);
  const t = await db.select().from(templates);

  console.log("FAQs:", JSON.stringify(f, null, 2));
  console.log("SOPs:", JSON.stringify(s, null, 2));
  console.log("Templates:", JSON.stringify(t, null, 2));
}

dumpData();
