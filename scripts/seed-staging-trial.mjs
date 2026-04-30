import mysql from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL;
const openId = process.env.STAGING_OPEN_ID ?? process.env.OWNER_OPEN_ID;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed staging trial entitlement.");
}
if (!openId) {
  throw new Error("OWNER_OPEN_ID or STAGING_OPEN_ID is required to seed staging trial entitlement.");
}

const connection = await mysql.createConnection(databaseUrl);
try {
  const [result] = await connection.execute(
    `update users
       set stripeStatus = 'trialing',
           stripePlan = 'professional',
           trialEndsAt = date_add(now(), interval 14 day),
           subscriptionEndsAt = null,
           updatedAt = now()
     where openId = ?`,
    [openId]
  );
  console.log(`Seeded staging trial entitlement for ${result.affectedRows} user row(s).`);
} finally {
  await connection.end();
}
