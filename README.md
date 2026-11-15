# PastPerfect Web — v2.6

React frontend for a Sri Lankan used-item marketplace. This version repairs the prototype's account and listing flows and replaces Create React App with Vite and React 18.

## Development

Use Node 22+ (validated on Node 24), npm, and the companion `Past_Perfect_BackEnd` API.

```sh
npm ci
cp .env.example .env.local # only when no local configuration exists
npm start
```

The frontend runs on port 3000. Use `localhost` consistently for both frontend and API so session cookies remain same-site. Start MongoDB and the API using the backend README. Do not put secrets in `VITE_*` variables.

```sh
npm test
npm run build
```

Build output is `dist/`. Production hosting must serve `index.html` for client routes. Configure `VITE_API_URL` at build time. Use HTTPS and a same-site API domain; configure the API's exact `WEB_ORIGIN` accordingly.

## Current behavior

- Signup/login using server-issued HTTP-only sessions, session restoration, and server-side logout.
- Search, price range, category, district/town, sorting and pagination stored in shareable URLs.
- Listing details match the API's v2 fields and format prices as LKR.
- Authenticated image publishing with Unicode titles and descriptions; clothing size is optional.
- Seller dashboard with status filters, owner-only text/price editing, reserve/release, mark sold, and confirmed removal.
- Public seller profiles, editable username/bio, private favourites, and participant-only buyer/seller enquiries.
- Versioned listing photo replacement and profile avatar upload/removal.
- Listing/user/message reporting, user blocking, and an admin-only moderation queue.
- Local development images work without external credentials. Cloudinary is configured on the backend.
- Payments are explicitly unavailable. No placeholder card collection, charges or buyer-protection promises.

There is no automatic data migration from the old prototype. See the backend API contract for breaking changes. Signup omits avatar upload; profile photos are managed from My profile.

See [the action plan](docs/ACTION_PLAN.md) and [configuration and release notes](docs/V2.md). This is a foundation release, not a complete marketplace: advanced abuse controls and managed transactions remain planned.

Version 2.1 seller management details, limitations and validation are recorded in [release notes](docs/V2.md).

Version 2.2 adds category/location discovery, public seller profiles, profile editing, favourites and buyer/seller enquiries. See [release notes](docs/V2.md) for behavior and limitations.

See [v2.3 release notes](docs/V2.md) for media, reporting/blocking and moderation behavior and limitations.

Version 2.4 adds email verification/recovery pages, an unread notification indicator and inbox, and English/Sinhala/Tamil language switching across the application. Language choice persists locally; user-written listings/messages are never machine-translated. Notification polling runs every 30 seconds while signed in and on window focus. See [localization guidance](docs/LOCALIZATION.md) and the backend account guide for local email/SMTP configuration.

Version 2.5 adds restricted suspended-account sessions, versioned suspension/restoration, user appeals with atomic admin decisions, and configurable prohibited-item rejection/review queues. Bundled policy rules are labelled placeholders; replace them before launch. See [release notes](docs/V2.md).

Version 2.6 adds decoded/resized WebP uploads, conservative dry-run local orphan reconciliation, configurable typed category attributes, skip navigation/route focus, larger touch targets and responsive form/listing layouts. See [release notes](docs/V2.md).
