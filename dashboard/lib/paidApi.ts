import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import { ExactSvmScheme } from "@x402/svm/exact/client";
import type { TransactionPartialSigner } from "@solana/kit";
import { AGENT_URL } from "./api";

export function createPaidFetch(signer: TransactionPartialSigner) {
  const client = new x402Client().register("solana:*", new ExactSvmScheme(signer));
  return wrapFetchWithPayment(fetch, client);
}

type PaidFetch = ReturnType<typeof wrapFetchWithPayment>;

export async function callPaidAnalyze(paidFetch: PaidFetch, query: string) {
  const res = await paidFetch(`${AGENT_URL}/api/analyze?query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`Analyze failed: ${res.status}`);
  return res.json();
}

export async function callPaidGenerate(paidFetch: PaidFetch, prompt: string) {
  const res = await paidFetch(`${AGENT_URL}/api/generate?prompt=${encodeURIComponent(prompt)}`);
  if (!res.ok) throw new Error(`Generate failed: ${res.status}`);
  return res.json();
}

export async function callPaidPredict(paidFetch: PaidFetch, topic: string) {
  const res = await paidFetch(`${AGENT_URL}/api/predict?topic=${encodeURIComponent(topic)}`);
  if (!res.ok) throw new Error(`Predict failed: ${res.status}`);
  return res.json();
}
