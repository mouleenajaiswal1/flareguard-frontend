# 🔥 FlareGuard Frontend

**Vite + React + Shopify Polaris frontend — wired to the FlareGuard Express backend.**

---

## Tech Stack

| Library | Purpose |
|---------|---------|
| Vite + React 18 | App bundler & framework |
| Shopify Polaris 12 | UI components (matches App Store) |
| React Router v6 | Client-side routing |
| Recharts | Bar chart + pie chart |
| Axios | API calls to Express backend |
| dayjs | Date formatting |

---

## Structure

```
src/
├── main.jsx              Entry point
├── App.jsx               Polaris AppProvider + Frame + Router
├── api/index.js          All Axios API calls (shopApi, analyticsApi…)
├── context/AuthContext   JWT token + shop state
├── hooks/useFetch.js     Generic fetch + mutation hooks
└── pages/
    ├── Dashboard.jsx     Stats, Recharts bar/pie, OS table
    ├── Settings.jsx      Platform toggles, redirect methods
    ├── Logs.jsx          Filterable detection log table
    ├── Alerts.jsx        Email alert configuration
    ├── Branding.jsx      White-label (Pro) + live preview
    ├── Billing.jsx       Plan comparison + upgrade flow
    └── Login.jsx         JWT token entry fallback
```

---

## Setup

```bash
cd flareguard-frontend
npm install
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:3001
npm run dev
# → http://localhost:3000
```

## Build for Production

```bash
npm run build
# Outputs to /dist — deploy to Vercel, Netlify, or Render Static Site
```

## Deploy to Render (Static Site)

1. Push to GitHub
2. Render → New Static Site → connect repo
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Set env var: `VITE_API_BASE_URL=https://your-backend.onrender.com`

---

## How Auth Works

1. Merchant installs app → Shopify OAuth → backend issues JWT
2. JWT appended to redirect URL: `?token=eyJ...`
3. `AuthContext` picks it up from URL params → stores in `localStorage`
4. Every Axios request attaches `Authorization: Bearer <token>`
5. On 401, token is cleared and user redirected to `/login`

---

## API Endpoints Used

| Page | Endpoints |
|------|-----------|
| Dashboard | `GET /analytics/summary`, `/daily`, `/platforms`, `/os` |
| Settings | `GET /settings`, `PUT /settings` |
| Logs | `GET /events`, `GET /events/export` |
| Alerts | `GET /alerts`, `PUT /alerts`, `POST /alerts/test` |
| Branding | `GET /branding`, `PUT /branding` |
| Billing | `GET /billing/status`, `GET /billing/upgrade`, `POST /billing/downgrade` |
