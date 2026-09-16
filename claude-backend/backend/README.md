# ParkShare Backend

Node.js + Express + PostgreSQL API for the ParkShare marketplace.

## Setup

```bash
cd backend
npm install
cp .env.example .env      # then edit DATABASE_URL / JWT_SECRET as needed
```

## PostgreSQL setup

```bash
createdb parkshare
npm run db:migrate         # applies src/db/schema.sql
npm run db:seed            # inserts demo users, parking spaces, bookings
```

## Run

```bash
npm run dev     # auto-restart on file changes (node --watch)
npm start       # production
```

API base URL: `http://localhost:5000/api`

## Test credentials (password for all: `demo1234`)

| Role   | Email                     |
|--------|---------------------------|
| Admin  | admin@parkshare.demo      |
| Owner  | owner1@parkshare.demo     |
| Owner  | owner2@parkshare.demo     |
| Driver | driver1@parkshare.demo    |
| Driver | driver2@parkshare.demo    |
| Driver | driver3@parkshare.demo    |

## Notes

- Payments use a sandbox/test flow only — no real payment gateway is integrated.
- All monetary values are in the smallest sensible unit for the demo currency (rupees, as decimals).
- JWT is sent as `Authorization: Bearer <token>`.
