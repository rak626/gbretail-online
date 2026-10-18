# gbretail-online — online customer storefront

Frontend for the online version. Backend (`gbretail-backend`) is the core system;
POS (`gbretail-pos`) is the local-shop machine frontend. This app uses the same
backend + same inventory via public `/api/store/*` routes.

## Flows
- `/` — pick city → shop (same city). Curated online catalog per shop.
- `/s/[shopId]` — catalog (online price, images), cart.
- `/checkout` — pickup/delivery + COD, uses shop online config.
- `/orders` — my online orders (pending → delivered), cancel pending.
- `/login`, `/register` — email/phone + password (shared Customer row, so POS sees online customers).

## Dev
```bash
cp .env.example .env.local  # NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev   # :3001
```
Backend must have shop `isOnlineEnabled=true` + products `isOnline=true` (SUPER_ADMIN / owner via API).
