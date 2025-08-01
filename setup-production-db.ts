// Script to set up production database schema
import { config } from "dotenv";
config();

// You'll run this with: PROD_DATABASE_URL="your_production_url" npm run setup:prod

const prodDbUrl = process.env.PROD_DATABASE_URL;

if (!prodDbUrl) {
  console.error('❌ Please provide PROD_DATABASE_URL environment variable');
  console.log('Usage: PROD_DATABASE_URL="your_production_url" npm run setup:prod');
  process.exit(1);
}

console.log('🔄 Setting up production database schema...');

try {
  // Import Drizzle setup
  const { Pool, neonConfig } = await import('@neondatabase/serverless');
  const { drizzle } = await import('drizzle-orm/neon-serverless');
  const ws = await import("ws");
  const schema = await import("./shared/schema.js");

  neonConfig.webSocketConstructor = ws.default;

  console.log('🔄 Connecting to production database...');
  const pool = new Pool({ connectionString: prodDbUrl });
  const db = drizzle({ client: pool, schema });

  console.log('🔄 Testing connection...');
  const result = await db.execute(sql`SELECT NOW() as current_time`);
  console.log('✅ Production database connected successfully!');

  console.log('🔄 Setting up schema (this will create tables if they don\'t exist)...');
  // The schema will be created automatically when you deploy with drizzle-kit push
  
  console.log('✅ Production database setup complete!');
  console.log('📝 Use this URL in Vercel: ' + prodDbUrl);
  
  await pool.end();
  
} catch (error) {
  console.error('❌ Production database setup failed:', error);
  process.exit(1);
}