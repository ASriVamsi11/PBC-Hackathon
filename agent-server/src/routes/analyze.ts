import { Router, Request, Response } from "express";
import { analyze } from "../services/claude.js";
import { agentMemory } from "../agent/memory.js";
import { agentWallet } from "../agent/wallet.js";
import { activityLog } from "../agent/activity.js";
import { config } from "../config.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const { query } = req.query;

  if (!query || typeof query !== "string") {
    res.status(400).json({ error: "query parameter is required" });
    return;
  }

  const response = await analyze(query);
  agentMemory.addEntry({ type: "analyze", query, response });
  agentWallet.recordEarning(0.01);
  activityLog.add("earning", "Earned $0.01 for /api/analyze", `Query: "${query.slice(0, 50)}"`);

  res.json({ result: response, agent: config.AGENT_NAME });
});

export default router;
