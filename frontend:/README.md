# Campus Eats — User Frontend (Member 2)

React + Vite + Tailwind frontend for the **USER** role of the University Food
Pre-Booking System. Built strictly against `API_CONTRACT.md`,
`DATABASE_SCHEMA.md`, `ARCHITECTURE.md`, and `DEVELOPMENT_RULES.md`.

This module does **not** include admin or shopkeeper UI, backend code, or a
database — see section 16 of the brief and `DEVELOPMENT_RULES.md` section 5.

## A. Setup instructions

```bash
cd frontend
cp .env.example .env    # then point VITE_API_BASE_URL / VITE_SOCKET_URL at your backend
npm install
npm run dev              # http://localhost:5173
```

```bash
npm run build             # production build to dist/
npm run preview           # preview the production build
npm run lint               # ESLint
```

> This container has no network access, so `npm install` could not be run
> here to verify the build. Run the commands above locally / in CI before
> merging — per `DEVELOPMENT_RULES.md` section 20 ("Frontend build",
> "Relevant UI flows").

## B. Environment variables

| Variable | Purpose | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Node.js backend REST base URL | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Socket.IO server URL | `http://localhost:5000` |

No secrets are stored in this app (`DEVELOPMENT_RULES.md` section 8/9). The
JWT issued at login is kept in `localStorage` and attached as
`Authorization: Bearer <token>` by `src/utils/api.js`.

## C. File tree

```text
frontend/
├── .env.example
├── .eslintrc.cjs
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── index.css
    ├── components/
    │   ├── common/   (Navbar, Footer, Loader, EmptyState, ErrorState,
    │   │               ConfirmDialog, ProtectedRoute, Toast)
    │   ├── food/     (FoodCourtCard, FoodItemCard, CategoryFilter, SearchBar)
    │   ├── cart/     (CartItem, CartSummary)
    │   ├── order/    (OrderCard, OrderStatusTimeline)
    │   ├── pickup/   (PickupSlotPicker, PickupQrCode)
    │   └── notifications/ (NotificationItem, NotificationBell)
    ├── layouts/UserLayout.jsx
    ├── pages/user/   (Login, Register, Dashboard, FoodCourts,
    │                   FoodCourtDetails, FoodItemDetails, Cart, Checkout,
    │                   OrderConfirmation, ActiveOrder, OrderHistory,
    │                   OrderDetails, Notifications, Profile)
    ├── routes/UserRoutes.jsx
    ├── services/     (authApi, foodCourtApi, foodApi, orderApi, paymentApi,
    │                   pickupApi, notificationApi)
    ├── hooks/        (useAuth, useCart, useOrderSocket)
    ├── context/      (AuthContext, CartContext)
    ├── sockets/socket.js
    └── utils/        (api.js, formatters.js)
```

This matches the file tree you provided, plus two small, in-pattern
additions explained below.

## D. Files created vs. the requested tree

Everything in the requested tree was created. Two files were added because
the brief's own requirements need them and the contract already defines the
endpoints for them:

- `src/services/paymentApi.js` — wraps `POST /payments/create` and
  `POST /payments/verify` (API_CONTRACT.md section 13), needed for brief
  section 8 ("Payment"). `POST /payments/webhook` is intentionally **not**
  called from this file — it's provider→backend only.
- `src/components/common/Toast.jsx` — a dependency-free toast system
  (brief section 15, "Toast notifications") instead of a separate context,
  to avoid adding a file outside the given `context/` pair
  (`AuthContext`, `CartContext`).
- `src/components/common/ConfirmDialog.jsx` — confirmation dialog (brief
  section 15, "Confirmation dialogs"), used on logout.
- `src/components/notifications/NotificationBell.jsx` — small unread-count
  bell used in the Navbar; separate from the full `Notifications.jsx` page.

## E. API endpoints used

All calls go through `src/utils/api.js` (JWT attached automatically, 401 →
logout). Only endpoints defined in `API_CONTRACT.md` are called:

- `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`,
  `GET /auth/profile`, `PUT /auth/change-password`
- `GET /food-courts`, `GET /food-courts/:foodCourtId`
- `GET /food-courts/:foodCourtId/food-items`, `GET /food-items/:foodItemId`
- `GET /food-courts/:foodCourtId/pickup-slots`
- `POST /orders`, `GET /orders/my-orders`, `GET /orders/:orderId`
- `POST /payments/create`, `POST /payments/verify`
- `GET /orders/:orderId/pickup-qr`
- `GET /notifications`, `PATCH /notifications/:id/read`

Socket.IO client (`src/sockets/socket.js`) listens for exactly the events
in API_CONTRACT.md section 20 that are user-facing: `ORDER_CONFIRMED`,
`ORDER_PREPARING`, `ORDER_READY`, `ORDER_PICKED_UP`, `ORDER_EXPIRED`,
`ORDER_CANCELLED`. `NEW_ORDER` is shopkeeper-facing and is not subscribed to.

No endpoint was invented, renamed, or given a different response shape than
the contract implies.

## F. Assumptions made (please confirm with the team)

Per `DEVELOPMENT_RULES.md` section 7 ("Report assumptions"):

1. **JSON field casing.** `API_CONTRACT.md` doesn't state a casing
   convention for response bodies. This frontend assumes the backend
   returns fields with the same names as `DATABASE_SCHEMA.md` columns
   (snake_case, e.g. `quantity_available`, `pickup_deadline`,
   `order_number`). If Member 3/6 return camelCase instead, only the
   `services/*.js` call sites and the few `res.data?.x` destructures in
   each page need updating — the UI components are otherwise agnostic.
2. **Payment gateway.** The contract says only "use an approved gateway."
   `src/pages/user/Checkout.jsx` assumes **Razorpay** (common for this kind
   of project) and loads `checkout.razorpay.com/v1/checkout.js`. If Member 6
   configures a different provider, only the `loadRazorpayScript()` helper
   and the `razorpay = new window.Razorpay(...)` block in `Checkout.jsx`
   need to change — no other file depends on the gateway choice.
3. **Order creation payload shape**: `{ foodCourtId, pickupSlotId, items: [{ foodItemId, quantity }] }`.
   The contract lists what the backend must *validate*, not the exact
   request body, so this is the most direct mapping of that list.
4. **Auth response shape**: `POST /auth/login` is assumed to return
   `{ data: { user, token } }` (or `accessToken`). `AuthContext.jsx` checks
   both keys defensively.
5. **10 food courts** (brief section 3) is a data fact for Member 3's
   seed data, not something this frontend hardcodes — food courts are
   always fetched from `GET /food-courts`.

## G. Testing performed

This container has no network access, so `npm install` / a live backend
were not available to exercise the app end-to-end. What was done instead:
every file was written and manually re-read against
`API_CONTRACT.md`/`DATABASE_SCHEMA.md` for endpoint paths, HTTP methods,
and field names, and all cross-file imports were traced by hand for
correct relative paths and matching named/default exports.

**Before merge, please run** (per `DEVELOPMENT_RULES.md` section 20):

- [ ] `npm install && npm run build` — clean build
- [ ] `npm run dev` against the real backend — registration, login, logout
- [ ] Protected routes redirect to `/login` when logged out
- [ ] Food court browsing → menu → search/filter → unavailable items blocked
- [ ] Cart quantity/food-court validation
- [ ] Checkout → pickup slot selection → policy notice → payment → confirmation
- [ ] Active order live tracking via Socket.IO (all 6 status events)
- [ ] QR pickup display when an order is `READY`
- [ ] Order history filters + order details
- [ ] Notifications list + mark-as-read
- [ ] Profile: change password, logout
- [ ] Responsive check at mobile / tablet / desktop widths

## H. Integration instructions for the team

1. Set `VITE_API_BASE_URL` / `VITE_SOCKET_URL` to Member 1/3's running
   backend.
2. This app expects the backend to issue a JWT on `/auth/login` and to
   accept it as `Authorization: Bearer <token>` on every protected route,
   per `ARCHITECTURE.md` section 9.
3. Socket.IO auth: this client connects with `auth: { token }` — the
   backend's Socket.IO middleware (Member 1's foundation) should read the
   token from `socket.handshake.auth.token`.
4. If any endpoint's response envelope differs from
   `API_CONTRACT.md` section 5 (`{ success, message, data }` /
   `{ success, message, errors }`), `src/utils/api.js` is the one place to
   adjust — it currently unwraps `response.data` for every call.
