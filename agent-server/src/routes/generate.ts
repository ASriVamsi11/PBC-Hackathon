import { Router, Request, Response } from "express";
import { generate } from "../services/claude.js";
import { agentMemory } from "../agent/memory.js";
import { agentWallet } from "../agent/wallet.js";
import { config } from "../config.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const { prompt } = req.query;

  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({ error: "prompt parameter is required" });
    return;
  }

  const response = await generate(prompt);
  agentMemory.addEntry({ type: "generate", query: prompt, response });
  agentWallet.recordEarning(0.005);

  res.json({ result: response, agent: config.AGENT_NAME });
});

export default router;
