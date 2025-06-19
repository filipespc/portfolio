import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrateEducationData() {
  console.log('Starting education data migration...');
  
  try {
    // Get all experiences with education data
    const experiencesResult = await pool.query(
      'SELECT id, education FROM experiences WHERE education IS NOT NULL AND education != \'{}\''
    );
    
    console.log(`Found ${experiencesResult.rows.length} experiences with education data`);
    
    let totalMigrated = 0;
    
    for (const experience of experiencesResult.rows) {
      const educationArray = experience.education;
      
      if (!educationArray || educationArray.length === 0) continue;
      
      for (const educationString of educationArray) {
        try {
          // Parse the education string as JSON
          const educationData = JSON.parse(educationString);
          
          // Insert into education table
          await pool.query(
            'INSERT INTO education (name, category, link, date, sort_order) VALUES ($1, $2, $3, $4, $5)',
            [
              educationData.name,
              educationData.category,
              educationData.link || null,
              educationData.date || null,
              0
            ]
          );
          
          totalMigrated++;
          console.log(`Migrated: ${educationData.name} (${educationData.category})`);
        } catch (parseError) {
          console.error(`Error parsing education data for experience ${experience.id}:`, parseError);
          console.error('Education string:', educationString);
        }
      }
    }
    
    console.log(`\nMigration completed! Migrated ${totalMigrated} education records.`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrateEducationData();