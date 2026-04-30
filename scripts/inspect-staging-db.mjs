import mysql from 'mysql2/promise';

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL is required');
}

const conn = await mysql.createConnection(url);
try {
  const [tables] = await conn.query('SHOW TABLES');
  console.log('tables=' + JSON.stringify(tables.map((row) => Object.values(row)[0]).sort()));

  const [scenarioColumns] = await conn.query('SHOW COLUMNS FROM scenarios');
  console.log('scenario_columns=' + JSON.stringify(scenarioColumns.map((row) => row.Field)));

  const [drizzleTables] = await conn.query("SHOW TABLES LIKE '__drizzle_migrations'");
  console.log('has_drizzle_migrations=' + (drizzleTables.length > 0 ? 'yes' : 'no'));
  if (drizzleTables.length > 0) {
    const [drizzleColumns] = await conn.query('SHOW COLUMNS FROM __drizzle_migrations');
    console.log('drizzle_migration_columns=' + JSON.stringify(drizzleColumns.map((row) => row.Field)));
    const [rows] = await conn.query('SELECT * FROM __drizzle_migrations ORDER BY id');
    console.log('drizzle_migrations=' + JSON.stringify(rows));
  }
} finally {
  await conn.end();
}
