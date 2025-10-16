import bcrypt from "bcryptjs";
import { z } from "zod";
import { signAccess, signRefresh, verifyToken } from "@utils/jwt";
import {
  insertUser,
  findUserByEmail,
  storeRefreshToken,
  activeRefreshTokens,
  revokeRefreshToken,
  findUserByID,
} from "@repos/auth.repo";

export const RegisterSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function register(data: unknown) {
  const { name, email, password } = RegisterSchema.parse(data);
  const hashed = await bcrypt.hash(password, 10);
  return insertUser(name, email, hashed);
}

export async function login(data: unknown) {
  const { email, password } = LoginSchema.parse(data);
  const user = await findUserByEmail(email);
  if (!user) throw new Error("INVALID_CREDENTIALS");
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new Error("INVALID_CREDENTIALS");

  const access = signAccess({ sub: user.id, role: user.role });
  const refresh = signRefresh({ sub: user.id, ver: Date.now().toString(36) });

  const hash = await bcrypt.hash(refresh, 10);
  await storeRefreshToken(user.id, hash);

  return {
    access_token: access,
    refresh_token: refresh,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

export async function refresh(body: any) {
  const refresh_token = body?.refresh_token as string | undefined;
  if (!refresh_token) throw new Error("MISSING_REFRESH_TOKEN");
  const payload = verifyToken<{ sub: string; role?: string }>(refresh_token);

  const tokens = await activeRefreshTokens(payload.sub);
  let matched: { id: string; token_hash: string } | null = null;
  for (const t of tokens) {
    if (await bcrypt.compare(refresh_token, t.token_hash)) {
      matched = t;
      break;
    }
  }
  if (!matched) throw new Error("INVALID_REFRESH");

  // rotate
  await revokeRefreshToken(matched.id);
  const access = signAccess({ sub: payload.sub, role: payload.role });
  const nextRefresh = signRefresh({
    sub: payload.sub,
    ver: Date.now().toString(36),
  });
  const nextHash = await bcrypt.hash(nextRefresh, 10);
  await storeRefreshToken(payload.sub, nextHash);

  return { access_token: access, refresh_token: nextRefresh };
}

export async function logout(body: any) {
  const refresh_token = body?.refresh_token as string | undefined;
  if (!refresh_token) throw new Error("MISSING_REFRESH_TOKEN");
  const payload = verifyToken<{ sub: string }>(refresh_token);
  const tokens = await activeRefreshTokens(payload.sub);
  for (const t of tokens) {
    if (await bcrypt.compare(refresh_token, t.token_hash)) {
      await revokeRefreshToken(t.id);
      break;
    }
  }
  return { ok: true };
}

export async function me(userId: string) {
  const user = await findUserByID(userId);
  if (!user) throw new Error("USER_NOT_FOUND");
  return user;
}
