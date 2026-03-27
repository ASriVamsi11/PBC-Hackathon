import { Router, Request, Response } from "express";
import { activityLog } from "../agent/activity.js";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  const { type } = req.query;

  if (type && typeof type === "string") {
    res.json(activityLog.getByType(type as "earning" | "storage" | "reputation" | "system"));
  } else {
    res.json(activityLog.getAll());
  }
});

export default router;
