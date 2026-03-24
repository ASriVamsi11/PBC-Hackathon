# PersistAgent — Self-Sustaining AI Agents with Decentralized Identity & x402 Earnings

## Context

This is a hackathon project targeting **Bounty 4 (x402 Payments — $1,000)** + **Bounty 5 (Filecoin Infrastructure — $1,000)** = **$2,000 potential prize**. The team is composed of beginners who want to learn blockchain, AI agents, and decentralized storage while building a compelling demo.

**The Problem:** Today's AI agents are ephemeral (lose memory on restart), centralized (dependent on one provider), and can't autonomously earn or spend money.

**The Solution:** Build AI agents that are truly self-sustaining — they **earn** SOL/USDC by selling AI services via x402 micropayments, **store** their memory and identity on Filecoin, and **anchor** their identity/reputation on-chain via a Solidity smart contract on Filecoin's FEVM.

---

## Architecture

```
[AI Agent (Node.js Express Server)]
   ├── Hosts x402-gated API endpoints → earns USDC per request
   ├── Calls other agents' x402 APIs → spends USDC
   ├── Stores memory/logs/identity → Filecoin (via Lighthouse SDK)
   └── Identity + reputation anchored → Solidity registry on Filecoin FEVM

[Next.js Dashboard] → shows earnings, expenses, stored data, reputation score
```

---

## Tech Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| Agent Server | Node.js + Express + TypeScript | x402 libraries are JS-native; Express is beginner-friendly |
| AI Intelligence | Claude API (`@anthropic-ai/sdk`) | Powers the agent's data analysis, content generation, predictions |
| Earning (x402) | `@x402/express` middleware | One-line middleware turns any Express route into a paid API |
| Spending (x402) | `@x402/fetch` client | Wraps `fetch()` to auto-handle 402 payment flows |
| Storage | Lighthouse SDK (`@lighthouse-web3/sdk`) | Simplest way to upload to Filecoin/IPFS; free tier; returns CIDs |
| Identity Registry | Solidity on Filecoin FEVM (Calibration testnet) | On-chain agent registration, reputation scores, CID references |
| Dashboard | Next.js 14 App Router + TailwindCSS | Fast to build, great for visual demos |
| Payments Network | Solana devnet | x402 settles on Solana; fast, cheap, well-supported |
| Storage Network | Filecoin Calibration testnet (Chain ID: 314159) | Free testnet for storage and FEVM smart contracts |

---

## Concepts for Beginners

### What is x402?
An open protocol (by Coinbase) that uses HTTP 402 "Payment Required" to let servers charge crypto for API access. Flow: Client requests → Server returns 402 with price → Client's wallet auto-signs payment → Client retries with payment proof → Server verifies, settles on-chain, returns data. No accounts, no subscriptions — just pay-per-request.

### What is Filecoin / Lighthouse?
Filecoin is decentralized storage (like AWS S3 but distributed). Lighthouse is a developer-friendly wrapper: you call `lighthouse.uploadText(json, apiKey)` and get back a **CID** (Content Identifier) — a permanent, unique hash for your data. Anyone can retrieve it via `https://gateway.lighthouse.storage/ipfs/<CID>`.

### What is FEVM?
Filecoin EVM — Filecoin runs an Ethereum-compatible VM, so you can deploy Solidity smart contracts directly on Filecoin using Hardhat. Our identity registry contract lives here.

### What is a CID?
A Content Identifier — a cryptographic hash that uniquely identifies data. Same data always produces the same CID. Think of it as a fingerprint for your files.

---

## Prerequisites Setup (Hours 0–2)

### 1. Install Required Software

```bash
# Node.js 20+ (use nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20 && nvm use 20

# pnpm (package manager)
npm install -g pnpm

# Solana CLI
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
solana config set --url https://api.devnet.solana.com
```

### 2. Create Wallets

**Solana Devnet Wallet (for x402 payments):**
```bash
solana-keygen new --outfile ~/.config/solana/devnet.json
solana address          # Save this — your earning address
solana airdrop 2        # Get SOL for gas
```

**MetaMask Wallet (for Filecoin FEVM):**
1. Install MetaMask browser extension
2. Add custom network: Name=`Filecoin Calibration`, RPC=`https://api.calibration.node.glif.io/rpc/v1`, Chain ID=`314159`, Symbol=`tFIL`
3. Export private key (Account Details → Show Private Key) — needed for Hardhat deployment

### 3. Get Testnet Tokens

| Token | Where | Cooldown |
|-------|-------|----------|
| Devnet SOL | `solana airdrop 2` (CLI) | Unlimited |
| Devnet USDC | https://faucet.circle.com → Solana Devnet | 2 hours |
| Calibration tFIL | https://faucet.calibnet.chainsafe-fil.io | ~12 hours |

### 4. Get API Keys

| Service | URL | What For |
|---------|-----|----------|
| Anthropic API Key | https://console.anthropic.com | Claude AI for agent intelligence |
| Lighthouse API Key | https://files.lighthouse.storage | Filecoin/IPFS storage |

---

## Project Directory Structure

```
persistagent/
├── .env.example
├── .gitignore                      # node_modules/, .env, dist/, .next/, artifacts/, cache/
│
├── agent-server/                   # Express server — the AI agent that EARNS
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts                # Entry: Express + x402 middleware + routes
│   │   ├── config.ts               # Load env vars
│   │   ├── routes/
│   │   │   ├── analyze.ts          # x402-gated: AI data analysis ($0.01/req)
│   │   │   ├── generate.ts         # x402-gated: content generation ($0.005/req)
│   │   │   └── predict.ts          # x402-gated: market predictions ($0.02/req)
│   │   ├── services/
│   │   │   ├── claude.ts           # Claude API wrapper
│   │   │   ├── storage.ts          # Lighthouse upload/retrieve
│   │   │   └── identity.ts         # FEVM registry interaction (ethers.js)
│   │   └── agent/
│   │       ├── memory.ts           # Memory buffer → flush to Filecoin
│   │       ├── wallet.ts           # Earnings/expenses tracking
│   │       └── boot.ts             # Startup: register on-chain, load memories
│   └── .env
│
├── agent-client/                   # x402 fetch client — demonstrates SPENDING
│   ├── package.json
│   ├── src/
│   │   ├── index.ts                # x402 fetch wrapper setup
│   │   └── consumer.ts             # Demo script: pay for all 3 agent services
│   └── .env
│
├── contracts/                      # Solidity on Filecoin FEVM
│   ├── hardhat.config.ts
│   ├── contracts/
│   │   └── AgentIdentityRegistry.sol
│   ├── scripts/
│   │   └── deploy.ts
│   └── .env
│
└── dashboard/                      # Next.js 14 visualization
    ├── app/
    │   ├── layout.tsx              # Shell with nav
    │   ├── page.tsx                # Overview: earnings, expenses, balance
    │   ├── storage/page.tsx        # Filecoin data browser (CIDs, contents)
    │   ├── identity/page.tsx       # On-chain registry + reputation gauge
    │   └── activity/page.tsx       # Real-time event feed
    ├── components/
    │   ├── Navbar.tsx
    │   ├── EarningsChart.tsx
    │   ├── StorageList.tsx
    │   └── ReputationBadge.tsx
    └── lib/
        ├── api.ts                  # Fetch from agent-server
        └── contracts.ts            # Read from FEVM registry
```

---

## Phase 1: Agent Server with x402 Earning (Hours 2–6)

**Effort: MEDIUM | Owner: Person A (Backend)**
**Goal:** A running Express server where every AI endpoint costs USDC to call.

### Step 1.1 — Initialize

```bash
mkdir -p agent-server/src/{routes,services,agent} && cd agent-server
pnpm init
pnpm add express cors dotenv @x402/core @x402/express @x402/evm @x402/svm @anthropic-ai/sdk @lighthouse-web3/sdk ethers
pnpm add -D typescript @types/express @types/node @types/cors tsx
```

### Step 1.2 — Environment Variables (`agent-server/.env`)

```env
SVM_ADDRESS=<solana-wallet-public-key>
SVM_PRIVATE_KEY=<solana-wallet-private-key-base58>
FACILITATOR_URL=https://x402.org/facilitator
ANTHROPIC_API_KEY=<anthropic-api-key>
LIGHTHOUSE_API_KEY=<lighthouse-api-key>
FEVM_RPC_URL=https://api.calibration.node.glif.io/rpc/v1
FEVM_PRIVATE_KEY=<metamask-private-key>
REGISTRY_CONTRACT_ADDRESS=<filled-after-phase-3>
AGENT_NAME=PersistAgent-Alpha
PORT=4021
```

### Step 1.3 — Create Express Server with x402 (`src/index.ts`)

Key pattern (from official x402 Express examples):

```typescript
import express from "express";
import cors from "cors";
import { paymentMiddleware } from "@x402/express";
import { ExactSvmScheme } from "@x402/svm/exact/server";

const app = express();
app.use(cors());
app.use(express.json());

// Configure x402 payment routes
app.use(
  paymentMiddleware(
    {
      "GET /api/analyze": {
        accepts: [{
          scheme: "exact",
          price: "$0.01",
          network: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",  // Solana devnet
          payTo: process.env.SVM_ADDRESS,
        }],
        description: "AI-powered data analysis",
        mimeType: "application/json",
      },
      // Similar for /api/generate ($0.005) and /api/predict ($0.02)
    },
    // Register Solana payment scheme
    resourceServer.register("solana:*", new ExactSvmScheme()),
  ),
);
```

### Step 1.4 — Implement Route Handlers

Each route: parse query → call Claude API → log to memory buffer → return response.

```typescript
// Example: /api/analyze
app.get("/api/analyze", async (req, res) => {
  const { query } = req.query;
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: `Analyze: ${query}` }],
  });
  agentMemory.addEntry({ type: "analyze", query, response: response.content });
  res.json({ result: response.content, agent: "PersistAgent-Alpha" });
});
```

### Step 1.5 — Add Free Status Endpoint

`GET /api/status` — returns agent name, wallet, total earnings, requests served, memory count. Not x402-gated (dashboard calls this).

### Step 1.6 — Verify

```bash
pnpm tsx src/index.ts
curl http://localhost:4021/api/status           # Should return agent info
curl -v http://localhost:4021/api/analyze?query=test  # Should return HTTP 402
```

**Checklist:**
- [ ] Server starts on port 4021
- [ ] `/api/status` returns JSON
- [ ] Paid endpoints return 402 with payment requirements header
- [ ] Claude API call works when payment is provided

---

## Phase 2: Filecoin Storage via Lighthouse (Hours 6–8)

**Effort: EASY-MEDIUM | Owner: Person B (Storage/Contracts)**
**Goal:** Agent stores memory batches and identity metadata on Filecoin, retrievable by CID.

### Step 2.1 — Storage Service (`agent-server/src/services/storage.ts`)

```typescript
import lighthouse from "@lighthouse-web3/sdk";

export async function storeOnFilecoin(data: object, name: string): Promise<string> {
  const response = await lighthouse.uploadText(
    JSON.stringify(data),
    process.env.LIGHTHOUSE_API_KEY!,
    name
  );
  return response.data.Hash; // This is the CID
}

export async function retrieveFromFilecoin(cid: string): Promise<any> {
  const res = await fetch(`https://gateway.lighthouse.storage/ipfs/${cid}`);
  return res.json();
}
```

### Step 2.2 — Memory Module (`agent-server/src/agent/memory.ts`)

- Maintains in-memory buffer of interactions
- Flushes to Filecoin every 10 entries (or on-demand)
- Stores a "memory index" (list of all batch CIDs) on Filecoin too
- On-chain registry gets updated with the latest index CID

### Step 2.3 — Storage Endpoints (free, for dashboard)

```
GET  /api/storage/memories     → list all memory CIDs
GET  /api/storage/memory/:cid  → retrieve a specific batch
GET  /api/storage/identity     → agent's identity CID and data
POST /api/storage/flush        → manually trigger memory flush
```

### Step 2.4 — Verify

```bash
curl -X POST http://localhost:4021/api/storage/flush
curl http://localhost:4021/api/storage/memories
# Open the CID in a browser: https://gateway.lighthouse.storage/ipfs/<CID>
```

**Checklist:**
- [ ] `lighthouse.uploadText` returns a CID
- [ ] Data is retrievable from Lighthouse gateway
- [ ] Memory flush accumulates CIDs
- [ ] Identity metadata stored and retrievable

**Pitfall:** IPFS gateway serves data immediately; the actual Filecoin deal takes hours. For demo purposes, gateway retrieval is what matters.

---

## Phase 3: Identity Registry on Filecoin FEVM (Hours 6–9, parallel with Phase 2)

**Effort: MEDIUM | Owner: Person B (Storage/Contracts)**
**Goal:** On-chain Solidity contract tracking agent identities, reputation, and CID pointers.

### Step 3.1 — Initialize Hardhat Project

```bash
mkdir contracts && cd contracts
npx hardhat init   # Choose TypeScript project
pnpm add -D @nomicfoundation/hardhat-toolbox dotenv
```

### Step 3.2 — Configure for Filecoin Calibration (`hardhat.config.ts`)

```typescript
networks: {
  calibration: {
    url: "https://api.calibration.node.glif.io/rpc/v1",
    chainId: 314159,
    accounts: [process.env.PRIVATE_KEY!],
  },
},
```

### Step 3.3 — Write `AgentIdentityRegistry.sol`

Key functions:
- `registerAgent(name, dataCID)` — registers with 500/1000 starting reputation
- `updateDataCID(newCID)` — update Filecoin pointer after memory flush
- `updateReputation(agent, score)` — owner updates reputation (0–1000)
- `recordEarnings(agent, amount, requests)` — track earnings on-chain
- `getAgent(address)` / `getAllAgents()` — read agent info

Fields per agent: `walletAddress`, `name`, `dataCID`, `reputationScore`, `totalEarnings`, `totalRequests`, `registrationTime`, `isActive`

### Step 3.4 — Deploy

```bash
npx hardhat compile
npx hardhat run scripts/deploy.ts --network calibration
# Save the deployed address → put in agent-server/.env as REGISTRY_CONTRACT_ADDRESS
```

### Step 3.5 — Integrate with Agent Server (`agent-server/src/services/identity.ts`)

Use `ethers.js` to call the contract: `registerAgent()`, `updateDataCID()`, `getAgent()`.

### Step 3.6 — Verify

```bash
npx hardhat test                    # Local tests pass
npx hardhat run scripts/deploy.ts --network calibration  # Deploys successfully
# Check on explorer: https://calibration.filfox.info/en/address/<address>
```

**Checklist:**
- [ ] Contract compiles
- [ ] Local tests pass
- [ ] Deploys to Calibration testnet
- [ ] `registerAgent` callable from agent server
- [ ] `getAgent` returns correct data

**Pitfall:** Filecoin has 30-second blocks — transactions are slow. Pre-register before demo.

---

## Phase 4: Agent Client — x402 Spending (Hours 9–10)

**Effort: EASY | Owner: Person A (Backend)**
**Goal:** Demonstrate agents can also SPEND — one agent pays another's x402 API.

### Step 4.1 — Setup

```bash
mkdir -p agent-client/src && cd agent-client
pnpm init
pnpm add @x402/core @x402/fetch @x402/evm @x402/svm @solana/kit @scure/base viem dotenv
pnpm add -D typescript @types/node tsx
```

### Step 4.2 — Implement x402 Fetch Client (`src/index.ts`)

```typescript
import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import { ExactSvmScheme } from "@x402/svm/exact/client";
import { createKeyPairSignerFromBytes } from "@solana/kit";
import { base58 } from "@scure/base";

const svmSigner = await createKeyPairSignerFromBytes(
  base58.decode(process.env.SVM_PRIVATE_KEY!)
);
const client = new x402Client();
client.register("solana:*", new ExactSvmScheme(svmSigner));
const fetchWithPayment = wrapFetchWithPayment(fetch, client);

// This fetch auto-handles 402 → pays → retries
const res = await fetchWithPayment("http://localhost:4021/api/analyze?query=bitcoin+trends");
```

### Step 4.3 — Demo Consumer Script (`src/consumer.ts`)

Calls all 3 endpoints sequentially, prints results and total spent. Perfect for live demo.

### Step 4.4 — Verify

```bash
# Terminal 1: agent-server running
# Terminal 2:
cd agent-client && pnpm tsx src/consumer.ts
# Should see: paid requests succeed, AI responses returned
```

---

## Phase 5: Dashboard (Hours 9–13, parallel with Phase 4)

**Effort: MEDIUM | Owner: Person C (Frontend)**
**Goal:** Visual proof that the system works — earnings, storage, identity, activity in one UI.

### Step 5.1 — Initialize

```bash
npx create-next-app@latest dashboard --typescript --tailwind --app
cd dashboard && pnpm add ethers chart.js react-chartjs-2
```

### Step 5.2 — Four Pages

| Page | Route | Shows | Data Source |
|------|-------|-------|-------------|
| **Overview** | `/` | Earnings, expenses, balance, requests chart | `GET /api/status` |
| **Storage** | `/storage` | Memory CIDs, click to view contents, gateway links | `GET /api/storage/memories` |
| **Identity** | `/identity` | Agent name, wallet, reputation gauge, on-chain data | FEVM contract via ethers.js |
| **Activity** | `/activity` | Real-time event feed (earned, stored, reputation updated) | `GET /api/activity` |

### Step 5.3 — API Layer (`lib/api.ts`)

```typescript
const AGENT = process.env.NEXT_PUBLIC_AGENT_SERVER_URL || "http://localhost:4021";
export const getStatus = () => fetch(`${AGENT}/api/status`).then(r => r.json());
export const getMemories = () => fetch(`${AGENT}/api/storage/memories`).then(r => r.json());
export const getActivity = () => fetch(`${AGENT}/api/activity`).then(r => r.json());
```

### Step 5.4 — Contract Reading (`lib/contracts.ts`)

```typescript
const provider = new ethers.JsonRpcProvider("https://api.calibration.node.glif.io/rpc/v1");
const registry = new ethers.Contract(address, abi, provider);
export const getAgentInfo = (addr: string) => registry.getAgent(addr);
```

### Step 5.5 — Verify

```bash
pnpm dev   # http://localhost:3000
# Ensure agent-server is running, make some requests with agent-client
# Dashboard should show updating data
```

**Pitfall:** CORS — add `cors` middleware to Express server (already included in Phase 1 setup).

---

## Phase 6: Integration & Agent Lifecycle (Hours 13–16)

**Effort: MEDIUM | Owner: Full Team**
**Goal:** The agent "comes alive" — auto-registers, earns, stores memories, updates reputation.

### Agent Boot Sequence (`agent-server/src/agent/boot.ts`)

On server start:
1. Upload identity JSON to Filecoin → get identityCID
2. Check on-chain registry — if not registered, call `registerAgent(name, identityCID)`
3. Load previous memory index CID from registry (if exists)
4. Start Express server, begin accepting paid requests

### Post-Request Hooks

After each paid API call:
1. Add entry to memory buffer
2. Increment earnings counter
3. If buffer full → flush to Filecoin → update on-chain dataCID
4. Recalculate reputation: `min(1000, 500 + totalRequests * 2)`

### Full Demo Flow Test

```bash
# Terminal 1: Start agent (auto-registers on-chain, stores identity)
cd agent-server && pnpm tsx src/index.ts

# Terminal 2: Dashboard
cd dashboard && pnpm dev

# Terminal 3: Client makes paid requests
cd agent-client && pnpm tsx src/consumer.ts

# Watch: earnings increase, CIDs appear, reputation grows
```

---

## Team Work Distribution

### 3-Person Team

| Person | Role | Phases | Hours |
|--------|------|--------|-------|
| **A** | Backend/x402 | Phase 1 (server), Phase 4 (client), Phase 6 (integration) | ~10h |
| **B** | Contracts/Storage | Phase 2 (Filecoin), Phase 3 (Solidity), Phase 6 (integration) | ~9h |
| **C** | Frontend/Demo | Phase 5 (dashboard), demo prep, README, slides | ~9h |

**Parallel tracks:** A builds server while B builds contracts while C starts dashboard scaffold.

### 2-Person Team

| Person | Role | Phases |
|--------|------|--------|
| **A** | Full Backend | Phase 1, 2, 3, 4, 6 |
| **B** | Frontend + Demo | Phase 5, 6, demo prep |

---

## Potential Pitfalls & Solutions

| Pitfall | Solution |
|---------|----------|
| x402 package API changes | Pin exact versions; start from official examples at `coinbase/x402/examples/typescript/` |
| Solana devnet down | Pre-record successful transactions; show screenshots as backup |
| Lighthouse upload fails | Pre-upload several memory batches before demo; save CIDs |
| FEVM transactions slow (30s blocks) | Pre-register agent before demo; only show reads live |
| CORS errors | `app.use(cors())` as first middleware in Express |
| Run out of testnet tokens | Get tokens early and often (SOL unlimited, USDC every 2h, tFIL every 12h) |
| Private key format issues | x402 SVM expects base58 private key; use proper conversion |

---

## Demo Script (2–3 minutes)

### Pitch
> "We built AI agents that are truly self-sustaining. They earn cryptocurrency by selling intelligence via x402 micropayments on Solana. Their memory and identity persist on Filecoin — if the server restarts, the agent reloads its history. An on-chain registry on Filecoin's FEVM tracks reputation, creating a trustless marketplace of AI agents."

### Live Demo Steps
1. **Dashboard** — "Meet PersistAgent-Alpha. Registered on-chain, reputation 500, identity on Filecoin."
2. **Pay the agent** — Run consumer script. "The client just paid $0.01 USDC, Claude analyzed the data, response came back."
3. **Earnings update** — Dashboard ticks up.
4. **Filecoin storage** — "Memory flushed to Filecoin. Here's the CID." Open gateway URL in browser.
5. **On-chain identity** — Show Filecoin Calibration explorer with contract state.
6. **Agent-to-agent** — "Agent B pays Agent A for a prediction." Run second request.

### Pre-Demo Checklist
- [ ] All services running (server, dashboard)
- [ ] Wallets funded (SOL, USDC, tFIL)
- [ ] Agent pre-registered on-chain
- [ ] 5+ memory batches pre-uploaded (storage page looks populated)
- [ ] Filecoin explorer open to contract address
- [ ] Lighthouse gateway open to a CID
- [ ] Tested full flow 3 times

---

## Minimum Viable Demo (If Running Out of Time)

**MUST HAVE (80% of impact):**
1. Agent server with 1 x402-gated endpoint calling Claude
2. Agent client that pays and gets a response
3. At least 1 successful Filecoin upload with working gateway URL
4. Solidity contract deployed on Calibration
5. Basic dashboard showing earnings + CID link

**CUT IF NEEDED:**
- Multiple endpoints (keep just `/api/analyze`)
- Memory batching (just upload once manually)
- Reputation updates (keep default 500)
- Charts and fancy UI (plain text is fine)
- Auto-boot lifecycle (manually register)

---

## Key Resources

| Resource | URL |
|----------|-----|
| x402 Protocol Docs | https://docs.cdp.coinbase.com/x402/welcome |
| x402 GitHub (examples) | https://github.com/coinbase/x402 |
| x402 on Solana Guide | https://solana.com/developers/guides/getstarted/intro-to-x402 |
| Lighthouse SDK | https://docs.lighthouse.storage |
| Filecoin FEVM Docs | https://docs.filecoin.io/smart-contracts/fundamentals/filecoin-evm-runtime |
| FEVM Hardhat Kit | https://github.com/filecoin-project/fevm-hardhat-kit |
| Filecoin Calibration Faucet | https://faucet.calibnet.chainsafe-fil.io |
| Circle USDC Faucet | https://faucet.circle.com |
| Claude API Docs | https://docs.anthropic.com |
| Next.js Dashboard Tutorial | https://nextjs.org/learn/dashboard-app |

---

## Timeline (24-hour hackathon)

| Hours | Phase | Milestone |
|-------|-------|-----------|
| 0–2 | Setup | Tools installed, wallets created, tokens obtained, project scaffolded |
| 2–6 | Phase 1 + 3 (parallel) | Agent server with x402 earning ✓ + Solidity contract deployed ✓ |
| 6–9 | Phase 2 + 5 start (parallel) | Filecoin storage working ✓ + Dashboard scaffold ✓ |
| 9–13 | Phase 4 + 5 finish (parallel) | Agent client spending ✓ + Dashboard complete ✓ |
| 13–16 | Phase 6 | Full integration, agent lifecycle working |
| 16–18 | Testing | Full demo flow tested 3+ times |
| 18–20 | Polish | Dashboard styling, README, architecture doc |
| 20–22 | Demo prep | Script the demo, practice pitch, prepare backups |
| 22–24 | Buffer | Fix breakages, final rehearsal |
