# Mint AI — Self-Sustaining AI Agents with x402 Payments & Filecoin Memory

> **Hackathon submission targeting Bounty 4 (x402 Micropayments) + Bounty 5 (Filecoin Infrastructure)**

Mint AI is a full-stack system that enables AI agents to **earn money autonomously**, **persist their memory** on decentralized storage, and **maintain verifiable on-chain identity** — all without a central operator.

---

## System Architecture

```mermaid
graph TD
    Client["Agent Client\n(Consumer)"]
    Server["Agent Server\n(Express.js)"]
    Claude["Claude API\nclaude-sonnet-4"]
    Memory["Memory Manager\nbuffer → flush"]
    Filecoin["Filecoin Storage\nvia Lighthouse SDK"]
    Registry["AgentIdentityRegistry\nSolidity / FEVM"]
    Solana["Solana Devnet\nx402 Payment Settlement"]
    Dashboard["Dashboard\nNext.js Monitoring UI"]

    Client -- "GET /api/analyze" --> Server
    Server -- "HTTP 402 + price" --> Client
    Client -- "Sign & pay $0.01 USDC" --> Solana
    Solana -- "Payment proof" --> Server
    Server -- "Prompt" --> Claude
    Claude -- "Response" --> Server
    Server --> Memory
    Memory -- "every 10 requests" --> Filecoin
    Filecoin -- "CID" --> Registry
    Registry -- "on-chain state" --> Dashboard
    Server -- "earnings / status" --> Dashboard
```

---

## Payment Flow

```mermaid
sequenceDiagram
    participant C as Agent Client
    participant S as Agent Server
    participant X as x402 Facilitator
    participant Sol as Solana Devnet
    participant AI as Claude API

    C->>S: GET /api/analyze?query=bitcoin
    S-->>C: 402 Payment Required ($0.01 USDC)
    C->>X: Sign payment via @x402/fetch
    X->>Sol: Settle micropayment
    Sol-->>X: Confirmed
    X-->>C: Payment proof
    C->>S: Retry request + payment proof
    S->>AI: Claude prompt
    AI-->>S: Analysis result
    S-->>C: 200 OK + result
```

---

## Memory Persistence Flow

```mermaid
flowchart LR
    Req["Paid Request"] --> Buffer["Memory Buffer"]
    Buffer -- "10 requests" --> Batch["Serialize Batch"]
    Batch --> Lighthouse["Lighthouse SDK"]
    Lighthouse --> FC["Filecoin Storage"]
    FC -- "CID" --> Contract["AgentIdentityRegistry\nFEVM"]
    Contract --> Dashboard["Dashboard\nCID viewer"]
```

---

## Components

### 1. Agent Server (`agent-server/`)

An Express.js server offering Claude-powered AI services behind x402 payment gates.

**Paid Endpoints:**

| Endpoint | Price | Description |
|----------|-------|-------------|
| `GET /api/analyze?query=<text>` | $0.01 USDC | Deep analysis via Claude |
| `GET /api/generate?prompt=<text>` | $0.005 USDC | Content generation via Claude |
| `GET /api/predict?topic=<text>` | $0.02 USDC | Market prediction & trend analysis |

**Free Endpoints:**

| Endpoint | Description |
|----------|-------------|
| `GET /api/status` | Agent name, wallet, earnings, uptime |
| `GET /api/storage/memories` | List all memory batch CIDs on Filecoin |
| `GET /api/storage/memory/:cid` | Retrieve a specific memory batch |
| `GET /api/storage/identity` | Agent's on-chain identity data |
| `POST /api/storage/flush` | Manually flush memory buffer to Filecoin |

---

### 2. Smart Contract (`contracts/`)

**`AgentIdentityRegistry.sol`** — deployed on Filecoin FEVM Calibration Testnet (Chain ID: 314159)

```mermaid
classDiagram
    class Agent {
        address walletAddress
        string name
        string dataCID
        uint256 reputationScore
        uint256 totalEarnings
        uint256 totalRequests
        uint256 registrationTime
        bool isActive
    }

    class AgentIdentityRegistry {
        +registerAgent(name, dataCID)
        +updateDataCID(newCID)
        +recordEarnings(agent, amount, requests)
        +updateReputation(agent, score)
        +getAllAgents()
    }

    AgentIdentityRegistry --> Agent
```

---

### 3. Dashboard (`dashboard/`)

```mermaid
graph LR
    Overview["Overview\nEarnings · Balance · Chart"]
    Storage["Storage\nFilecoin CIDs · Timestamps"]
    Identity["Identity\nReputation · Wallet · Chain"]
    Activity["Activity\nReal-time Event Feed"]

    Sidebar --> Overview
    Sidebar --> Storage
    Sidebar --> Identity
    Sidebar --> Activity
```

---

## Technology Stack

```mermaid
graph TD
    subgraph Frontend
        Next["Next.js 16.2"]
        React["React 19"]
        Tailwind["TailwindCSS 4"]
        Chart["Chart.js"]
    end

    subgraph Backend
        Express["Express + TypeScript"]
        AnthropicSDK["@anthropic-ai/sdk\nclaude-sonnet-4"]
    end

    subgraph Payments
        X402["x402 Protocol\n@x402/express · @x402/fetch"]
        SolDev["Solana Devnet"]
    end

    subgraph Storage
        Lighthouse["Lighthouse SDK"]
        FilecoinNet["Filecoin Network"]
    end

    subgraph Contracts
        Solidity["Solidity 0.8.24"]
        Hardhat["Hardhat"]
        FEVM["Filecoin FEVM\nCalibration Testnet"]
    end

    Next --> Express
    Express --> AnthropicSDK
    Express --> X402
    X402 --> SolDev
    Express --> Lighthouse
    Lighthouse --> FilecoinNet
    Solidity --> Hardhat
    Hardhat --> FEVM
```

---

## Setup & Running

### Prerequisites
- Node.js 20+
- Solana wallet with Devnet SOL
- Filecoin Calibration testnet wallet with tFIL
- Anthropic API key
- Lighthouse API key

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
cp .env.example .env        # fill in all keys + REGISTRY_CONTRACT_ADDRESS
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
cp .env.example .env        # fill in SVM_PRIVATE_KEY (different Solana wallet)
npm install
npm run consume             # calls 3 endpoints, auto-pays with x402
```

Total spend per demo run: `$0.035 USDC`

### 4. Start the dashboard

```bash
cd dashboard
npm install
npm run dev                 # http://localhost:3000
```

---

## Bounty Alignment

### Bounty 4 — x402 Micropayments
- `@x402/express` middleware gates three AI service endpoints
- `@x402/fetch` on the client automatically handles 402 → pay → retry
- Payments settle on Solana Devnet via the x402 facilitator at `x402.org`

### Bounty 5 — Filecoin Infrastructure
- Every agent request is eventually persisted to Filecoin via Lighthouse SDK
- Memory batches are addressable by CID from any Filecoin gateway
- `AgentIdentityRegistry` on Filecoin FEVM anchors each agent's memory index on-chain
- The `dataCID` field links on-chain records to off-chain Filecoin data — creating a verifiable, tamper-proof audit trail

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
│       ├── index.ts       # Server entry point + routes
│       ├── config.ts      # Environment config
│       ├── agent/
│       │   ├── memory.ts  # Memory buffer + Filecoin flush
│       │   └── wallet.ts  # Earnings tracker
│       └── services/
│           ├── claude.ts  # Anthropic SDK wrapper
│           ├── storage.ts # Lighthouse SDK wrapper
│           └── identity.ts# Contract interaction
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
