import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(bodyParser.json());

app.post('/vendor/send', (req, res) => {
  const { to, body, communication_log_id } = req.body;

  const rand = Math.random();
  const status = rand < 0.9 ? 'sent' : 'failed';
  const vendor_message_id = 'vm_' + Math.floor(Math.random() * 1e9);

  // async receipt callback with random delay
  setTimeout(async () => {
    try {
      const backendUrl = process.env.BACKEND_BASE_URL || 'http://localhost:4000';

      // Headers: bypass JWT in dev, use API key in prod
      const headers = {
        'Content-Type': 'application/json',
      };

      if (process.env.NODE_ENV === 'development') {
        headers['x-internal-call'] = 'vendor-sim'; // bypass auth in dev
      } else {
        headers['Authorization'] = `Bearer ${process.env.SIM_VENDOR_API_KEY}`;
      }

      await fetch(`${backendUrl}/api/delivery-receipt`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ vendor_message_id, communication_log_id, status }),
      });
    } catch (e) {
      console.error('Failed to post receipt:', e.message);
    }
  }, Math.random() * 1500 + 200);

  return res.json({ vendor_message_id, status });
});

const port = process.env.VENDOR_PORT || 5000;
app.listen(port, () => console.log('Vendor simulator listening on', port));