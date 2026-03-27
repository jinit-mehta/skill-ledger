import mysql from "mysql2/promise";
import { config } from './src/config.js';
import fs from 'fs';

async function createDatabaseAndSchema() {
  try {
    console.log('🔌 Connecting to MySQL server...');

    // Connect WITHOUT specifying a database first
    const connection = await mysql.createConnection({
      host: config.mysql.host,
      port: config.mysql.port,
      user: config.mysql.user,
      password: config.mysql.password
    });

    console.log('✅ Connected to MySQL server\n');

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.mysql.database}`);
    console.log(`✅ Database '${config.mysql.database}' created/verified\n`);

    // Select the database
    await connection.query(`USE ${config.mysql.database}`);

    // Read and execute schema
    const schema = fs.readFileSync('./schema.sql', 'utf8');
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('CREATE DATABASE') && !s.startsWith('USE'));

    console.log(`📋 Executing ${statements.length} SQL statements...\n`);

    for (const statement of statements) {
      try {
        await connection.query(statement);
        const match = statement.match(/CREATE TABLE.*?`?(\w+)`?/i);
        if (match) {
          console.log(`  ✅ Created/verified table: ${match[1]}`);
        }
      } catch (e) {
        if (!e.message.includes('already exists')) {
          console.error('  ❌ Error:', e.message);
        }
      }
    }

    // Show tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('\n📊 Tables in database:');
    tables.forEach(t => console.log(`  - ${Object.values(t)[0]}`));

    await connection.end();
    console.log('\n✅ Database setup complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

createDatabaseAndSchema();
