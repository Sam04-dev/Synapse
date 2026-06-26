# ARCHITECTURE.md - Project Synapse Project Structure

## Design Pattern
- **Pattern**: Next.js App Router with Server Components (RSC) and Server Actions.
- **Data Flow**: Client requests -> Next.js API Route/Server Action -> AWS SDK -> Aurora DSQL / DynamoDB -> Response -> React Client Component.

## Folder Structure
```
synapse/
├── .ai/
│   ├── AI_RULES.md
│   ├── CODING_STANDARDS.md
│   └── SECURITY.md
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── PLAN.md
│   ├── TECH_STACK.md
│   ├── DATA_CONTRACTS.md
│   └── TESTING.md
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── agents/
│   │   │   │   └── route.ts
│   │   │   ├── memory/
│   │   │   │   └── route.ts
│   │   │   └── events/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/ (shadcn components)
│   │   ├── MemoryGraph.tsx
│   │   ├── Sidebar.tsx
│   │   └── ApiKeyManager.tsx
│   ├── lib/
│   │   ├── aws/
│   │   │   ├── dsql.ts
│   │   │   └── dynamodb.ts
│   │   ├── utils.ts
│   │   └── types.ts
│   └── tests/
│       ├── dsql.test.ts
│       └── dynamodb.test.ts
├── .env.local
├── next.config.mjs
├── package.json
└── tailwind.config.ts
```

## Component Responsibilities
- **`src/app/api/memory/route.ts`**: Handles POST/GET requests for agent memories, executing ACID transactions against Aurora DSQL.
- **`src/lib/aws/dsql.ts`**: Initializes and manages the AWS SDK client for Aurora DSQL, handling connection pooling and queries.
- **`src/lib/aws/dynamodb.ts`**: Implements the single-table design pattern for writing and retrieving agent action events.
- **`src/components/MemoryGraph.tsx`**: Renders the interactive node graph using React Flow, polling the API for real-time state changes.
- **`src/app/(dashboard)/page.tsx`**: The main server component that fetches initial state and passes it to client components.
