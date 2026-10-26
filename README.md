# Vaidic Sanskar — Admin Panel (Web)

A **React + Vite** web console to manage **both apps** (User app + Partner app)
from the browser: users, vendors & KYC, bookings, live job dispatch, e-store
orders, products, astrologer sessions, subscriptions, temples, donations, event
inquiries, payouts, reviews, content/library, banners and settings.

Built to connect to your **REST API** — set one base URL and it's live. Until
then it runs on bundled mock data so you can click through everything.

---

## 1. Run

```bash
npm install
cp .env.example .env     # set VITE_API_BASE_URL to your backend
npm run dev              # http://localhost:5173
```

Build for production: `npm run build` → static files in `dist/` (deploy to
Netlify, Vercel, Nginx, S3, anywhere).

**Login:** in dev mode any credentials work (mock fallback). Once the backend is
live, `POST auth/login` must return `{ token, user }`.

---

## 2. Connect your API

Everything flows through two files:

- **`.env`** — `VITE_API_BASE_URL` (e.g. `https://api.yourdomain.com/admin/`)
  and `VITE_USE_MOCK_FALLBACK` (`true` during dev, `false` in production).
- **`src/api/services.js`** — one line per resource via `makeResource('path')`.
  Each resource gets `list / get / create / update / remove` on standard REST:
  ```
  GET    {path}         → array (or {data:[...]}, {results}, {items} — auto-unwrapped)
  PATCH  {path}/:id      → update fields (status, KYC, order stage…)
  POST   {path}          → create
  DELETE {path}/:id
  ```

When `VITE_USE_MOCK_FALLBACK=true`, any failed/empty list falls back to
`src/data/mock.js` and the page shows a "sample data" banner. Set it to `false`
for production so real errors surface.

Auth token is stored in `localStorage` and attached as
`Authorization: Bearer <token>` on every request (`src/api/client.js`); a `401`
clears it and bounces to `/login`.

---

## 3. How it's structured (and how to extend)

```
src/
  api/        client.js (axios + token), services.js (endpoints)
  hooks/      useFetch.js (list + loading + mock fallback + optimistic patch)
  context/    AuthContext.jsx (login/logout, guard state)
  components/ Layout, DataTable, charts, common (Pill/RoleChip/…), toast
  pages/      Login, Dashboard, ResourcePage (generic), Settings
  data/       mock.js (fallback + dashboard numbers)
  resources.jsx   ← the registry that drives every list screen
```

**The registry (`src/resources.jsx`) is the heart.** Every list screen —
columns, status filter, search keys, and row actions — is one config object.
One generic `ResourcePage` renders all of them at `/:resource`.

**Add a new column**: edit that resource's `columns` array.
**Add a new section**: add a `makeResource('path')` in `services.js`, an entry
in `resources.jsx`, and add its key to the `NAV` array — no new file needed.
**Row actions** (Approve KYC, advance order, pay payout, hide review…) call
`patch(id, fields)`, which updates the UI instantly and PATCHes the API.

---

## 4. What you can do from the panel

| Area | Manage |
|------|--------|
| **Dashboard** | Revenue/booking charts, GMV by role, KPIs, approvals queue, activity |
| **Users** | Customers, wallet, block / unblock |
| **Puja Bookings** | Pandit assignment & status |
| **E-Store Orders** | Advance lifecycle New→Packed→Ready→Delivered |
| **Astrologer Sessions** | Vartalap chat/call logs & billing |
| **Subscriptions** | Daily Pandit plans |
| **Temples** | VIP pass toggle, darshan stats |
| **Donations** | Collections |
| **Vendors / KYC** | Approve / reject partner KYC (4 roles) |
| **Live Job Dispatch** | Geofenced puja broadcasts |
| **Products** | Merchant inventory & stock status |
| **Event Inquiries** | Mandali & Bhavya Aayojan (SLA), confirm |
| **Payouts** | Approve & pay vendor settlements |
| **Reviews** | Moderate / hide flagged reviews |
| **Content / Library** | Publish / unpublish Sahitya Sangrah |
| **Banners & Ads** | Toggle promotions |
| **Settings** | Commission per role, operational config, admin team |

---

## 5. Notes

- **Theme**: light/dark toggle in the top bar (persists per browser).
- **Responsive**: sidebar collapses to a drawer on mobile.
- **Security**: never ship any admin/service key in the frontend; the browser
  only holds the user's bearer token. Keep role-based access enforced on the
  **server** too — hiding a button is not authorization.
- **Live counts**: sidebar badges (pending KYC/payouts/events) read mock now;
  wire them to a `dashboard/summary` call once the API is live.

Stack: React 18 · Vite 5 · React Router 6 · Axios. No UI kit — plain CSS so it's
easy to restyle to your brand.
