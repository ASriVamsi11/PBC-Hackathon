import "dotenv/config";
import express from "express";
import cors from "cors";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactSvmScheme } from "@x402/svm/exact/server";
import { config } from "./config.js";
import { agentMemory } from "./agent/memory.js";
import { agentWallet } from "./agent/wallet.js";
import { activityLog } from "./agent/activity.js";
import analyzeRouter from "./routes/analyze.js";
import generateRouter from "./routes/generate.js";
import predictRouter from "./routes/predict.js";
import storageRouter from "./routes/storage.js";
import activityRouter from "./routes/activity.js";
import { boot } from "./agent/boot.js";

const app = express();

app.use(cors());
app.use(express.json());

// x402 resource server — wires Solana payment scheme to the facilitator
const facilitator = new HTTPFacilitatorClient({ url: config.FACILITATOR_URL });
const resourceServer = new x402ResourceServer(facilitator).register(
  "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
  new ExactSvmScheme(),
);

// Payment middleware — gates the three AI endpoints
app.use(
  paymentMiddleware(
    {
      "GET /api/analyze": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.01",
            network: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
            payTo: config.SVM_ADDRESS,
          },
        ],
        description: "AI-powered data analysis",
        mimeType: "application/json",
      },
      "GET /api/generate": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.005",
            network: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
            payTo: config.SVM_ADDRESS,
          },
        ],
        description: "AI-powered content generation",
        mimeType: "application/json",
      },
      "GET /api/predict": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.02",
            network: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
            payTo: config.SVM_ADDRESS,
          },
        ],
        description: "AI-powered market predictions",
        mimeType: "application/json",
      },
    },
    resourceServer,
  ),
);

// x402-gated routes
app.use("/api/analyze", analyzeRouter);
app.use("/api/generate", generateRouter);
app.use("/api/predict", predictRouter);

// Free playground endpoints (demo mode — bypasses x402 for dashboard interaction)
app.post("/api/playground/analyze", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== "string") {
      res.status(400).json({ error: "query is required" });
      return;
    }
    const { analyze } = await import("./services/claude.js");
    const response = await analyze(query);
    agentMemory.addEntry({ type: "analyze", query, response });
    activityLog.add("earning", "Demo: /api/analyze (free)", `Query: "${query.slice(0, 50)}"`);
    res.json({ result: response, agent: config.AGENT_NAME });
  } catch (err) {
    res.status(500).json({ error: "Analysis failed" });
  }
});

app.post("/api/playground/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "prompt is required" });
      return;
    }
    const { generate } = await import("./services/claude.js");
    const response = await generate(prompt);
    agentMemory.addEntry({ type: "generate", query: prompt, response });
    activityLog.add("earning", "Demo: /api/generate (free)", `Prompt: "${prompt.slice(0, 50)}"`);
    res.json({ result: response, agent: config.AGENT_NAME });
  } catch (err) {
    res.status(500).json({ error: "Generation failed" });
  }
});

app.post("/api/playground/predict", async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic || typeof topic !== "string") {
      res.status(400).json({ error: "topic is required" });
      return;
    }
    const { predict } = await import("./services/claude.js");
    const response = await predict(topic);
    agentMemory.addEntry({ type: "predict", query: topic, response });
    activityLog.add("earning", "Demo: /api/predict (free)", `Topic: "${topic.slice(0, 50)}"`);
    res.json({ result: response, agent: config.AGENT_NAME });
  } catch (err) {
    res.status(500).json({ error: "Prediction failed" });
  }
});

// Free storage endpoints (not x402-gated — dashboard calls these)
app.use("/api/storage", storageRouter);

// Free activity endpoint
app.use("/api/activity", activityRouter);

// Free status endpoint (not x402-gated — dashboard calls this)
app.get("/api/status", (_req, res) => {
  const wallet = agentWallet.getStats();
  res.json({
    agent: config.AGENT_NAME,
    wallet: config.SVM_ADDRESS,
    totalEarningsUsd: wallet.totalEarningsUsd,
    totalRequests: wallet.totalRequests,
    memoryCount: agentMemory.count(),
    uptime: process.uptime(),
  });
});

boot().then(() => {
  app.listen(config.PORT, () => {
    console.log(`${config.AGENT_NAME} running on http://localhost:${config.PORT}`);
    console.log(`  Wallet: ${config.SVM_ADDRESS}`);
    console.log(`  Paid endpoints: /api/analyze ($0.01), /api/generate ($0.005), /api/predict ($0.02)`);
    console.log(`  Free endpoints: /api/status, /api/activity`);
  });
});
