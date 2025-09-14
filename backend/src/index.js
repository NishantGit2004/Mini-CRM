import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './config/db.js';

// routes
import ingestRouter from './routes/ingest.js';
import segmentsRouter from './routes/segments.js';
import campaignsRouter from './routes/campaigns.js';
import authRouter from './routes/auth.js';
import receiptRouter from './routes/receipt.js';

async function start() {
  const app = express();

  // middleware
  app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
  }));
  app.use(express.json());

  // connect database
  await connectDB();

  // routes
  app.use('/api/auth', authRouter);
  app.use('/api/ingest', ingestRouter);
  app.use('/api/segments', segmentsRouter);
  app.use('/api/campaigns', campaignsRouter);
  app.use('/api/delivery-receipt', receiptRouter);

  app.get('/', (req, res) => res.send('Mini CRM backend is up ✅'));

  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`🚀 Server started on http://localhost:${port}`));
}

start().catch(err => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});