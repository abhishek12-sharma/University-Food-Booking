# Antigravity Integration Prompt

Use this prompt only after the six modules have been integrated into one repository.

```text
You are now the integration engineer for the University Food Pre-Booking System.

Before modifying anything, read:

1. README.md
2. API_CONTRACT.md
3. DATABASE_SCHEMA.md
4. ARCHITECTURE.md
5. DEVELOPMENT_RULES.md
6. docs/INTEGRATION_CHECKLIST.md

This repository was developed by six developers.

DO NOT rebuild the project from scratch.

First inspect the entire repository.

Identify:

- duplicate files
- duplicate APIs
- duplicate database models
- broken imports
- missing dependencies
- API mismatches
- frontend/backend response mismatches
- route mismatches
- authentication inconsistencies
- RBAC problems
- database inconsistencies
- environment problems
- CORS problems
- Socket.IO problems
- payment integration problems
- QR validation problems
- ML integration problems
- build errors
- runtime errors
- security issues
- missing end-to-end functionality

FIRST create:

docs/INTEGRATION_REPORT.md

The report must contain:

1. Current architecture
2. Module inventory
3. Build status
4. API compatibility status
5. Database compatibility status
6. Authentication/RBAC status
7. Payment status
8. QR status
9. Socket.IO status
10. ML status
11. Security findings
12. Critical bugs
13. Recommended fixes

Do not make major architectural changes before the report is complete.

After inspection, fix integration problems using minimal targeted changes.

Rules:

- Preserve working functionality.
- Do not silently change API contracts.
- Do not delete working modules just to simplify the project.
- Do not create duplicate APIs.
- Do not create a second database.
- Do not expose secrets.
- Do not bypass backend authorization.
- Do not trust frontend payment confirmation.
- Do not trust frontend QR validation.
- Do not fabricate ML results.

Then run:

1. Backend tests
2. Frontend build
3. ML service tests
4. API smoke tests
5. End-to-end order flow

Fix errors introduced during integration.

Finally create:

docs/FINAL_TEST_REPORT.md

Include:

- tests executed
- passed tests
- failed tests
- fixed issues
- remaining issues
- deployment blockers
```
