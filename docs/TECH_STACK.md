# TECH_STACK.md - Project Synapse Approved Technologies

## Languages & Minimum Versions
- TypeScript 5.4+
- Node.js 20.x+ (Vercel default runtime)
- React 18+

## UI & State Management Frameworks
- Next.js 14+ (App Router)
- Tailwind CSS 3.4+
- React Flow (for node-based UI)
- shadcn/ui (as a component basis, must be customized)

## Approved Native Libraries
- `@aws-sdk/client-dynamodb`
- `@aws-sdk/lib-dynamodb`
- `@aws-sdk/client-rds-data` (for Aurora DSQL Data API)
- `lucide-react` (icons)

## Forbidden Dependencies
- NO Prisma, NO Drizzle, NO Mongoose.
- NO Redux, NO Zustand (use React Context and URL state).
- NO axios (use native `fetch`).
- NO any database other than the specified AWS services.
