import { db } from "../db";
import { faqs, sops, templates, groups, tools } from "../db/schema";

async function checkRows() {
  const faqCount = await db.select().from(faqs);
  const sopCount = await db.select().from(sops);
  const templateCount = await db.select().from(templates);
  const groupCount = await db.select().from(groups);
  const toolCount = await db.select().from(tools);

  console.log({
    faqs: faqCount.length,
    sops: sopCount.length,
    templates: templateCount.length,
    groups: groupCount.length,
    tools: toolCount.length
  });
}

checkRows();
