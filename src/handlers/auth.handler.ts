import { Request, Response } from "express";
import * as svc from "@services/auth.service";

export async function register(req: Request, res: Response) {
  try {
    const user = await svc.register(req.body);
    res.status(201).json(user);
  } catch (e: any) {
    const msg = e?.issues?.[0]?.message || e.message || "REGISTER_ERROR";
    res.status(400).json({ code: "REGISTER_ERROR", message: msg });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const out = await svc.login(req.body);
    res.json(out);
  } catch (e: any) {
    const message =
      e.message === "INVALID_CREDENTIALS" ? "Email/password salah" : e.message;
    res.status(401).json({ code: "LOGIN_ERROR", message });
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    const out = await svc.refresh(req.body);
    res.json(out);
  } catch (e: any) {
    const message =
      e.message === "MISSING_REFRESH_TOKEN"
        ? "Missing refresh_token"
        : "Refresh token invalid";
    res.status(401).json({ code: "REFRESH_ERROR", message });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const out = await svc.logout(req.body);
    res.json(out);
  } catch (e: any) {
    const message =
      e.message === "MISSING_REFRESH_TOKEN"
        ? "Missing refresh_token"
        : e.message;
    res.status(400).json({ code: "LOGOUT_ERROR", message });
  }
}
