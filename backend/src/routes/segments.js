import express from 'express';
import { createSegment, previewSegment, generateSegmentFromAI } from '../controllers/segmentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAuth, createSegment);
router.get('/:id/preview', requireAuth, previewSegment);
router.post("/ai-generate", requireAuth, generateSegmentFromAI);

export default router;