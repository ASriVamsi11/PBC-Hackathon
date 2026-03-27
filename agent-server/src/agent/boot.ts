import { ethers } from "ethers";
import { config } from "../config.js";
import { storeOnFilecoin } from "../services/storage.js";
import { registerAgent, getAgent } from "../services/identity.js";
import { activityLog } from "./activity.js";

export async function boot(): Promise<void> {
  console.log("[Boot] Starting agent boot sequence...");

  try {
    // 1. Create identity document
    const identityDoc = {
      name: config.AGENT_NAME,
      wallet: config.SVM_ADDRESS,
      capabilities: ["analyze", "generate", "predict"],
      createdAt: new Date().toISOString(),
    };

    // 2. Upload identity to Filecoin
    const identityCID = await storeOnFilecoin(identityDoc, "agent-identity");
    console.log(`[Boot] Identity uploaded to Filecoin → CID: ${identityCID}`);

    // 3. Check on-chain registry
    if (!config.FEVM_PRIVATE_KEY || !config.REGISTRY_CONTRACT_ADDRESS) {
      console.warn("[Boot] FEVM not configured — skipping on-chain registration");
      activityLog.add("system", "Agent booted (off-chain)", "FEVM not configured, skipping on-chain registration");
      return;
    }

    const wallet = new ethers.Wallet(config.FEVM_PRIVATE_KEY);
    const address = wallet.address;
    console.log(`[Boot] FEVM wallet: ${address}`);

    try {
      const agentData = await getAgent(address) as { isActive: boolean; dataCID: string };

      if (agentData.isActive) {
        console.log(`[Boot] Agent already registered on-chain. Previous dataCID: ${agentData.dataCID}`);
        activityLog.add("system", "Agent booted (already registered)", `On-chain identity found at ${address}`);
        return;
      }
    } catch {
      // Agent not registered yet — proceed to register
    }

    // 4. Register on-chain
    console.log("[Boot] Registering agent on-chain...");
    await registerAgent(config.AGENT_NAME, identityCID);
    console.log("[Boot] Agent registered on-chain successfully");
    activityLog.add("system", "Agent registered on-chain", `Name: ${config.AGENT_NAME}, CID: ${identityCID}`);
  } catch (err) {
    console.error("[Boot] Boot sequence error (non-fatal):", err);
    activityLog.add("system", "Boot completed with warnings", `Error: ${(err as Error).message}`);
  }
}
