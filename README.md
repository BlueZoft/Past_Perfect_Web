# Past Perfect Web marketplace — v3.0.0

React 18/Vite web client for a used-item marketplace prototype intended for Sri Lanka. It supports English/Sinhala/Tamil, listing discovery and seller management, profiles, favourites, saved searches/in-app alerts, private enquiries, moderation/appeals and a collection-only test order/dispute/refund/review workflow. Seller analytics clearly labels simulated checkout totals.

**No real payments, refunds, payouts or customer reputation are enabled.** Bundled geography/policy and technical business settings are documented placeholders. This is a locally demonstrable application, not a deployed commercial service.

## Documentation

Start with the organized [documentation handbook](docs/README.md):

- [In-depth platform introduction](docs/platform/introduction.md).
- [Architecture](docs/architecture/overview.md), [data model](docs/architecture/data-model.md), [security and privacy](docs/architecture/security.md).
- [Marketplace workflows](docs/workflows/marketplace.md), [moderation and background jobs](docs/workflows/moderation-and-jobs.md).
- [Buyer/account guide](docs/guides/buyers.md), [seller guide](docs/guides/sellers.md), [administrator guide](docs/guides/administrators.md), [local setup/demo guide](docs/guides/local-demo.md).
- [Screens/capabilities](docs/reference/routes-and-capabilities.md), [source evidence](docs/reference/source-map.md), [glossary](docs/reference/glossary.md).
- [Accessibility](docs/quality/accessibility.md), [localization](docs/quality/localization.md), [roadmap](docs/planning/roadmap.md), [release history](docs/releases/history.md).

The companion [API index](https://github.com/BlueZoft/Past_Perfect_BackEnd/blob/master/docs/README.md) owns current HTTP/configuration/operations contracts. This documentation set was audited against Web `2abc119` / API `aa07731`; earlier filenames remain redirects for existing links. Historical release notes are clearly separate from current user guidance.

## Development

Use Node 22+ (previous validation: Node 24), npm, MongoDB 7 and the companion API. Keep existing configuration; create `.env.local` from `.env.example` only if absent and review `VITE_API_URL` (default `http://localhost:3001`). No private secret belongs in `VITE_*`.

```sh
npm ci
npm start
```

Vite binds port 3000 with strict-port behavior. Open `http://localhost:3000`, use localhost consistently in browser URLs and match the API's exact `WEB_ORIGIN`. Start MongoDB/API as described in the [demo guide](docs/guides/local-demo.md). Local backend image/mail adapters need no external credentials; the mail outbox stays private. No seeded demo identities/products or fixed account passwords are bundled.

```sh
npm test
npm run build
```

Build output is `dist/`; production hosting needs an `index.html` fallback for client routes. API URL is compiled at build time. Cookie sessions assume compatible same-site HTTPS frontend/API hosting in production; this README does not deploy it.

The recorded v3.0 checks were 75 frontend tests, 94 backend tests and successful production build. This prose/link reorganization does not claim a new full browser, device, translation or provider assessment. See [release checklist](docs/releases/local-release.md) for implemented scope, remaining launch/optional responsibilities and the demonstration boundary.
