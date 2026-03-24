import "dotenv/config";
import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import { ExactSvmScheme } from "@x402/svm/exact/client";
import { createKeyPairSignerFromBytes } from "@solana/kit";
import { base58 } from "@scure/base";

if (!process.env.SVM_PRIVATE_KEY) {
  throw new Error("Missing required env var: SVM_PRIVATE_KEY");
}

// Decode base58 private key → Uint8Array → Solana signer
const privateKeyBytes = base58.decode(process.env.SVM_PRIVATE_KEY);
const svmSigner = await createKeyPairSignerFromBytes(privateKeyBytes);

// Build x402 client — registers Solana exact payment scheme
const client = new x402Client().register("solana:*", new ExactSvmScheme(svmSigner));

// Wrapped fetch: auto-handles 402 → signs payment → retries
export const fetchWithPayment = wrapFetchWithPayment(fetch, client);

export const AGENT_SERVER_URL =
  process.env.AGENT_SERVER_URL || "http://localhost:4021";
