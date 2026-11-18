# Local setup and demonstration guide

This guide starts the existing prototype locally and rehearses its implemented screens. It does not publish a site, provision live services or enable actual charging. All example identities/locations are placeholders. Keep existing data/configuration; do not reset a database to follow this guide.

## Prerequisites and configuration

Use the two repositories side by side, Node 22+ (v3.0 was validated with Node 24), npm and MongoDB 7. Run commands from the stated repository. Install dependencies with `npm ci`. Copy examples only if the corresponding configuration file does not already exist; otherwise edit the needed keys in place.

| Repository | Local settings |
| --- | --- |
| API | `PORT=3001`, `MONGODB_URI=mongodb://127.0.0.1:27017/pastperfect`, `WEB_ORIGIN=http://localhost:3000`, `IMAGE_DRIVER=local`, `UPLOAD_DIR=./uploads` |
| API demo email | `MAIL_DRIVER=local`, `MAIL_OUTBOX_DIR=.mail-outbox` (private, outside uploads) |
| API transaction demo | `PAYMENT_DRIVER=test`, outside `NODE_ENV=production`; optional defaults hold 15 minutes/platform fee 0 |
| Web | `VITE_API_URL=http://localhost:3001` in `.env.local`; no private keys here |

The API's example file keeps payments disabled until explicitly changed. The executable default for absent mail configuration is disabled; copying the example enables local mail. Local images and local mail are forbidden for production use. SMTP/Cloudinary placeholders are unnecessary for this local setup. Use `localhost` consistently in browser URLs (do not mix it with `127.0.0.1`); the database URI may still use 127.0.0.1.

## Start dependencies and applications

If the existing named MongoDB container is stopped:

```sh
docker start pastperfect-mongo
```

If it does not exist and no local MongoDB is already listening, create one following the API README. Do not start a second instance on the same port or replace a database volume.

API shell, in `Past_Perfect_BackEnd`:

```sh
npm ci
npm start
```

Web shell, in `Past_Perfect_Web`:

```sh
npm ci
npm start
```

Open `http://localhost:3000`. The Vite script binds 127.0.0.1 on port 3000 with strict-port behavior; an occupied port should be fixed rather than silently changing the origin. API startup awaits MongoDB before listen. `GET http://localhost:3001/health/live` reports responding HTTP; `/health/ready` reports Mongoose connection state only, not mail/storage/index/worker readiness. Restart the API after backend configuration changes and Vite after frontend environment changes.

## Prepare separate local identities

Create seller, buyer and (if needed) admin accounts through Sign up, using distinct browser profiles/private sessions or signing out between roles. Example identities are `seller@example.invalid`, `buyer@example.invalid`, `admin@example.invalid`; choose private demo passwords yourself. There are no bundled seeded accounts, fixed passwords or sample product records.

For the buyer, open the newest JSON email file under the API's private `.mail-outbox/`, follow its verification URL, press **Confirm email**, then **Refresh verification status** in My profile. The `.invalid` address is intentionally not a real mailbox. Do not serve/upload/commit the outbox or copy tokens into reports. Recovery can be demonstrated through the same private outbox using the latest single-use link.

An operator may obtain an existing admin user's ObjectId from the local database, for example in a local `mongosh` connection to the intended `pastperfect` database:

```javascript
db.users.findOne({ email: "admin@example.invalid" }, { _id: 1 })
```

Put that ID in `ADMIN_USER_IDS` on the backend (comma-separated if multiple), restart it and reload/sign in again. A literal placeholder ID does not grant access. This is local operator configuration, not a role-granting public endpoint.

## Rehearsal script

| Stage | Presenter action | Expected evidence |
| --- | --- | --- |
| Account | Sign in, edit profile, switch en/si/ta, confirm buyer email | Profile state, document/UI language; user-authored text unchanged |
| Inventory | Seller publishes a sample item with image, category fields and placeholder location | My listings and a public active card; normalized image output |
| Search | Buyer searches, filters attributes/price, saves a favourite and named preset | URL filter state; private saved items/presets, no reservation |
| Alerts | Enable preset alerts **before** another active account publishes a new matching item | After delay/bounded sweep, one search/listing event notification; own/pre-enable items excluded |
| Messaging | Buyer enquires; seller refreshes and replies | Same participant-only thread, manual refresh |
| Test order | Verified buyer reviews quote, reserves and simulates success | Reserved/locked item → sold/locked after success; immutable total/test reference |
| Collection | Seller marks ready; buyer confirms collection | Completed order, sold/unlocked item |
| Review | Buyer submits one rating/text; inspect seller profile | Public test label/test average, no live reputation |
| Remedy | On an eligible test order, buyer opens a case; seller responds/admin decides | Paused collection; simulated full refund or restored prior stage; no real money/automatic relisting |
| Admin | Report a sample listing; review report and visibility separately; try sample policy phrase | Queue/visibility decisions are independent and versioned |
| Analytics | View each seller's analytics | Own counts and explicitly simulated checkout/refund totals |

Use **separate items/orders** for alternative terminal outcomes (test failure, cancellation, refund). A sold/refunded record cannot be reset to active, a completed review cannot be edited and a closed dispute cannot be reopened. An order hold cannot be extended through seller edits. Demo sample policy phrases are `example-prohibited-item` (reject) and `example-review-item` (review); neither is real policy guidance.

For alert timing, the default settling delay is 60 seconds and the API sweep runs every minute in bounded batches. Do not promise an exact delivery deadline. You can run one batch manually from the API shell:

```sh
npm run search:alerts
npm run orders:expire
```

Both commands write normal job progress/state and require the intended local database. They do not reset data. Do not run `--apply` media maintenance merely to rehearse a demo; inspection is the default.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| API cannot start | MongoDB/URI, port and valid catalogue/policy/image driver; startup does not bypass missing dependencies |
| Cookie not restored or mutation rejected | Browser hostname, exact `WEB_ORIGIN`, credentialed requests, production Secure cookie on non-HTTPS |
| No email | Local driver/outbox and newest file; this mode never delivers to a real inbox |
| Cannot reserve | Verified buyer, another owner's active/unhidden/unlocked item, active accounts, no block, enabled non-production test mode |
| Conflict/stale version | Refresh record and review newer state; do not edit version numbers manually |
| No alert yet | Opt-in time, another owner's new matching visible item, settling delay, worker uptime/backlog and valid preset/catalogue |
| Missing public review | Completed test order, non-hidden review and active buyer/seller; disputed/refunded reviews are ineligible |
| Admin screens missing | Correct existing User ID in allowlist, restarted API/refreshed session; no public admin signup |

## Validation and limits

In the API repository, `npm test` uses MongoDB and disposable `pastperfect_test_*` databases. In the web repository run `npm test` and `npm run build`. The recorded v3.0 result was 94 backend/75 frontend tests plus build success. These counts are historical evidence, not a claim that this documentation edit reran them or conducted a full browser/device/native-language/provider assessment.

Rehearse with the actual browser and chosen data before a presentation. See [release checklist](../releases/local-release.md) and [source map](../reference/source-map.md) for explicit limits and traceability.
