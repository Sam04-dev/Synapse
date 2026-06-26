# CODING_STANDARDS.md - Code Quality Rules

## Commenting Rules
- NO obvious comments. Only comment complex 'why' logic (e.g., why a specific DSQL transaction isolation level is used), not 'what' the code does.

## File & Function Limits
- No single file shall exceed 200 lines. Split into modular components.
- Functions must do one thing only and not exceed 40 lines. Abstract AWS SDK calls into `src/lib/aws/`.

## Error Handling
- Do not use `any` types in TypeScript.
- Must use try/catch blocks around all AWS SDK calls.
- Must return standardized error responses: `{ error: "string", code: "number" }`.

## Code Bloat & Dead Code
- No dead code, no commented-out blocks.
- Remove all default v0 boilerplate text and unused imports.
- If a UI element is not wired to a database or state, delete it.
