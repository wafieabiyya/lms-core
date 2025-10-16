import express, { type Request, type Response } from "express";
export function createApp() {
  const app = express();

  //check health
  app.get("/health", (req: Request, res: Response) => {
    res.json({ name: "lms-be", version: "1.0.0", status: "ok" });
  });

  return app;
}
