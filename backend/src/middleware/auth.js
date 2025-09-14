import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function verifyGoogleIdToken(idToken) {
  const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
  return ticket.getPayload();
}

export async function authVerifyHandler(req, res) {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: 'idToken required' });

  try {
    const payload = await verifyGoogleIdToken(idToken);

    let user = await User.findOne({ googleId: payload.sub });

    if (!user) {
      user = await User.create({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name
      });
      console.log('New user created:', user.email);
    }

    const token = jwt.sign(
      { sub: user.googleId, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({ token, profile: payload });

  } catch (e) {
    console.error(e);
    return res.status(401).json({ error: 'invalid token' });
  }
}

export async function requireAuth(req, res, next) {
  // Allow vendor simulator to bypass JWT in dev
  if (process.env.SKIP_VENDOR_AUTH === 'true' && req.headers['x-internal-call'] === 'vendor-sim') {
    return next();
  }

  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'missing auth' });

  const [, token] = auth.split(' ');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ googleId: payload.sub }).lean();
    if (!user) return res.status(401).json({ error: 'user not found' });

    req.user = user;
    next();
  } catch (e) {
    console.error(e);
    return res.status(401).json({ error: 'invalid token' });
  }
}