import "dotenv/config";
import express from "express";
import cors from "cors";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactSvmScheme } from "@x402/svm/exact/server";
import { config } from "./config.js";
import { agentMemory } from "./agent/memory.js";
import { agentWallet } from "./agent/wallet.js";
import analyzeRouter from "./routes/analyze.js";
import generateRouter from "./routes/generate.js";
import predictRouter from "./routes/predict.js";

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

app.listen(config.PORT, () => {
  console.log(`${config.AGENT_NAME} running on http://localhost:${config.PORT}`);
  console.log(`  Wallet: ${config.SVM_ADDRESS}`);
  console.log(`  Paid endpoints: /api/analyze ($0.01), /api/generate ($0.005), /api/predict ($0.02)`);
  console.log(`  Free endpoint:  /api/status`);
});
