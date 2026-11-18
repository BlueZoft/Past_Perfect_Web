# Security, permissions and privacy

## Authentication and request boundary

Passwords are hashed with bcrypt (cost 12). Input requires at least eight characters and at most 72 UTF-8 bytes. Emails are normalized to lowercase. Signup/login issue a random 32-byte session secret in the `session` cookie; MongoDB stores its SHA-256 digest. Cookies are HTTP-only, SameSite=Strict, path `/`, last 24 hours and become Secure in production. Logout revokes the current session. Expiry is enforced during authentication even before TTL cleanup.

Every non-GET/HEAD/OPTIONS request requires the exact configured Origin, including scripts. Credentialed Axios requests use the configured API URL. HTTPS/same-site frontend and API hosting are required for the production cookie model; an arbitrary cross-site host pair is not supported by merely widening CORS. There is no browser-readable long-lived auth token, OAuth/social login, refresh-token API or administrator MFA.

Verification and recovery use single-use digests, 30-minute expiry and replacement on resend. Links carry raw tokens in fragments; the frontend captures/removes the fragment and requires explicit confirmation. Password reset increments `authVersion`, invalidating all older sessions even if session-row cleanup fails. Recovery answers generically for existing/nonexisting accounts when mail is configured; SMTP timing is not guaranteed identical. Never expose the local mail outbox, token links, private `.env` or database credentials.

## Authorization

Ownership/participants/admin identity come from the server session. A buyer and seller are ordinary users in different relationships to an item/order. `ADMIN_USER_IDS` grants administrator authority; client `isAdmin` state is display information and cannot grant access. Admins cannot suspend themselves/current allowlisted admins, resolve their own order disputes using admin authority or moderate their own order reviews.

| Actor | Principal permitted behavior |
| --- | --- |
| Anonymous visitor | Public listings, seller profiles/reviews, catalogue/policy/config/health; signup/login/verification/recovery |
| Active signed-in account | Own profile/avatar, favourites/searches/notifications/reports/blocks; owned inventory; participant enquiries/orders; buyer/seller actions under each state rule |
| Active allowlisted admin | Normal account behavior plus report/listing/account/appeal/policy/dispute/review moderation |
| Suspended signed-in account | Own status/appeals/notifications/logout, verification request, own order reads, pending cancellation and dispute/remedy endpoints only |

The suspended browser route set is narrower than anonymous discovery: it redirects other screens to Account status. Public unauthenticated API routes remain public; suspension is not erasure of public information or a global network ban. Suspended users cannot create/pay/fulfil orders, send messages, publish, use saved-search/analytics routes or create reviews. They can open an otherwise eligible test-order dispute or approve a simulated refund; simulation must still be enabled for actions that require it.

## Data exposure and content safety

Public listing queries omit order ledgers/reservations and moderation audits. Public seller profiles expose profile information and email-verification status, not email/hash/session/token/appeal/search records. Public reviews intentionally expose display name and review text, marked as test. Enquiries and orders require participant identity; reports have separate admin and reporter-safe views. Private routes use `Cache-Control: no-store`.

Files are signature/decode-checked, image-dimension/page limited and converted to WebP with metadata removed. This reduces untrusted image risks but is not malware scanning or content classification. Hidden/removed listings and suspended owners are filtered from relevant public queries; already-known/cached asset URLs are not instantaneously revoked. Soft removal is not data erasure.

Request fields, prices, IDs, states and versions are validated. Title/attribute substring searches escape regex metacharacters; keyword text is passed through the bounded MongoDB text-search interface rather than used as query operators. User text is not interpreted as HTML. Some endpoints use process-local limits, including signup/login, token flows, order creation, messages and reports; this is not a deployment-wide abuse control system.

## Explicit security limitations

No production security certification, live-provider verification, distributed limiter, administrator step-up auth, complete audit archive, full privacy-erasure process or manual accessibility/translation assessment is claimed. Canonical writes and ordinary notifications are not one transaction. Report resolution does not automatically enforce visibility or suspend an account. Review/test receipts cannot prove real payment or identity. See the [release boundary](../releases/local-release.md) and [operator guide](https://github.com/BlueZoft/Past_Perfect_BackEnd/blob/master/docs/operations/operations.md) before any live rollout.
