# PRD.md - Project Synapse Product Requirements

## App Overview
Project Synapse is a B2B SaaS platform acting as a transactional memory and state engine for autonomous AI agents. It provides developers with an API to give agents long-term memory, cross-session state, and real-time inter-agent communication. The target platform is a web application (Next.js) deployed on Vercel, utilizing Amazon Aurora DSQL for relational state and DynamoDB for high-throughput event logging.

## Target Audience
- AI Backend Engineers building autonomous agents (LangChain, CrewAI).
- Startups scaling AI applications facing context window limits and agent hallucinations.
- Enterprise teams needing ACID-compliant state management for concurrent AI operations.

## Core Features (MVP)
1. **Developer Dashboard**: A sleek, dark-mode UI showing API keys, agent sessions, and real-time metrics.
2. **Live Memory Graph**: An interactive node-based UI (React Flow) visualizing agent memories and relationships in real-time.
3. **State API**: REST/Serverless endpoints for creating agents, writing memories, and querying relational state (Aurora DSQL).
4. **Event Log**: High-throughput ingestion endpoint for agent actions/logs (DynamoDB).
5. **Dual-Database Sync**: Seamless data flow between DSQL (state) and DynamoDB (events) via Next.js API routes.

## Non-Functional Requirements
- **Performance**: API response times under 100ms for state reads.
- **Scalability**: Must handle concurrent writes from multiple agents without race conditions (leveraging Aurora DSQL).
- **Real-time**: UI must reflect database state changes within 1-2 seconds via polling or WebSockets.
- **Accessibility**: WCAG 2.1 AA compliant dashboard.

## User Flow
1. Developer signs up and lands on the empty dashboard.
2. Developer creates a new "Agent Namespace" and receives an API key.
3. Developer integrates the API into their Python/JS AI agent script.
4. As the agent runs, it writes state/memories to Synapse via API.
5. The developer watches the Live Memory Graph populate in real-time on the dashboard, proving stateful ACID compliance.
