# ParkShare (Frontend Demo)

Peer-to-peer parking marketplace — React + Vite + Tailwind, frontend only, no backend.

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL (usually http://localhost:5173).

To create a production build:

```bash
npm run build
npm run preview
```

## Demo accounts (or sign up fresh)

- Driver: driver@parkshare.demo / demo1234
- Owner: owner@parkshare.demo / demo1234
- Admin: admin@parkshare.demo / demo1234

All data (users, listings, bookings, favorites, payments) is stored in the browser's
localStorage — clear site data to reset to the seeded demo state.

This is a demo UI only: no real payments, no real authentication/security, and no
real identity or society (RWA/MyGate) verification are performed anywhere in the app.
