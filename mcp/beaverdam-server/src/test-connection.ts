import { createDirectus, rest, staticToken, readFiles } from '@directus/sdk';
import dotenv from 'dotenv';

dotenv.config();

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://dam.beaverdam.cc';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;

if (!DIRECTUS_TOKEN) {
  console.error('❌ DIRECTUS_TOKEN not set in .env file');
  process.exit(1);
}

async function testConnection() {
  console.log('🔌 Testing connection to Directus...');
  console.log(`📍 URL: ${DIRECTUS_URL}`);

  try {
    const client = createDirectus(DIRECTUS_URL)
      .with(staticToken(DIRECTUS_TOKEN!))
      .with(rest());

    // Test basic connection by fetching files
    const files = await client.request(
      readFiles({
        limit: 5,
      })
    );

    console.log(`✅ Connected successfully!`);
    console.log(`📁 Found ${files.length} files in the system`);

    if (files.length > 0) {
      console.log('\n📄 Sample file:');
      console.log(JSON.stringify(files[0], null, 2));
    }
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message);
    if (error.errors) {
      console.error('Details:', error.errors);
    }
    process.exit(1);
  }
}

testConnection();
