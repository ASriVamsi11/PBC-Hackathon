import { Router, Request, Response } from "express";
import { agentMemory } from "../agent/memory.js";
import { retrieveFromFilecoin } from "../services/storage.js";
import { getAgent } from "../services/identity.js";
import { config } from "../config.js";

const router = Router();

// GET /api/storage/memories — list all flushed memory batch CIDs
router.get("/memories", (_req: Request, res: Response) => {
  const index = agentMemory.getIndex();
  res.json({
    agent: config.AGENT_NAME,
    indexCID: agentMemory.getIndexCID(),
    totalBatches: index.length,
    batches: index,
    currentBufferSize: agentMemory.count(),
  });
});

// GET /api/storage/memory/:cid — retrieve a specific memory batch from Filecoin
router.get("/memory/:cid", async (req: Request, res: Response) => {
  try {
    const data = await retrieveFromFilecoin(req.params.cid);
    res.json({ cid: req.params.cid, data });
  } catch (err) {
    res.status(500).json({ error: `Failed to retrieve CID: ${(err as Error).message}` });
  }
});

// GET /api/storage/identity — agent's on-chain identity data
router.get("/identity", async (_req: Request, res: Response) => {
  try {
    if (!config.FEVM_PRIVATE_KEY || !config.REGISTRY_CONTRACT_ADDRESS) {
      res.json({
        agent: config.AGENT_NAME,
        status: "not-registered",
        message: "FEVM not configured",
      });
      return;
    }
    const { ethers } = await import("ethers");
    const wallet = new ethers.Wallet(config.FEVM_PRIVATE_KEY);
    const agentData = await getAgent(wallet.address);
    res.json({ agent: config.AGENT_NAME, onChain: agentData });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST /api/storage/flush — manually trigger a memory flush
router.post("/flush", async (_req: Request, res: Response) => {
  try {
    const batchCID = await agentMemory.flush();
    if (!batchCID) {
      res.json({ message: "Nothing to flush", bufferSize: agentMemory.count() });
      return;
    }
    res.json({
      message: "Memory flushed to Filecoin",
      batchCID,
      indexCID: agentMemory.getIndexCID(),
      totalBatches: agentMemory.getIndex().length,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
