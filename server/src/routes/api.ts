import express from 'express';
import { db } from '../db';
import { faqs, sops, templates, groups, tools, announcements } from '../db/schema';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/faq', async (req, res) => {
  try {
    console.log('[API] Fetching FAQs...');
    const data = await db.select().from(faqs);
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
    const data = await db.select().from(sops);
    res.json(data);
  } catch (error) {
    console.error('Error fetching SOPs:', error);
    res.status(500).json({ error: 'Failed to fetch SOP data' });
  }
});

router.get('/templates', async (req, res) => {
  try {
    const data = await db.select().from(templates);
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

export default router;
