import { pool } from "@db/pool";

export type DbUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  password_hash: string;
  created_at: string;
};

const rawQuery = {
  createNewUser: `
    INSERT INTO users (name,email,password_hash)
    VALUES ($1,$2,$3)
    RETURNING id,name,email,role,created_at
  `,
  getUserByEmail: `
    SELECT id, name, email, role, created_at, password_hash
    FROM users
    WHERE email = $1
    LIMIT 1
  `,
  getUserByID: `SELECT id, name, email, role, created_at FROM users WHERE id = $1 LIMIT 1`,
  getFuture7dTs: `SELECT (NOW() + interval '7 day')::timestamptz as exp`,
  insertNewRefreshToken: `
    INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
    VALUES ($1,$2,$3)
  `,
  getActiveTokens: `
    SELECT id, token_hash
    FROM refresh_tokens
    WHERE user_id=$1 AND is_revoked=false AND expires_at>NOW()
  `,
  revokeToken: `UPDATE refresh_tokens SET is_revoked=true WHERE id=$1`,
};

// users
export async function insertUser(
  name: string,
  email: string,
  passwordHash: string,
) {
  const r = await pool.query<DbUser>(rawQuery.createNewUser, [
    name,
    email,
    passwordHash,
  ]);
  return r.rows[0];
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const r = await pool.query<DbUser>(rawQuery.getUserByEmail, [email]);
  return r.rows[0] || null;
}

export async function findUserByID(userId: string) {
  const r = await pool.query<DbUser>(rawQuery.getUserByID, [userId]);
  return r.rows[0] || null;
}

// tokens
export async function storeRefreshToken(
  userId: string,
  tokenHash: string,
  expiresAtISO?: string,
) {
  const expires = expiresAtISO
    ? expiresAtISO
    : (await pool.query<{ exp: string }>(rawQuery.getFuture7dTs)).rows[0]
        ?.exp ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await pool.query(rawQuery.insertNewRefreshToken, [
    userId,
    tokenHash,
    expires,
  ]);
}

export async function activeRefreshTokens(
  userId: string,
): Promise<{ id: string; token_hash: string }[]> {
  const r = await pool.query<{ id: string; token_hash: string }>(
    rawQuery.getActiveTokens,
    [userId],
  );
  return r.rows;
}

export async function revokeRefreshToken(tokenId: string) {
  await pool.query(rawQuery.revokeToken, [tokenId]);
}
