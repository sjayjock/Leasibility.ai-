import mysql from 'mysql2/promise';

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL missing');
}

const conn = await mysql.createConnection(url);
try {
  const [projects] = await conn.query(`select id, userId, propertyName, status, totalSqFt, headcount, createdAt, updatedAt from projects order by id desc limit 10`);
  const [scenarios] = await conn.query(`select projectId, count(*) as scenarioCount from scenarios group by projectId order by projectId desc limit 10`);
  const [tokens] = await conn.query(`select id, token, projectId, isActive, viewCount, createdAt from shareTokens order by id desc limit 10`);
  console.log(JSON.stringify({ projects, scenarios, tokens }, null, 2));
} finally {
  await conn.end();
}
