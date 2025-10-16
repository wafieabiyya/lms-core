import jwt, { type Secret, type SignOptions } from "jsonwebtoken";

const SECRET: Secret = (process.env.JWT_SECRET ?? "dev-secret") as Secret;

type Expires = NonNullable<SignOptions["expiresIn"]>;

const ACCESS_EXPIRES: Expires = (process.env.JWT_EXPIRES_IN ??
  "15m") as Expires;
const REFRESH_EXPIRES: Expires = (process.env.JWT_REFRESH_EXPIRES_IN ??
  "7d") as Expires;

export const signAccess = (payload: object) => {
  const opts: SignOptions = { expiresIn: ACCESS_EXPIRES };
  return jwt.sign(payload, SECRET, opts);
};

export const signRefresh = (payload: object) => {
  const opts: SignOptions = { expiresIn: REFRESH_EXPIRES };
  return jwt.sign(payload, SECRET, opts);
};

export const verifyToken = <T = unknown>(token: string) => {
  return jwt.verify(token, SECRET) as T;
};
