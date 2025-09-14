import express from 'express';
import { authVerifyHandler } from '../middleware/auth.js';

const router = express.Router();

router.post('/verify', authVerifyHandler);

export default router;
