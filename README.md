# PastPerfect Web — v3.0

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
- Live payments are unavailable. An explicit development simulator supports orders and refunds without card collection, charges or buyer-protection promises.

There is no automatic data migration from the old prototype. See the backend API contract for breaking changes. Signup omits avatar upload; profile photos are managed from My profile.

See [the action plan](docs/ACTION_PLAN.md) and [configuration and release notes](docs/V2.md). This is a foundation release, not a complete marketplace: advanced abuse controls and managed transactions remain planned.

Version 2.1 seller management details, limitations and validation are recorded in [release notes](docs/V2.md).

Version 2.2 adds category/location discovery, public seller profiles, profile editing, favourites and buyer/seller enquiries. See [release notes](docs/V2.md) for behavior and limitations.

See [v2.3 release notes](docs/V2.md) for media, reporting/blocking and moderation behavior and limitations.

Version 2.4 adds email verification/recovery pages, an unread notification indicator and inbox, and English/Sinhala/Tamil language switching across the application. Language choice persists locally; user-written listings/messages are never machine-translated. Notification polling runs every 30 seconds while signed in and on window focus. See [localization guidance](docs/LOCALIZATION.md) and the backend account guide for local email/SMTP configuration.

Version 2.5 adds restricted suspended-account sessions, versioned suspension/restoration, user appeals with atomic admin decisions, and configurable prohibited-item rejection/review queues. Bundled policy rules are labelled placeholders; replace them before launch. See [release notes](docs/V2.md).

Version 2.6 adds decoded/resized WebP uploads, conservative dry-run local orphan reconciliation, configurable typed category attributes, skip navigation/route focus, larger touch targets and responsive form/listing layouts. See [release notes](docs/V2.md).

Version 2.7 adds quote review, buyer/seller order history, reservation cancellation, collection readiness/confirmation and order enquiries. Test payment controls appear only when the backend enables its development simulator. No card details or real money are collected. See the backend order guide and [release notes](docs/V2.md).

Version 2.8 adds buyer order disputes, one seller response, seller-approved full simulated refunds, and an allowlisted administrator review queue. Decisions are versioned, retain a shared resolution, notify both participants and preserve private order history. Suspended participants retain these dispute controls. See [release notes](docs/V2.md) and the backend order guide for placeholder policy and live-payment limitations.

Version 2.9 adds indexed title/description keyword search, relevance sorting, condition/size filters, and private named saved searches with rename/delete controls. Legacy literal title search URLs still work. Saved searches reopen current public results; opt-in in-app alerts arrive in v3.0. See [release notes](docs/V2.md) and the [search guide](https://github.com/BlueZoft/Past_Perfect_BackEnd/blob/master/docs/SEARCH.md) for index setup and limitations.

Version 3.0 closes the local application milestone with typed attribute search, opt-in in-app matching alerts, completed test-order reviews with admin moderation, private seller analytics and health checks. Simulated reviews/totals never claim real customer reputation or earnings. See [local release checklist](docs/LOCAL_RELEASE.md) for reproducible validation and explicit launch/optional follow-up. No live deployment or external financial integration is enabled.
