import { fetchWithPayment, AGENT_SERVER_URL } from "./index.js";

interface AgentResponse {
  result: unknown;
  agent: string;
}

async function callEndpoint(
  label: string,
  url: string,
  costUsd: number,
): Promise<number> {
  console.log(`\n── ${label} ──`);
  console.log(`   Calling: ${url}`);
  console.log(`   Cost:    $${costUsd} USDC`);

  const res = await fetchWithPayment(url);

  if (!res.ok) {
    const text = await res.text();
    console.error(`   ERROR ${res.status}: ${text}`);
    return 0;
  }

  const data = (await res.json()) as AgentResponse;
  console.log(`   Agent:   ${data.agent}`);
  console.log(`   Result:`, JSON.stringify(data.result, null, 2));
  return costUsd;
}

async function main() {
  console.log("=== MintAI Consumer Demo ===");
  console.log(`Agent server: ${AGENT_SERVER_URL}\n`);

  let totalSpent = 0;

  totalSpent += await callEndpoint(
    "Data Analysis ($0.01)",
    `${AGENT_SERVER_URL}/api/analyze?query=bitcoin+price+trends+2025`,
    0.01,
  );

  totalSpent += await callEndpoint(
    "Content Generation ($0.005)",
    `${AGENT_SERVER_URL}/api/generate?prompt=write+a+short+intro+for+a+decentralized+AI+marketplace`,
    0.005,
  );

  totalSpent += await callEndpoint(
    "Market Prediction ($0.02)",
    `${AGENT_SERVER_URL}/api/predict?topic=Solana+DeFi+ecosystem`,
    0.02,
  );

  console.log("\n=== Summary ===");
  console.log(`Total spent: $${totalSpent.toFixed(3)} USDC`);
  console.log("All requests paid via x402 on Solana devnet.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
