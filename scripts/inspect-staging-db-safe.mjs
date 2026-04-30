import mysql from 'mysql2/promise';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

const conn = await mysql.createConnection(databaseUrl);
try {
  const [tableRows] = await conn.query('SHOW TABLES');
  const tableNames = tableRows.map((row) => Object.values(row)[0]).sort();
  console.log(`tables=${JSON.stringify(tableNames)}`);

  for (const table of ['users', 'projects', 'scenarios', 'share_tokens', 'report_views', 'referrals', 'broker_profiles', 'changelog_seen']) {
    if (!tableNames.includes(table)) {
      console.log(`${table}=MISSING`);
      continue;
    }
    const [cols] = await conn.query(`SHOW COLUMNS FROM \`${table}\``);
    console.log(`${table}.columns=${JSON.stringify(cols.map((col) => col.Field))}`);
  }

  if (tableNames.includes('__drizzle_migrations')) {
    const [migrationCols] = await conn.query('SHOW COLUMNS FROM `__drizzle_migrations`');
    console.log(`__drizzle_migrations.columns=${JSON.stringify(migrationCols.map((col) => col.Field))}`);
    const [migrationRows] = await conn.query('SELECT * FROM `__drizzle_migrations` ORDER BY id');
    console.log(`__drizzle_migrations.rows=${JSON.stringify(migrationRows, null, 2)}`);
  }
} finally {
  await conn.end();
}
