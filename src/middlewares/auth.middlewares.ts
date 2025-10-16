import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer "))
    return res
      .status(401)
      .json({ code: "UNAUTHORIZED", message: "Missing token" });
  try {
    (req as any).user = verifyToken(h.slice(7));
    next();
  } catch {
    return res
      .status(401)
      .json({ code: "INVALID_TOKEN", message: "Invalid/expired token" });
  }
  next();
}
