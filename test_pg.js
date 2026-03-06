import { Client } from 'pg';

const connectionString = process.env.DATABASE;

async function check() {
  const client = new Client({ connectionString });
  await client.connect();
  
  try {
    const res = await client.query('SELECT role, email FROM profiles LIMIT 5');
    console.log(res.rows);
    
    // Check legal documents
    const docs = await client.query('SELECT id, title FROM legal_documents LIMIT 1');
    if (docs.rows.length > 0) {
      console.log('Doc:', docs.rows[0]);
    }
  } catch (err) {
    console.error('Error executing query', err.stack);
  } finally {
    await client.end();
  }
}
check();
