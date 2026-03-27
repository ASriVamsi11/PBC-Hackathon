# Mint Ai — Self-Sustaining AI Agents with x402 Payments & Filecoin Memory

> **Hackathon submission targeting Bounty 4 (x402 Micropayments) + Bounty 5 (Filecoin Infrastructure)**

Mint Ai is a full-stack system that enables AI agents to **earn money autonomously**, **persist their memory** on decentralized storage, and **maintain verifiable on-chain identity** — all without a central operator.

---

## The Core Idea

Traditional AI agents are stateless, free, and ephemeral. MintAI flips this:

1. **Agents charge for their services** via the x402 payment protocol (HTTP 402 + Solana micropayments)
2. **Agents remember everything** — each request is batched and stored permanently on Filecoin via Lighthouse
3. **Agents have on-chain identity** — reputation, earnings, and memory CIDs are anchored in a Solidity smart contract on Filecoin FEVM
4. **Anyone can verify an agent's history** — by reading the contract and retrieving memory batches from Filecoin

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                       Mint AI SYSTEM                       │
│                                                                 │
│   ┌──────────────┐   HTTP 402   ┌──────────────┐   ┌─────────┐ │
│   │ Agent Client │─────────────▶│ Agent Server │──▶│ Claude  │ │
│   │ (Consumer)   │◀─────────────│ (Express)    │   │   API   │ │
│   └──────────────┘   Solana     └──────┬───────┘   └─────────┘ │
│                      Payment           │                        │
│                                 ┌──────▼────────┐              │
│                                 │ Memory Manager│              │
│                                 │ (buffer→flush)│              │
│                                 └──────┬────────┘              │
│                                        │ Lighthouse SDK         │
│                                 ┌──────▼────────┐              │
│                                 │   Filecoin    │ ←── CIDs     │
│                                 │   Storage     │              │
│                                 └──────┬────────┘              │
│                                        │ CID anchor            │
│                                 ┌──────▼──────────────────┐    │
│                                 │ AgentIdentityRegistry   │    │
│                                 │ (Solidity / FEVM)       │    │
│                                 └─────────────────────────┘    │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  Dashboard (Next.js)  ·  Overview · Storage · Identity  │  │
│   └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Components

### 1. Agent Server (`agent-server/`)

An Express.js server that offers Claude-powered AI services behind x402 payment gates.

**Paid Endpoints:**

| Endpoint | Price | Description |
|----------|-------|-------------|
| `GET /api/analyze?query=<text>` | $0.01 USDC | Deep analysis via Claude — key insights, trends |
| `GET /api/generate?prompt=<text>` | $0.005 USDC | Content generation via Claude |
| `GET /api/predict?topic=<text>` | $0.02 USDC | Market prediction & trend analysis |

**Free Endpoints:**

| Endpoint | Description |
|----------|-------------|
| `GET /api/status` | Agent name, wallet address, earnings, uptime |
| `GET /api/storage/memories` | List all memory batch CIDs stored on Filecoin |
| `GET /api/storage/memory/:cid` | Retrieve a specific memory batch |
| `GET /api/storage/identity` | Agent's on-chain identity data |
| `POST /api/storage/flush` | Manually flush memory buffer to Filecoin |

**How payment works:**

1. Client calls `GET /api/analyze?query=bitcoin`
2. Server returns HTTP `402 Payment Required` with price: `$0.01 USDC`
3. Client signs a Solana payment using `@x402/fetch`
4. Payment proof returned to server, settled on Solana Devnet via the x402 facilitator
5. Server processes the request with Claude and returns the result
6. Earnings are tracked locally and eventually recorded on-chain

**Memory persistence:**

Each paid request is stored in a memory buffer. Every 10 requests, the buffer is serialized and uploaded to Filecoin via the Lighthouse SDK. The resulting CID is stored in the on-chain registry contract, creating a permanent, verifiable audit trail of everything the agent has ever done.

---

### 2. Agent Client (`agent-client/`)

A demo consumer that calls the agent server and automatically handles x402 payment flows.

```bash
cd agent-client && npm run consume
```

This runs three sample calls:
- Analyze bitcoin price trends (`$0.01`)
- Generate a decentralized AI marketplace intro (`$0.005`)
- Predict Solana DeFi ecosystem trends (`$0.02`)

Total spend per demo run: `$0.035 USDC`

The client uses `@x402/fetch` which transparently intercepts 402 responses, signs the payment on Solana, and retries the request — all without any manual intervention.

---

### 3. Smart Contracts (`contracts/`)

**`AgentIdentityRegistry.sol`** — deployed on Filecoin FEVM Calibration Testnet (Chain ID: 314159)

Each registered agent has an on-chain struct:

```solidity
struct Agent {
    address walletAddress;
    string  name;
    string  dataCID;          // IPFS/Filecoin CID of latest memory index
    uint256 reputationScore;  // 0–1000, starts at 500
    uint256 totalEarnings;    // in wei
    uint256 totalRequests;
    uint256 registrationTime;
    bool    isActive;
}
```

Key contract functions:
- `registerAgent(name, dataCID)` — agent self-registers with reputation 500
- `updateDataCID(newCID)` — agent updates its memory pointer after each Filecoin flush
- `recordEarnings(agent, amount, requests)` — logs earnings on-chain
- `updateReputation(agent, score)` — owner-controlled reputation scoring
- `getAllAgents()` — enumerate all registered agents

**Why Filecoin FEVM?** The smart contract lives on Filecoin, the same network as the agent's stored memory. This keeps the on-chain index pointer and the actual data on the same decentralized infrastructure.

---

### 4. Dashboard (`dashboard/`)

A Next.js 16 + React 19 monitoring interface with four views:

| Page | What you see |
|------|-------------|
| **Overview** | Total earnings, expenses, balance, request count, weekly earnings chart |
| **Storage** | Memory batches on Filecoin with CIDs, timestamps, sizes, gateway links |
| **Identity** | Reputation score (0–1000), tier visualization, wallet address, chain info |
| **Activity** | Real-time event feed — earnings, storage flushes, reputation changes, system events |

Run locally:
```bash
cd dashboard && npm run dev   # http://localhost:3000
```

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| AI model | Claude (`claude-sonnet-4-20250514`) via `@anthropic-ai/sdk` |
| Payment protocol | x402 — `@x402/express`, `@x402/fetch`, `@x402/svm` |
| Payment settlement | Solana Devnet |
| Decentralized storage | Filecoin via `@lighthouse-web3/sdk` |
| Smart contracts | Solidity 0.8.24 + Hardhat on Filecoin FEVM |
| Backend | Node.js 20 + Express + TypeScript |
| Frontend | Next.js 16.2 + React 19 + TailwindCSS 4 + Chart.js |

---

## Setup & Running

### Prerequisites
- Node.js 20+
- Solana wallet with Devnet SOL (for x402 payments)
- Filecoin Calibration testnet wallet with tFIL (for contract deployment)
- Anthropic API key
- Lighthouse API key (for Filecoin storage)

### 1. Deploy the smart contract

```bash
cd contracts
cp .env.example .env        # fill in PRIVATE_KEY (Filecoin wallet)
npm install
npm run compile
npm run deploy              # outputs: REGISTRY_CONTRACT_ADDRESS
```

### 2. Start the agent server

```bash
cd agent-server
cp .env.example .env        # fill in all keys + REGISTRY_CONTRACT_ADDRESS from step 1
npm install
npm run dev                 # http://localhost:4021
```

Required environment variables:
```
SVM_ADDRESS=<solana-public-key>
SVM_PRIVATE_KEY=<solana-private-key-base58>
ANTHROPIC_API_KEY=<key>
LIGHTHOUSE_API_KEY=<key>
FEVM_RPC_URL=https://api.calibration.node.glif.io/rpc/v1
FEVM_PRIVATE_KEY=<filecoin-wallet-private-key>
REGISTRY_CONTRACT_ADDRESS=<from-step-1>
FACILITATOR_URL=https://x402.org/facilitator
AGENT_NAME=MintAI-Alpha
PORT=4021
```

### 3. Run the consumer client

```bash
cd agent-client
cp .env.example .env        # fill in SVM_PRIVATE_KEY (a different Solana wallet)
npm install
npm run consume             # calls 3 endpoints, auto-pays with x402
```

### 4. Start the dashboard

```bash
cd dashboard
npm install
npm run dev                 # http://localhost:3000
```

---

## How It All Connects

```
Consumer calls /api/analyze
        │
        ├── Server returns HTTP 402
        │
        ├── Client pays $0.01 on Solana via @x402/fetch
        │
        ├── Server receives payment proof, calls Claude API
        │
        ├── Result stored in memory buffer
        │
        ├── (every 10 requests) memory batch → Lighthouse → Filecoin CID
        │
        ├── CID written to AgentIdentityRegistry on FEVM
        │
        └── Dashboard reflects earnings, CIDs, reputation in real-time
```

---

## Bounty Alignment

### Bounty 4 — x402 Micropayments
- Uses `@x402/express` middleware to gate three AI service endpoints
- Uses `@x402/fetch` on the client to automatically handle 402 → pay → retry
- Payments settle on Solana Devnet via the x402 facilitator at `x402.org`
- Demonstrates a viable economic model for AI agent services

### Bounty 5 — Filecoin Infrastructure
- Every agent request is eventually persisted to Filecoin via Lighthouse SDK
- Memory batches are addressable by CID and retrievable from any Filecoin gateway
- `AgentIdentityRegistry` smart contract deployed on Filecoin FEVM anchors each agent's memory index on-chain
- The contract's `dataCID` field links the on-chain record to the off-chain Filecoin data — creating a verifiable, tamper-proof history of the agent's entire operation

---

## Networks

| Network | Purpose | Chain ID / RPC |
|---------|---------|----------------|
| Solana Devnet | x402 payment settlement | Devnet RPC |
| Filecoin FEVM Calibration | Smart contract deployment | 314159 / `api.calibration.node.glif.io` |
| Filecoin (via Lighthouse) | Agent memory storage | `gateway.lighthouse.storage` |

---

## Project Structure

```
PBC-Hackathon/
├── agent-server/          # Express + x402 + Claude + Lighthouse
│   └── src/
│       ├── index.ts       # Server entry point + route definitions
│       ├── config.ts      # Environment config loader
│       ├── agent/
│       │   ├── memory.ts  # Memory buffer + Filecoin flush logic
│       │   └── wallet.ts  # Earnings tracker
│       └── services/
│           ├── claude.ts  # Anthropic SDK wrapper
│           ├── storage.ts # Lighthouse SDK wrapper
│           └── identity.ts# Contract interaction helpers
├── agent-client/          # x402 consumer demo
│   └── src/
│       ├── index.ts       # x402 client setup
│       └── consumer.ts    # Demo script
├── contracts/             # Solidity + Hardhat
│   ├── contracts/
│   │   └── AgentIdentityRegistry.sol
│   └── scripts/
│       └── deploy.ts
└── dashboard/             # Next.js monitoring UI
    └── app/
        ├── page.tsx           # Overview
        ├── storage/page.tsx   # Memory / Filecoin
        ├── identity/page.tsx  # On-chain reputation
        ├── activity/page.tsx  # Event feed
        └── components/
            └── Sidebar.tsx
```
