import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import mysql from 'mysql2/promise';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

const migrationDir = path.resolve('drizzle');
const files = [
  '0001_rare_marvex.sql',
  '0002_organic_thunderbolt_ross.sql',
  '0003_colossal_marauders.sql',
  '0004_low_rattler.sql',
  '0005_slippery_george_stacy.sql',
  '0006_moaning_rachel_grey.sql',
  '0007_staging_renderer_program_fit.sql',
];

const ignorableCodes = new Set([
  'ER_TABLE_EXISTS_ERROR',
  'ER_DUP_FIELDNAME',
  'ER_DUP_KEYNAME',
  'ER_DUP_ENTRY',
]);

function splitStatements(sql) {
  return sql
    .split('--> statement-breakpoint')
    .flatMap((chunk) => chunk.split(/;\s*(?:\n|$)/g))
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function migrationAlreadyRecorded(conn, hash) {
  const [rows] = await conn.query('SELECT id FROM `__drizzle_migrations` WHERE hash = ? LIMIT 1', [hash]);
  return rows.length > 0;
}

const conn = await mysql.createConnection(databaseUrl);
try {
  await conn.query('CREATE TABLE IF NOT EXISTS `__drizzle_migrations` (`id` serial AUTO_INCREMENT NOT NULL, `hash` text NOT NULL, `created_at` bigint, CONSTRAINT `__drizzle_migrations_id` PRIMARY KEY(`id`))');

  for (const file of files) {
    const sqlPath = path.join(migrationDir, file);
    const sql = await fs.readFile(sqlPath, 'utf8');
    const hash = crypto.createHash('sha256').update(sql).digest('hex');
    const statements = splitStatements(sql);
    console.log(`Applying ${file} (${statements.length} statements)`);

    for (const statement of statements) {
      try {
        await conn.query(statement);
        console.log(`  ok: ${statement.slice(0, 80).replace(/\s+/g, ' ')}`);
      } catch (error) {
        if (ignorableCodes.has(error.code)) {
          console.log(`  skipped ${error.code}: ${statement.slice(0, 80).replace(/\s+/g, ' ')}`);
          continue;
        }
        console.error(`  failed ${error.code || ''}: ${statement}`);
        throw error;
      }
    }

    if (!(await migrationAlreadyRecorded(conn, hash))) {
      await conn.query('INSERT INTO `__drizzle_migrations` (`hash`, `created_at`) VALUES (?, ?)', [hash, Date.now()]);
    }
  }
} finally {
  await conn.end();
}
