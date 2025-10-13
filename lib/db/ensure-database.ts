import { config } from 'dotenv';
import postgres from 'postgres';

config({ path: '.env' });

async function ensureDatabaseExists() {
  const postgresUrl = process.env.POSTGRES_URL;

  if (!postgresUrl) {
    throw new Error('POSTGRES_URL environment variable is not set');
  }

  console.log('Checking database existence...');

  // Parse the connection URL to extract database name
  const url = new URL(postgresUrl);
  const dbName = url.pathname.slice(1); // Remove the leading slash
  const originalDbName = dbName;

  if (!dbName) {
    throw new Error('Database name not found in POSTGRES_URL');
  }

  try {
    // First, try to connect to the specified database
    const testConnection = postgres(postgresUrl, { max: 1 });
    await testConnection`SELECT 1`;
    await testConnection.end();
    console.log(`✅ Database '${dbName}' exists and is accessible`);
    return;
  } catch (error: any) {
    if (error.code === '3D000') { // database does not exist
      console.log(`⚠️  Database '${dbName}' does not exist. Creating it...`);

      // Connect to the default 'postgres' database to create our database
      url.pathname = '/postgres';
      const adminConnection = postgres(url.toString(), { max: 1 });

      try {
        // Create the database
        await adminConnection.unsafe(`CREATE DATABASE "${dbName}"`);
        console.log(`✅ Database '${dbName}' created successfully`);
      } catch (createError: any) {
        if (createError.message.includes('already exists')) {
          console.log(`✅ Database '${dbName}' already exists`);
        } else {
          console.error(`❌ Failed to create database '${dbName}':`, createError.message);
          throw createError;
        }
      } finally {
        await adminConnection.end();
      }
    } else {
      console.error(`❌ Database connection failed:`, error.message);
      throw error;
    }
  }
}

// Run the function if this script is called directly
if (require.main === module) {
  ensureDatabaseExists()
    .then(() => {
      console.log('Database setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database setup failed:', error.message);
      process.exit(1);
    });
}

export default ensureDatabaseExists;