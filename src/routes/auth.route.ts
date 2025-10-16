import { Router } from "express";
import * as h from "@handlers/auth.handler";

export const authRouter = Router();
authRouter.post("/register", h.register);
authRouter.post("/login", h.login);
authRouter.post("/refresh", h.refresh);
authRouter.post("/logout", h.logout);
