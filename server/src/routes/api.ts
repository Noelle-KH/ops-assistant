import express from 'express';
import { db } from '../db';
import { faqs, sops, templates, groups, tools, announcements, categories } from '../db/schema';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { asc, desc, sql } from 'drizzle-orm';

const router = express.Router();

router.get('/categories', async (req, res) => {
  try {
    const data = await db.select().from(categories).orderBy(asc(categories.sort_order));
    res.json(data);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get('/faq', async (req, res) => {
  try {
    console.log('[API] Fetching FAQs...');
    const data = await db.select().from(faqs).orderBy(asc(faqs.sort_order), desc(faqs.updated_at));
    console.log(`[API] Successfully fetched ${data.length} FAQs`);
    res.json(data);
  } catch (error: any) {
    console.error('[API] Error fetching FAQs:', error);
    if (error.cause) {
      console.error('[API] Error cause:', error.cause);
    }
    res.status(500).json({ 
      error: 'Failed to fetch FAQ data',
      details: error.message,
      cause: error.cause ? error.cause.message : undefined
    });
  }
});

router.get('/sop', async (req, res) => {
  try {
    const data = await db.select().from(sops).orderBy(asc(sops.sort_order), desc(sops.updated_at));
    res.json(data);
  } catch (error) {
    console.error('Error fetching SOPs:', error);
    res.status(500).json({ error: 'Failed to fetch SOP data' });
  }
});

router.get('/templates', async (req, res) => {
  try {
    const data = await db.select().from(templates).orderBy(asc(templates.sort_order), desc(templates.updated_at));
    res.json(data);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates data' });
  }
});

router.get('/groups', async (req, res) => {
  try {
    const data = await db.select().from(groups);
    res.json(data);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups data' });
  }
});

router.get('/tools', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user?.role;
    const canSeeSensitive = userRole === 'high-level' || userRole === 'admin';

    const data = await db.select().from(tools);
    
    // Process data to mask sensitive accounts if necessary
    const processedData = data.map(tool => {
      if (!tool.accounts) return tool;
      
      return {
        ...tool,
        accounts: tool.accounts.map(acc => {
          if (acc.is_sensitive && !canSeeSensitive) {
            return {
              ...acc,
              password: '●●●●●●●● (僅限高級權限)'
            };
          }
          return acc;
        })
      };
    });

    res.json(processedData);
  } catch (error) {
    console.error('Error fetching tools:', error);
    res.status(500).json({ error: 'Failed to fetch tools data' });
  }
});

router.get('/announcements', async (req, res) => {
  try {
    const data = await db.select().from(announcements);
    res.json(data);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements data' });
  }
});

// Unified Search Endpoint
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q || typeof q !== 'string') {
    return res.json([]);
  }

  const query = q.toLowerCase();
  const pattern = `%${query}%`;

  try {
    const [faqData, sopData, templateData] = await Promise.all([
      db.select().from(faqs).where(sql`
        LOWER(question) LIKE ${pattern} OR 
        LOWER(answer) LIKE ${pattern} OR 
        LOWER(tags) LIKE ${pattern} OR 
        LOWER(category) LIKE ${pattern}
      `).limit(10),
      db.select().from(sops).where(sql`
        LOWER(title) LIKE ${pattern} OR 
        LOWER(category) LIKE ${pattern} OR 
        LOWER(tags) LIKE ${pattern} OR 
        LOWER(rule) LIKE ${pattern}
      `).limit(10),
      db.select().from(templates).where(sql`
        LOWER(title) LIKE ${pattern} OR 
        LOWER(category) LIKE ${pattern} OR 
        LOWER(tags) LIKE ${pattern} OR 
        LOWER(variants) LIKE ${pattern}
      `).limit(10),
    ]);

    const results = [
      ...faqData.map(f => ({
        id: f.id,
        title: f.question,
        type: 'FAQ' as const,
        category: f.category,
        path: `/knowledge-base?id=${f.id}&type=faq`,
        snippet: f.answer.substring(0, 100)
      })),
      ...sopData.map(s => ({
        id: s.id,
        title: s.title,
        type: 'SOP' as const,
        category: s.category,
        path: `/knowledge-base?id=${s.id}&type=sop`,
        snippet: s.rule?.description?.substring(0, 100)
      })),
      ...templateData.map(t => ({
        id: t.id,
        title: t.title,
        type: 'Template' as const,
        category: t.category,
        path: `/templates?id=${t.id}`,
        snippet: t.variants?.[0]?.body?.substring(0, 100)
      }))
    ];

    res.json(results.sort((a, b) => a.title.localeCompare(b.title)).slice(0, 15));
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
