# TESTING.md - Verification Requirements

## Testing Framework
- Vitest for unit and integration testing.

## Mandatory Test Coverage
- All AWS SDK wrapper functions in `src/lib/aws/` must have corresponding `.test.ts` files.
- API routes in `src/app/api/` must be tested for both success (200) and error (500) responses.

## Mandatory Edge Cases to Test
- **Aurora DSQL**: Concurrent write attempts to the same agent state.
- **DynamoDB**: High-volume event insertion (mock batch writes).
- **API**: Malformed JSON payloads.
- **API**: Missing API key authentication.

## Definition of Done
- All Vitest tests pass.
- The Live Memory Graph successfully renders data fetched from Aurora DSQL.
- The application compiles and runs on Vercel without runtime errors.
- No TypeScript linting errors.
