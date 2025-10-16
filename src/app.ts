import express, { type Request, type Response } from "express";
import morgan from "morgan";

import { authRouter } from "@routes/index.route";
export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));

  app.use("/api/v1/auth", authRouter);

  //check health
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ name: "lms-be", version: "1.0.0", status: "ok" });
  });

  // 404
  app.use((_req, res) => res.status(404).json({ error: "Not Found" }));

  return app;
}
