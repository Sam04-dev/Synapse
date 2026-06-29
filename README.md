<div align="center">

# SYNAPSE

**Stateful Memory Infrastructure for Autonomous AI Agents**

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2.35-000000?style=flat-square&logo=next.js)](https://nextjs.org)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=flat-square&logo=vercel)](https://vercel.com)
[![Aurora DSQL](https://img.shields.io/badge/Aurora-DSQL-FF9900?style=flat-square&logo=amazon-aws)](https://aws.amazon.com/rds/aurora/dsql/)
[![DynamoDB](https://img.shields.io/badge/Backed_by-DynamoDB-FF9900?style=flat-square&logo=amazon-dynamodb)](https://aws.amazon.com/dynamodb/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4+-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![License Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-22c55e?style=flat-square)](LICENSE)

</div>

---

## What Problem Synapse Solves

AI agents are smart but amnesiac. Every major LLM framework — LangChain, CrewAI, AutoGen — makes it trivial to build an agent that reasons well. None of them solve what happens to that agent's state between sessions, across multiple concurrent instances, or when something goes wrong at 2am and you need to know exactly what it did and why.

Developers building production agent systems run into the same three walls every time:

**1. Agents forget everything.**
Context windows expire. Sessions end. The next request starts from zero. A customer support agent that learned a user prefers refund-over-replacement will forget that preference the moment the session closes. Every interaction becomes a first interaction.

**2. Concurrent agents corrupt shared state.**
When two agents — say, a billing bot and a support bot — write to the same customer record within the same 200ms window, traditional vector stores and key-value caches offer no transactional guarantees. No locks, no isolation, no rollback. State corruption is not a theoretical risk at scale — it is a guarantee.

**3. There is no audit trail.**
When an agent makes a bad decision — approves a fraudulent claim, sends the wrong message, updates the wrong record — there is nothing to replay. No timestamped log of what it wrote, when, and why. Debugging a multi-agent system without an immutable event log is forensic archaeology in the dark.

Synapse is a purpose-built memory API that solves all three. It gives autonomous agents a transactional, ACID-compliant memory layer backed by Aurora DSQL for relational state and DynamoDB for immutable event logging — accessible over a single REST API.

---

## Who It's For

Synapse is built for the engineers and teams who have already shipped an AI agent and discovered that "it works in a demo" is not the same as "it works in production."

| Who | The specific pain | What Synapse gives them |
|---|---|---|
| **AI backend engineers** | Agents built on LangChain / CrewAI lose context between sessions; custom Redis/Postgres memory layers take weeks to build correctly | A drop-in REST API — write a memory node with one `POST`, retrieve the full graph with one `GET`, no framework coupling |
| **Startups shipping agent products** | Racing to production with no time to design a memory architecture; concurrent agents hitting the same user records | Managed infrastructure with SERIALIZABLE isolation already built in — no distributed systems PhD required |
| **Enterprise AI teams** | Regulatory and compliance requirements demand a full audit trail of every AI decision | An immutable DynamoDB event log — every agent action timestamped, persisted forever, replayable on demand |
| **CTOs evaluating agent infrastructure** | Evaluating whether multi-agent systems can meet enterprise SLAs | A live ACID stress test they can run themselves: 50 concurrent writes, observable pass/fail, real database |

---

## Why I Chose This Problem

I chose this problem because the gap between "AI can do this" and "AI does this reliably in production" is where most real projects fail — and it's almost never the model's fault.

In 2024, the tools for building agents improved dramatically. The tools for running them in production did not. Developers can prototype a multi-agent workflow in an afternoon. Shipping that same workflow to production — with persistent memory, concurrent write safety, and a full audit trail — takes weeks of infrastructure work that has nothing to do with AI.

That asymmetry felt like the right problem to build on. Not because it is flashy, but because it is the unsexy bottleneck that determines whether an AI product survives contact with real users. Every team building agents is going to hit it. The ones who hit it with infrastructure already in place will ship. The others will rebuild the same memory layer from scratch, make the same mistakes, and wonder why their agents behave inconsistently in production.

Synapse is the infrastructure layer I wish had existed the first time I debugged a multi-agent state corruption issue. The problem is real, the customers are already building, and the right solution requires genuine database engineering — not just wrapping an LLM.

---

## The Solution — Dual-Database Architecture

Synapse separates concerns cleanly: relational ACID state goes to Aurora DSQL, immutable event streams go to DynamoDB.

**Aurora DSQL — Relational State**
Distributed SQL with `SERIALIZABLE` isolation. Handles concurrent agent writes to shared state with zero conflicts. Schema-enforced relational integrity across agents, memories, and relationships. Every write is atomic. Every read is consistent.

**DynamoDB — Immutable Event Log**
Single-table design for infinite-scale event ingestion. Every agent action becomes an immutable record — written once, never updated. Enables per-agent chronological replay at any point in time. Full auditability, perfect replayability, zero schema migrations.

**Vercel — Global Edge Delivery**
Next.js 14 App Router deployed on Vercel's global edge network. API routes execute within 50ms of the requester. The dashboard streams live metrics from both databases in a single round trip.

### System Architecture

```mermaid
graph TB
    subgraph Clients["Clients"]
        DASH[Developer Dashboard<br/>Next.js App Router + React Flow]
        AGENT[AI Agent<br/>Python · JS · Any HTTP client]
    end

    subgraph Vercel["Vercel Edge — Global"]
        AUTH[Auth Layer<br/>Session Cookies]
        API_A[POST /api/agents<br/>Create namespace + API key]
        API_M[POST /api/memory<br/>Write memory node + edge]
        API_E[POST /api/events<br/>Log agent action]
        API_MET[GET /api/metrics<br/>Live system telemetry]
        API_STRESS[POST /api/stress-test<br/>ACID concurrency proof]
    end

    subgraph AWS["AWS Cloud"]
        DSQL[(Aurora DSQL<br/>SERIALIZABLE Isolation<br/>agents · memories<br/>relationships · users)]
        DDB[(DynamoDB<br/>SynapseEventLog<br/>Immutable Event Log)]
    end

    DASH -->|polling| API_MET
    DASH -->|fetch| API_A
    AGENT -->|Bearer token| API_M
    AGENT -->|Bearer token| API_E
    AUTH --> API_A & API_M & API_E & API_MET
    API_A & API_M & API_STRESS --> DSQL
    API_E --> DDB
    API_MET --> DSQL
    API_MET --> DDB
```

### The ACID Compliance Proof

Synapse ships with a live stress-test suite accessible from the Metrics dashboard. Clicking "Run ACID Test" fires 50 concurrent write operations to Aurora DSQL and reports:

- **Total writes attempted** vs **successful** vs **failed**
- **Writes per second** sustained throughput
- **Zero data loss** under concurrent load — every write either commits fully or rolls back, no partial states

This is not a benchmark claim. It is a live, observable demonstration with real database connections.

---

## Try It Live

The dashboard is production-deployed. Sign in with the sample credentials to explore a pre-seeded agent namespace with live data:

```
Email:    robertsamueli40@gmail.com
Password: Synapse@123
```

From the dashboard you can:

1. **View the Live Memory Graph** — nodes and edges rendered in React Flow, data from Aurora DSQL
2. **Stream the Event Feed** — real-time DynamoDB event log with relative timestamps and action type filters
3. **Run the ACID Stress Test** — 50 concurrent writes, observable pass/fail in the Metrics panel
4. **Run the Simulation** — continuous event generation to show live throughput metrics
5. **Create your own Agent Namespace** — provision a new namespace and receive an API key

---

## Tech Stack

### Core

| Layer | Technology | Version | Role |
|---|---|---|---|
| Framework | Next.js App Router | 14.2.35 | Server Components, API routes, streaming |
| Language | TypeScript | 5.4+ | End-to-end type safety |
| Runtime | Node.js | 20.x | Vercel serverless runtime |
| Styling | Tailwind CSS | 3.4+ | Utility-first, dark-mode native |

### Databases

| Database | Version | Purpose |
|---|---|---|
| Aurora DSQL | AWS SDK v3.1073 | ACID-compliant relational state |
| DynamoDB | AWS SDK v3.1073 | Immutable event log |

### Visualization & UI

| Library | Version | Purpose |
|---|---|---|
| React Flow | 11.11.4 | Interactive memory graph |
| Lucide React | 1.21.0 | Icon system |
| shadcn/ui | — | Component primitives |

---

## Getting Started

### Prerequisites

- Node.js 20.x+
- An AWS account with Aurora DSQL cluster and DynamoDB table provisioned
- A Vercel account (optional — runs locally without it)

### 1. Clone and Install

```bash
git clone https://github.com/Sam04-dev/Synapse.git
cd Synapse
npm install
```

### 2. Configure Environment

Create `.env.local` at the project root:

```env
# Aurora DSQL
POSTGRES_HOST=your-cluster.dsql.us-east-1.on.aws
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=admin
POSTGRES_PASSWORD=your-token

# DynamoDB
AWS_REGION=ap-southeast-2
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
DYNAMODB_TABLE_NAME=SynapseEventLog

# Auth
JWT_SECRET=your-32-char-minimum-secret-here
```

> **SSL Certificate**: Download the [Aurora DSQL global CA bundle](https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem) and place it as `global-bundle.pem` in the project root.

### 3. Initialize Schema

```bash
curl -X POST http://localhost:3000/api/setup
```

### 4. Run Locally

```bash
npm run dev
# → http://localhost:3000
```

### 5. Seed Sample Data (Optional)

```bash
curl -X POST http://localhost:3000/api/seed
```

---

## API Reference

All endpoints accept and return `application/json`. Error responses: `{ "error": "string", "code": number }`.

### Agents

```http
GET  /api/agents           → { "agents": [{ "id", "name", "createdAt", "apiKeyHash" }] }
POST /api/agents           → { "id", "name", "createdAt", "apiKey" }  ← shown once only
DELETE /api/agents/:id     → { "success": true }
```

---

### Memory

```http
POST /api/memory
{
  "agentId": "uuid",
  "memoryContent": "User prefers dark mode and metric units",
  "relationshipType": "PREFERS",
  "parentMemoryId": "uuid"
}
```

```http
GET /api/memory?agentId=uuid
→ {
    "nodes": [{ "id", "content", "timestamp", "type" }],
    "edges": [{ "id", "source", "target", "label" }]
  }
```

---

### Events

```http
POST /api/events
{
  "agentId": "uuid",
  "action": "MEMORY_CREATED",
  "payload": { "key": "value" }
}
→ { "success": true }
```

---

### Metrics

```http
GET /api/metrics
→ {
    "memories": number,
    "agents": number,
    "events": number,
    "eventsPerSec": number,
    "avgLatencyMs": number,
    "dsqlStatus": "connected",
    "dynamoStatus": "connected"
  }
```

---

### Stress Test

```http
POST /api/stress-test
→ {
    "totalWrites": 50,
    "successful": 50,
    "failed": 0,
    "durationMs": 234,
    "writesPerSecond": 213.7
  }
```

---

## Why Aurora DSQL Over Alternatives

| Solution | ACID Transactions | Concurrent Agent Writes | Relational Integrity | Scalability |
|---|---|---|---|---|
| **Aurora DSQL** (Synapse) | ✅ SERIALIZABLE | ✅ Zero conflicts | ✅ FK constraints | ✅ Distributed |
| Pinecone / Weaviate | ❌ None | ❌ No isolation | ❌ No schema | ✅ |
| Redis | ❌ Optimistic only | ⚠️ WATCH/MULTI | ❌ No relational | ⚠️ |
| Supabase (Postgres) | ✅ | ⚠️ Connection limits | ✅ | ⚠️ Vertical |
| Firebase Firestore | ⚠️ Single-doc only | ⚠️ | ❌ | ✅ |
| SQLite (local) | ✅ | ❌ Write-serialized | ✅ | ❌ |

Aurora DSQL is the only solution that delivers full SQL semantics, `SERIALIZABLE` isolation, and horizontal distribution simultaneously — the exact combination required for multi-agent concurrent writes at scale.

---

## Security

- **Sessions** — Signed with HMAC-SHA256, `httpOnly` cookies, 7-day TTL, timing-safe verification
- **API Keys** — SHA-256 hashed before storage; raw key shown once at creation, never stored
- **Database** — All connections use TLS; credentials live only in environment variables
- **No client-side secrets** — All AWS and database calls run server-side only; the browser never sees credentials

---

## Roadmap

### v0.2 — Agent SDK
- Python and JavaScript client libraries
- Automatic memory compression when context window approaches limit
- Streaming event webhooks

### v0.3 — Team Collaboration
- Shared namespaces across team members
- Role-based access control (read-only vs. read-write API keys)
- Per-namespace usage quotas

### v0.4 — Enterprise
- SSO via SAML 2.0 / OIDC
- Audit log export (S3, Splunk, Datadog)
- On-premise deployment
- Custom SLA with 99.99% uptime guarantee

### v1.0 — Production GA
- Stripe billing integration (Starter / Pro / Enterprise tiers live)
- Multi-region deployment (us-east-1 + eu-west-1 + ap-southeast-2)
- Real-time WebSocket event streaming
- Memory summarization via LLM compression

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Open a pull request with a description of the change and its motivation

---

## Privacy & Security Policy

Synapse stores developer API keys as SHA-256 hashes only. Raw keys cannot be recovered. Agent memory content is stored in Aurora DSQL and is isolated per agent namespace. Event logs in DynamoDB are append-only. No user behavioral data is sold or shared with third parties. All data is encrypted in transit (TLS 1.2+) and at rest (AES-256, AWS managed keys).

For security disclosures, contact: **founders@synapse.engine**

---

## License

Apache License 2.0 — see [LICENSE](LICENSE) for details.

Licensed under the Apache License, Version 2.0.

---

<div align="center">

Built for the **H0 Hackathon — Open Innovation Track**

*Real databases. Real ACID transactions. Real infrastructure.*

**[Launch App](https://synapse-xi-two.vercel.app) · [API Docs](/docs)**

</div>
