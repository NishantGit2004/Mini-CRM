import express from 'express';
import { createCampaign, listCampaigns, generateCampaignSummary, generateCampaignMessage } from '../controllers/campaignController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAuth, createCampaign);
router.get('/', requireAuth, listCampaigns);
router.post("/:id/summary", requireAuth, generateCampaignSummary);
router.post('/message', requireAuth, generateCampaignMessage);

export default router;