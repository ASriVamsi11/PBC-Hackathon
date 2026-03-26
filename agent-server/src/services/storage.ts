import lighthouse from "@lighthouse-web3/sdk";
import { config } from "../config.js";

export async function storeOnFilecoin(data: object, name: string): Promise<string> {
  const text = JSON.stringify(data, null, 2);
  const response = await lighthouse.uploadText(text, config.LIGHTHOUSE_API_KEY, name);
  const cid: string = response.data.Hash;
  console.log(`[Storage] Uploaded "${name}" → CID: ${cid}`);
  return cid;
}

export async function retrieveFromFilecoin(cid: string): Promise<unknown> {
  const url = `https://gateway.lighthouse.storage/ipfs/${cid}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to retrieve CID ${cid}: HTTP ${res.status}`);
  }
  return res.json();
}
