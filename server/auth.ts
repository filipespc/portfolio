import bcrypt from 'bcrypt';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import MemoryStore from 'memorystore';
import type { Express, RequestHandler } from 'express';
import { storage } from './storage';

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Use memory store for local development, PostgreSQL for production
  let sessionStore;
  
  if (process.env.NODE_ENV === 'production') {
    // Production: Use PostgreSQL session store
    const pgStore = connectPg(session);
    sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      ttl: sessionTtl,
      tableName: 'sessions',
    });
    console.log('Using PostgreSQL session store for production');
  } else {
    // Development: Use memory store
    const MemoryStoreSession = MemoryStore(session);
    sessionStore = new MemoryStoreSession({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    console.log('Using memory session store for development');
  }
  
  return session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key-change-in-production',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS in production only
      maxAge: sessionTtl,
    },
  });
}

export const requireAuth: RequestHandler = (req, res, next) => {
  if (req.session && (req.session as any).adminId) {
    return next();
  }
  res.status(401).json({ message: 'Authentication required' });
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}