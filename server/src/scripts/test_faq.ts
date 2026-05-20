import { db } from '../db';
import { faqs } from '../db/schema';

async function testFetch() {
  console.log("Attempting to fetch FAQs...");
  try {
    const data = await db.select().from(faqs);
    console.log(`Success! Fetched ${data.length} FAQs.`);
  } catch (error) {
    console.error("Fetch failed with error:");
    console.error(error);
  }
}

testFetch();
