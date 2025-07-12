import express from 'express';
import Tag from '../models/Tag.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const tags = await Tag.find({})
      .sort({ questionCount: -1 })
      .limit(50);

    res.json({ tags });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tags', error: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    const tags = await Tag.find({
      name: { $regex: q, $options: 'i' }
    })
    .sort({ questionCount: -1 })
    .limit(10);

    res.json({ tags });
  } catch (error) {
    res.status(500).json({ message: 'Failed to search tags', error: error.message });
  }
});

export default router;