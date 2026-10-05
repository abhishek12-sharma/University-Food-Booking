# University Food Pre-Booking System — Development Rules

**Version:** 1.0  
**Purpose:** Prevent conflicts between six developers and multiple AI coding sessions.

## 1. Golden Rule

This is ONE project.

Do not build six independent applications.

## 2. Source of Truth

The following documents are authoritative:

1. `API_CONTRACT.md`
2. `DATABASE_SCHEMA.md`
3. `ARCHITECTURE.md`
4. `DEVELOPMENT_RULES.md`

Read them before coding.

## 3. API Rules

- Do not invent endpoints.
- Do not rename endpoints casually.
- Do not silently change request/response structures.
- New APIs must be documented first.
- Breaking changes require team approval.
- Use standard response envelopes.

## 4. Database Rules

- One MySQL database.
- One shared schema.
- No duplicate tables.
- No separate database per member.
- Schema changes require migration.
- Update `DATABASE_SCHEMA.md` after approved changes.

## 5. Ownership

### Member 1
Auth, RBAC, project foundation, integration, Socket.IO foundation.

### Member 2
User frontend.

### Member 3
Core backend and database.

### Member 4
Admin frontend.

### Member 5
Shopkeeper frontend and operations.

### Member 6
Payment, analytics, waste analytics, ML.

Ownership does not prevent collaboration, but changes to another module should be coordinated.

## 6. Git

Branches:

```text
main
develop
feature/auth
feature/user-panel
feature/core-backend
feature/admin-panel
feature/shopkeeper
feature/payment-ml
```

Rules:

- Never push unfinished work directly to `main`.
- Use meaningful commits.
- Pull/rebase from `develop` before major merges.
- Review conflicts carefully.
- Test before merge.

Example commits:

```text
feat(auth): implement JWT login
feat(user): add food court browsing
feat(order): implement order creation
fix(payment): validate webhook signature
```

## 7. AI Coding Rules

Claude/Antigravity must:

- Read project documents first.
- Inspect existing files before creating replacements.
- Avoid unnecessary rewrites.
- Avoid duplicate components/services/controllers.
- Preserve working functionality.
- Report assumptions.
- Run tests/builds.
- Fix errors introduced by the AI.

Never blindly accept generated code.

## 8. Environment Variables

Never commit:

```text
.env
```

Commit:

```text
.env.example
```

Secrets include:

- JWT secret
- DB password
- Payment secret
- Webhook secret
- ML credentials if any
- External API keys

## 9. Frontend Rules

- No direct database access.
- Use Axios/API services.
- Use reusable components.
- Handle loading/error/empty states.
- Do not trust frontend totals.
- Do not store payment secrets.
- Do not implement authorization only in frontend.

## 10. Backend Rules

Backend is authoritative for:

- Authentication
- Authorization
- Prices
- Totals
- Inventory
- Pickup capacity
- Order status
- Expiry
- Payment verification
- QR validation

## 11. Payment Rules

- Use an approved gateway.
- Server-side verification required.
- Webhooks must be verified.
- Webhooks must be idempotent.
- Never trust frontend payment confirmation.
- Never expose secrets.

## 12. QR Rules

QR must represent a secure pickup credential.

Backend validates:

- token
- order
- payment
- food court
- expiry
- pickup status

Never allow the frontend to declare an order picked up.

## 13. Shopkeeper Rules

A shopkeeper can access only their assigned food court.

Every relevant backend query must enforce this.

## 14. User Rules

A user can access only their own:

- orders
- notifications
- profile
- pickup credentials

## 15. Admin Rules

Admin can access system-wide information according to the API contract.

Sensitive admin actions should be auditable.

## 16. Order Rules

Normal status flow:

```text
CONFIRMED
→ PREPARING
→ READY
→ PICKED_UP
```

Terminal alternatives:

```text
EXPIRED
CANCELLED
```

Invalid transitions must be rejected.

## 17. Pickup Rules

- User selects a pickup slot.
- Pickup window lasts 15 minutes after the selected pickup time.
- Expired order cannot be picked up.
- No refund after expiry according to project policy.
- Policy must be displayed before payment.

## 18. Food Waste Rules

Track:

- prepared
- sold
- remaining
- wasted

Do not allow negative quantities.

## 19. ML Rules

- Do not fabricate training data.
- Do not fabricate accuracy.
- Report evaluation metrics honestly.
- Predictions are decision support.
- ML must not silently change inventory.

## 20. Testing Before Merge

At minimum:

- Backend build/start
- Frontend build
- API smoke tests
- Authentication
- RBAC
- Core order flow
- Payment verification where configured
- QR verification
- ML health/prediction endpoint
- Relevant UI flows

## 21. Definition of Done

A feature is complete only when:

- Code exists.
- Imports work.
- Dependencies are declared.
- API contract is followed.
- Authorization is enforced.
- Errors are handled.
- Tests/build pass.
- Documentation is updated.
- Integration instructions are provided.

## 22. Integration Order

Recommended:

1. Project foundation
2. Database
3. Authentication/RBAC
4. Core APIs
5. User frontend
6. Admin frontend
7. Shopkeeper frontend
8. Payment
9. QR
10. Real-time
11. Analytics
12. Food waste
13. ML
14. End-to-end testing
15. Deployment

## 23. Antigravity Rule

After module development, the complete repository may be opened in Antigravity.

Antigravity should first inspect and report integration issues before making major architectural changes.

Do not ask Antigravity to regenerate the entire project from scratch.
