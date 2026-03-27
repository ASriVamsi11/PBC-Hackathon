import { Router, Request, Response } from "express";
import { predict } from "../services/claude.js";
import { agentMemory } from "../agent/memory.js";
import { agentWallet } from "../agent/wallet.js";
import { activityLog } from "../agent/activity.js";
import { config } from "../config.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const { topic } = req.query;

  if (!topic || typeof topic !== "string") {
    res.status(400).json({ error: "topic parameter is required" });
    return;
  }

  const response = await predict(topic);
  agentMemory.addEntry({ type: "predict", query: topic, response });
  agentWallet.recordEarning(0.02);
  activityLog.add("earning", "Earned $0.02 for /api/predict", `Topic: "${topic.slice(0, 50)}"`);

  res.json({ result: response, agent: config.AGENT_NAME });
});

export default router;
