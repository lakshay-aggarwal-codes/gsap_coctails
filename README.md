<div align="center">

# 🍸 Velvet Pour

**A full-stack, production-grade cocktail bar platform** — animated public storefront, a dual-role authentication system for staff and guests, a real reservation engine, a like/favorites system, and an admin analytics dashboard built on live MongoDB aggregation pipelines.

[**🌐 Live Site**](#) &nbsp;·&nbsp; [**⚙️ API**](#) &nbsp;·&nbsp; [**📖 API Docs**](#) &nbsp;·&nbsp; [**🗄️ Database**](#)

> _Links above will be filled in once deployed — see [Deployment](#-deployment) for the target hosts._

</div>

---

## Overview

Velvet Pour started as a GSAP animation showcase and grew into a complete restaurant platform: a public-facing site for browsing the menu and booking a table, a customer account system with reservation history and a favorites list, and an admin dashboard with real business analytics — all built on a hand-rolled Express/MongoDB API with no ORM shortcuts taken.

This isn't a tutorial clone. Every engineering decision below — the reservation capacity model, the role-based auth boundary, the idempotent favorites system — was made deliberately, with the trade-offs documented rather than hidden.

## ✨ Features

### Public storefront
- GSAP-animated hero, cocktail showcase, and recipe carousel (`SplitText` reveals, `ScrollTrigger` parallax)
- Full cocktail menu with live like counts, filterable by category
- Real reservation booking with actual capacity enforcement — not a form that just emails someone
- Contact form

### Customer accounts
- Registration and login, fully separate from admin authentication (different JWT role claim, different storage key, different middleware)
- **My Velvet Pour** dashboard: profile, upcoming/past reservation history, and a favorites list
- ❤️ Like/unlike any cocktail — idempotent, optimistic UI, prompts sign-in if you're not logged in
- Guest bookings still work exactly as before; logging in just links your reservation to your account

### Admin dashboard
- JWT-protected, role-checked separately from customer auth
- Manage reservations (status updates), contact messages, and the full cocktail menu (CRUD)
- **Live analytics**, computed via MongoDB aggregation pipelines, not client-side math:
    - Reservation volume by day
    - Busiest time slots
    - Menu composition by category/tier
    - Most-liked cocktails
- Interactive API documentation at `/api/docs` (Swagger UI)

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 · Vite · GSAP (`@gsap/react`, `SplitText`, `ScrollTrigger`) · React Router v7 · TanStack Query v5 · Recharts · Tailwind CSS v4 |
| **Backend** | Node.js · Express 4 · MongoDB · Mongoose 8 |
| **Auth** | JWT (`jsonwebtoken`) with an explicit role claim · `bcryptjs` password hashing |
| **Validation** | Zod (every write endpoint, request body *and* query params) |
| **Security** | Helmet (route-scoped CSP), `express-rate-limit`, CORS locked to a configured origin |
| **Docs** | `swagger-jsdoc` + `swagger-ui-express`, live at `/api/docs` |
| **Testing** | Vitest · Supertest · `mongodb-memory-server` (real in-memory MongoDB, not mocks) |

## 🧠 Engineering highlights

A few decisions worth a closer look — the kind of thing that comes up in a code review, not just a features list.

**Role-based auth is a checked boundary, not a coincidence.** Admin and customer tokens share a signing secret but carry an explicit `role` claim, checked *before* either middleware queries its respective collection. An admin token literally cannot authenticate a customer route and vice versa — this is verified end-to-end in the test suite using real login flows for both roles, not just hand-crafted tokens.

**The reservation engine has a documented, conscious trade-off.** Capacity checking is check-then-act, not atomic — under near-simultaneous bookings for a nearly-full slot, a narrow race window exists. This was a deliberate choice, not an oversight, and it's called out in the code rather than papered over. Cancelled reservations are correctly excluded from capacity math, and rebooking excludes the reservation's own ID from its own capacity check.

**Pagination is opt-in for public data, mandatory for admin data.** `GET /api/cocktails` returns the full catalog unless `page`/`limit` are supplied — the public menu depends on that. Admin list endpoints paginate by default, since there's no public consumer to break.

**Favorites use a real join collection with a compound unique index**, not an array embedded on either side — `find({customer})` and an aggregation `$group` by `cocktail` cover both query directions cheaply, and the database itself prevents a duplicate like, not just application code. Liking and unliking are both idempotent via atomic upsert/delete, so a double-tap on the heart button never errors.

**`isLikedByMe` is invisible to anonymous traffic.** It's computed via a `.lean()` query plus a targeted `Favorite` lookup, and appears on cocktail responses *only* when the requester is a logged-in customer — the public API shape is unchanged for the vast majority of traffic.

**A public route staying public, under a real constraint.** `optionalCustomerAuth` attaches a customer to a reservation or a like status *if* a valid token is present, but a missing, malformed, or expired token never rejects the request — tested explicitly, including the "garbage token on a public route" case.

**Swagger UI's inline scripts vs. a strict CSP, resolved without weakening either.** Helmet's default policy blocks the inline scripts Swagger UI needs to render. Rather than disabling CSP app-wide, `/api/docs` gets a second, scoped `helmet()` call with a relaxed policy — verified to apply only to that route, with the rest of the API keeping its strict default.

## 📁 Project Structure

```
velvet-pour/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection, reservation rules, Swagger spec
│   │   ├── controllers/     # Route handlers, one per resource
│   │   ├── middleware/      # protect, protectCustomer, optionalCustomerAuth, validate, rate limiters
│   │   ├── models/          # Mongoose schemas: Admin, Customer, Cocktail, Reservation, Contact, Favorite
│   │   ├── routes/          # Express routers, documented inline via JSDoc/Swagger
│   │   ├── services/        # Business logic that doesn't belong in a controller (reservation engine, analytics)
│   │   ├── validators/      # Zod schemas
│   │   ├── seed/            # Cocktail + admin seeding scripts
│   │   └── tests/           # Vitest + Supertest, against a real in-memory MongoDB
│   └── package.json
└── src/                     # Frontend (Vite root)
    ├── components/          # Public site sections (Hero, Cocktails, Menu, Contact, NavBar, ...)
    ├── pages/
    │   ├── account/         # Customer dashboard (Profile, Reservations, Favorites)
    │   └── admin/            # Admin dashboard
    ├── context/              # AuthContext (admin), CustomerAuthContext — deliberately separate
    ├── hooks/                # useAuthGuard, useCustomerAuthGuard, useCocktailLikes
    └── services/api.js       # All backend calls in one place
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB connection string (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone and install

```bash
git clone <your-repo-url>
cd velvet-pour

# Frontend
npm install

# Backend
cd backend
npm install
```

### 2. Configure environment variables

Copy `backend/.env.example` to `backend/.env` and fill in:

```env
PORT=5000
MONGO_URI=your-mongodb-connection-string
CLIENT_URL=http://localhost:5173
NODE_ENV=development
JWT_SECRET=a-long-random-string
JWT_EXPIRES_IN=7d
```

> **Never commit `.env`.** It's already gitignored — keep it that way.

### 3. Seed the database

```bash
cd backend
npm run seed          # populates the cocktail menu
node src/seed/createAdmin.js   # creates an admin account
```

### 4. Run it

```bash
# Terminal 1 — backend
cd backend
npm run dev            # http://localhost:5000

# Terminal 2 — frontend
npm run dev             # http://localhost:5173
```

Visit `http://localhost:5173` for the site, `http://localhost:5000/api/docs` for the interactive API documentation, and `http://localhost:5173/admin/login` for the admin dashboard.

## 🧪 Testing

```bash
cd backend
npm test
```

Runs against a real, ephemeral in-memory MongoDB (`mongodb-memory-server`) — not mocks. Coverage includes:

| Suite | What it checks |
|---|---|
| `smoke.test.js` | Basic app health, 404 handling |
| `pagination.test.js` | Opt-in vs. mandatory pagination behavior |
| `reservation-engine.test.js` | Time-slot validation, capacity math, cancelled-exclusion, rebooking self-exclusion, customer linking |
| `cocktails.test.js` | Menu CRUD, Zod validation on writes |
| `contact.test.js` | Contact form validation, error-handler regression checks |
| `customer-auth.test.js` | Registration, login, profile, role separation (verified through real login flows for both roles) |
| `favorites.test.js` | Idempotent like/unlike (checked at the database level), `isLikedByMe` visibility, most-liked ranking |

## 📖 Reservation Rules

Configured in `backend/src/config/reservationRules.js`, not hardcoded into logic:

| Rule | Value |
|---|---|
| Opening time | 17:00 |
| Closing time | 23:00 |
| Slot interval | 30 minutes |
| Max guests per slot | 40 |
| Max party size | 12 |

## 🌐 Deployment

| Component | Target platform |
|---|---|
| Backend (Express API) | [Render](https://render.com) or [Railway](https://railway.app) |
| Frontend (Vite build) | [Vercel](https://vercel.com) or [Netlify](https://netlify.com) |
| Database | [MongoDB Atlas](https://www.mongodb.com/atlas) |

Set `VITE_API_URL` on the frontend host to the deployed backend's `/api` path, and `CLIENT_URL` on the backend host to the deployed frontend's URL — the existing CORS configuration depends on this matching exactly.

## 🗺️ Known Limitations & Roadmap

Documented honestly rather than hidden:

- **Reservation capacity checking has a narrow race-condition window** under near-simultaneous bookings for a nearly-full slot (check-then-act, not atomic). A conscious trade-off for this project's scale — noted in code, not silently "fixed" with heavier machinery it doesn't need.
- **No customer-facing ordering system.** "My Orders" was deliberately scoped out — there's no menu-ordering/checkout flow anywhere in the app, so an `Order` model with nothing real to populate it would be unconnected CRUD.
- **No password reset flow.** Would require an email-sending service this project doesn't have; left honestly absent rather than faked.
- **Docker & CI/CD are deferred**, not yet implemented — deliberately, pending further learning rather than half-attempted.

## 📄 License

MIT — or update this section to match your course's requirements.

---

<div align="center">
<sub>Built with React, Express, MongoDB, and an unreasonable amount of care about error handling.</sub>
</div>