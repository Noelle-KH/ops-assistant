import express from 'express';
import { db } from '../db';
import { faqs, sops, templates, groups, tools, announcements } from '../db/schema';

const router = express.Router();

router.get('/faq', async (req, res) => {
  try {
    const data = await db.select().from(faqs);
    res.json(data);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ error: 'Failed to fetch FAQ data' });
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

router.get('/tools', async (req, res) => {
  try {
    const data = await db.select().from(tools);
    res.json(data);
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
