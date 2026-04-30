import mysql from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to apply the layoutImageUrl schema patch.");
}

const connection = await mysql.createConnection(databaseUrl);
try {
  const [rows] = await connection.execute(
    `select count(*) as count
       from information_schema.columns
      where table_schema = database()
        and table_name = 'scenarios'
        and column_name = 'layoutImageUrl'`
  );
  const exists = Number(rows[0]?.count ?? 0) > 0;
  if (exists) {
    console.log("scenarios.layoutImageUrl already exists; no schema patch needed.");
  } else {
    await connection.execute("alter table scenarios add column layoutImageUrl text null after layoutSvg");
    console.log("Added scenarios.layoutImageUrl column.");
  }
} finally {
  await connection.end();
}
