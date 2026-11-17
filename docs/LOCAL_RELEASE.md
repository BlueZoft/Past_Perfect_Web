# v3.0 local frontend release

The local application milestone includes typed attribute discovery, named saved searches with opt-in in-app matching alerts, completed test-order reviews, administrative review moderation and private seller inventory/order analytics, alongside all v2 account/listing/media/community/order/dispute features.

```sh
npm ci
npm test
npm run build
npm start
```

Use the companion local MongoDB/API and retain existing `.env` files. Keep private credentials on the backend; `VITE_*` remains public. The backend [local release guide](https://github.com/BlueZoft/Past_Perfect_BackEnd/blob/master/docs/LOCAL_RELEASE.md) provides commands, the full feature checklist, test-payment setup, worker behavior, placeholder settings and limits. Both READMEs and action plans identify completed scope versus optional/launch work.

Local manual flow: save a metadata-filtered search with alerts checked; publish a matching item under another active account; wait for the configured backend settling/sweep interval; open its private notification. Toggle alerts off and confirm the control persists after refresh. Complete a simulated collection and submit a buyer review; check the test label on the seller page and admin hide/restore controls. Review `/analytics` under another seller to confirm its counts are separate. Error/refresh controls recover stale versions; user-written terms/reviews remain plain text.

Financial amounts and reviews are explicitly simulated. No card collection, actual refund, real reputation score, seller payout, delivery service, external alert delivery or live deployment/environment publication is enabled. Optional admin MFA, audit archival, fuzzy/transliterated search, review evidence/appeals, realtime/Web Push and traffic analytics remain separate enhancements, not completed claims. Hosting/provider setup, reviewed real configuration, manual assistive-technology/device/contrast checks and native-speaker review remain launch responsibilities.

Release verification: **94 backend tests**, **75 frontend tests**, and the frontend production build pass. No live provider or hosted deployment verification is claimed.
