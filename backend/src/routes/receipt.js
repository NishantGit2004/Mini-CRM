import express from 'express';
import { deliveryReceipt } from '../controllers/receiptController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAuth, deliveryReceipt);

export default router;