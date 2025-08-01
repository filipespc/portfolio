import { Pool } from '@neondatabase/serverless';

// Load environment variables manually
import { readFileSync } from 'fs';
import { join } from 'path';

try {
  const envFile = readFileSync(join(process.cwd(), '.env'), 'utf-8');
  envFile.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length) {
      process.env[key] = values.join('=').replace(/^['"]|['"]$/g, '');
    }
  });
} catch (e) {
  console.log('No .env file found, using existing environment variables');
}

if (!process.env.DATABASE_URL || !process.env.PROD_DATABASE_URL) {
  console.error('❌ Both DATABASE_URL and PROD_DATABASE_URL must be set');
  process.exit(1);
}

const prodPool = new Pool({ connectionString: process.env.PROD_DATABASE_URL });
const devPool = new Pool({ connectionString: process.env.DATABASE_URL });

async function syncData() {
  try {
    console.log('🔄 Starting data sync from production to development...');

    // Get all tables that need syncing
    const tables = ['admin_users', 'profile', 'experiences', 'case_studies'];

    for (const table of tables) {
      console.log(`📊 Syncing ${table}...`);

      // Clear development table
      await devPool.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);

      // Get data from production
      const prodData = await prodPool.query(`SELECT * FROM ${table}`);
      
      if (prodData.rows.length === 0) {
        console.log(`  ✅ ${table}: No data to sync`);
        continue;
      }

      // Get column names
      const columns = Object.keys(prodData.rows[0]);
      const columnNames = columns.join(', ');
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

      // Insert data into development
      for (const row of prodData.rows) {
        const values = columns.map(col => row[col]);
        await devPool.query(
          `INSERT INTO ${table} (${columnNames}) VALUES (${placeholders})`,
          values
        );
      }

      console.log(`  ✅ ${table}: Synced ${prodData.rows.length} records`);
    }

    console.log('🎉 Data sync completed successfully!');
  } catch (error) {
    console.error('❌ Error during data sync:', error);
    process.exit(1);
  } finally {
    await prodPool.end();
    await devPool.end();
  }
}

syncData();