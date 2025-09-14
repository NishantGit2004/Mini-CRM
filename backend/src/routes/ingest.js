import express from 'express';
import { ingestCustomers, ingestOrders } from '../controllers/ingestController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/customers', requireAuth, ingestCustomers);
router.post('/orders', requireAuth, ingestOrders);

export default router;