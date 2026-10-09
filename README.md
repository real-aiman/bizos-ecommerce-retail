<<<<<<< HEAD
# BizOS Retail v2

Next.js 15 (App Router) · TypeScript strict · Zustand · Zod · Vitest

## Run
```bash
cp .env.example .env.local
npm install
npm run dev        # http://localhost:3000
npm run qa         # typecheck + lint + tests + build
```

## Before going live (needs real business facts / backend)
1. `BIZOS_API_URL`, `BIZOS_ORDERS_PATH`, `BIZOS_API_KEY`: orders are POSTed to the backend. Align the payload in
   `src/modules/orders/services/orderGateway.ts` with the real order contract.
2. Set `BIZOS_ALLOW_SIMULATED_ORDERS=false`. With no orders endpoint the store refuses to fake a confirmation.
3. `NEXT_PUBLIC_CURRENCY` (e.g. `PKR`), `NEXT_PUBLIC_LOCALE` (e.g. `en-PK`), shipping values, support email/phone/WhatsApp.
4. Fill `policies.delivery` / `policies.returns` in `src/config/store.ts` (hidden until set).
5. Product feed currently has no description, images list, brand or stock. Add `description`, `images`, `brand`, `inStock`
   to the API and the product page, JSON-LD and buy box use them automatically.

## New in this update
- **Promo codes**: set `BIZOS_PROMO_CODES` (JSON, see `.env.example`). The cart only shows a code's terms; the server re-checks code, expiry and minimum when the order is placed, and rejects unknown codes. No codes configured means the box simply does nothing useful, so leave it empty to disable.
- **Cart drawer + toasts**: cart icon opens a slide-over mini cart; add-to-cart and wishlist give instant feedback.
- **Search**: header typeahead (`/api/search`) and a `/search` results page with department filter, sort and pagination.
- **Categories** page with counts and starting prices.
- **Saved delivery details** (opt-in checkbox, device-only) with a "Forget" button in `/account`.

## Also new
- **Deals** (`/deals`): lists products whose feed includes an optional `compareAtPrice` (shown struck-through with a % badge; the charged price is always `regularPrice`) and promo codes marked `"public": true`, with a live countdown to `expires`. The nav link appears only when there is something to show.
- **Compare** up to 3 products side by side (`/compare?ids=`), lowest price highlighted.
- **Recently viewed** on product pages, **Share** button, wishlist **Add all to cart**.
- **Address book** (up to 5, device-only) with a picker at checkout; **Order again** (today's prices, discontinued items skipped) and **Print invoice**.

## Customer dashboard (`/dashboard`)
Linked in the navbar, the header user icon and the footer; `/account` redirects here. Data comes from this device (there are no customer logins yet).
- **Overview**: orders, total spent, items bought, promo savings, recent orders, recently viewed.
- **Orders** (`/dashboard/orders`): search by order number, product, city or promo code; sort; order again.
- **Order details** (`/dashboard/orders/[ref]`): items with images, subtotal/promo/delivery/total, delivery address and note, payment method, print invoice, order again, and WhatsApp/email/call links with the order number pre-filled. The progress strip only claims what is known (placed, store confirms by phone, pay on delivery); real shipping stages need a status feed from the backend.
- **Addresses**: add/remove up to 5 saved addresses used at checkout.

## Admin dashboard (`/admin`)
Off by default. Set `ADMIN_PASSWORD` (12+ characters) to turn it on; without it every `/admin` URL returns 404. Optional `ADMIN_SESSION_SECRET` adds a signing secret.
- **Overview**: KPIs, products by department, system checks (API, orders endpoint, simulated orders, promo JSON, site URL, analytics, Sentry) and catalog issues (zero price, no image, duplicate slug, bad was-price).
- **Products**: search, department/stock/sale filters, sort, pagination, CSV export (formula-safe).
- **Promo codes**: status of every configured code. Codes stay in the env var, so nothing can be edited from the browser.
- **Orders**: lists orders only if `BIZOS_ORDERS_LIST_PATH` points at a GET endpoint (array, or `{data}` / `{orders}`). Field names are mapped tolerantly but the endpoint contract is yours to confirm.
- Security: signed httpOnly, SameSite=Strict, 8-hour session cookie scoped to `/admin`; constant-time password check; login throttled to 5 tries per 15 min per server instance (best effort on serverless); every page, action and the CSV route re-check the session; `/admin` is `noindex` and disallowed in robots.txt.

## What changed from v1
- Server re-prices every order from the catalog; client totals are never trusted (`placeOrder` action).
- Checkout is one validated page (Zod). Personal details no longer travel in the URL.
- Orders are real objects: reference, stored per device, cart cleared, `purchase` analytics fired once.
- Removed fabricated content: fake reviews, fake dashboard/orders/charts, placeholder phone/email, developer notes in customer copy.
- Catalog: department pills with counts, price range, sort, multi-word search, all URL-driven and server-rendered.
- Product page: quantity, sticky mobile buy bar, breadcrumbs, related products, Product + Breadcrumb JSON-LD, Open Graph.
- Hydration-safe persisted stores (`skipHydration` + `StoreHydrator`), cross-tab sync, quantity cap.
- Mixpanel loads only when a token is set. Security headers, real 404 status, noindex on private pages, redirects for old routes.
- New design system (navy / gold / lit product plinths, Bricolage Grotesque + Instrument Sans).
=======
# bizos-ecommerce-retail
>>>>>>> b8b0b5c0474ea7f7562c70acddf005cfb346d56f
