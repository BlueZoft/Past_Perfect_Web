# Past Perfect marketplace documentation

This handbook describes **Past Perfect Web v3.0.0** and its companion Express/MongoDB API. It is for product reviewers, demo presenters, buyers, sellers, administrators and maintainers. The implementation is a browser-based marketplace prototype intended for Sri Lanka. No native mobile client or live payment service is included.

Documentation was audited against frontend commit `2abc119` and backend commit `aa07731`. The documentation-only revisions do not change runtime behavior. See [source evidence](reference/source-map.md) for code ownership and verification boundaries.

## Choose a starting point

| Reader or task | Start here |
| --- | --- |
| Understand the product and its current scope | [Platform introduction](platform/introduction.md) |
| Understand the system and its tradeoffs | [Architecture overview](architecture/overview.md), [data model](architecture/data-model.md), [security and privacy](architecture/security.md) |
| Follow the main business processes | [Marketplace workflows](workflows/marketplace.md), [moderation and background work](workflows/moderation-and-jobs.md) |
| Use an account, find items and try checkout | [Buyer and account guide](guides/buyers.md) |
| Publish items, manage collection and inspect metrics | [Seller guide](guides/sellers.md) |
| Review reports, appeals, disputes and reviews | [Administrator guide](guides/administrators.md) |
| Prepare and rehearse a local demonstration | [Local setup and demo guide](guides/local-demo.md) |
| Find screens and terminology | [Route reference](reference/routes-and-capabilities.md), [glossary](reference/glossary.md) |
| Review accessibility and translations | [Accessibility](quality/accessibility.md), [localization](quality/localization.md) |
| See earlier development and remaining work | [Release history](releases/history.md), [local release checklist](releases/local-release.md), [roadmap](planning/roadmap.md) |

## Companion API documentation

Backend contracts/configuration are maintained in the [API documentation index](https://github.com/BlueZoft/Past_Perfect_BackEnd/blob/master/docs/README.md):

- [API reference](https://github.com/BlueZoft/Past_Perfect_BackEnd/blob/master/docs/reference/api.md).
- [Accounts/email](https://github.com/BlueZoft/Past_Perfect_BackEnd/blob/master/docs/configuration/accounts.md), [catalogue](https://github.com/BlueZoft/Past_Perfect_BackEnd/blob/master/docs/configuration/catalogue.md), [search and alerts](https://github.com/BlueZoft/Past_Perfect_BackEnd/blob/master/docs/configuration/search.md).
- [Order rules](https://github.com/BlueZoft/Past_Perfect_BackEnd/blob/master/docs/workflows/orders.md), [operations](https://github.com/BlueZoft/Past_Perfect_BackEnd/blob/master/docs/operations/operations.md), [configuration reference](https://github.com/BlueZoft/Past_Perfect_BackEnd/blob/master/docs/configuration/environment.md).

GitHub links work when each repository is checked out separately. In the shared workspace the repositories are sibling directories. Old top-level documentation filenames remain short redirects so existing links continue to resolve. Current guidance lives in the subject directories; historical release notes describe earlier behavior and must not be used as today's operating contract.

## Reading the claims

**Implemented** means a code path exists in this version, not that it was deployed or tested against a live provider. **Test-only** means the payment/refund/review simulator, with no real money or real customer reputation. **Placeholder** means sample geography, policy or technical settings that need reviewed replacements. **Planned** means absent from this implementation.

The last recorded v3.0 verification was 94 backend tests, 75 frontend tests and a successful frontend production build. This documentation audit checks source consistency, navigation and links; it does not constitute a new full browser, device, translation, provider or production assessment.
