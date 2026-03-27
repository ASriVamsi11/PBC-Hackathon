import "dotenv/config";

function require_env(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

export const config = {
  SVM_ADDRESS: require_env("SVM_ADDRESS"),
  SVM_PRIVATE_KEY: require_env("SVM_PRIVATE_KEY"),
  FACILITATOR_URL: process.env.FACILITATOR_URL || "https://x402.org/facilitator",
  ANTHROPIC_API_KEY: require_env("ANTHROPIC_API_KEY"),
  LIGHTHOUSE_API_KEY: process.env.LIGHTHOUSE_API_KEY || "",
  FEVM_RPC_URL: process.env.FEVM_RPC_URL || "https://api.calibration.node.glif.io/rpc/v1",
  FEVM_PRIVATE_KEY: process.env.FEVM_PRIVATE_KEY || "",
  REGISTRY_CONTRACT_ADDRESS: process.env.REGISTRY_CONTRACT_ADDRESS || "",
  AGENT_NAME: process.env.AGENT_NAME || "MintAI",
  PORT: parseInt(process.env.PORT || "4021", 10),
};
