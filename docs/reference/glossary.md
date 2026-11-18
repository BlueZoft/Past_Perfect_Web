# Glossary

| Term | Meaning in this codebase |
| --- | --- |
| Past Perfect / PastPerfect | Product name used in the docs/UI; repositories are `Past_Perfect_Web` and `Past_Perfect_BackEnd` |
| Offer / listing | One seller-owned used item record; not a cart or multi-unit stock catalogue |
| Buyer / seller | A normal account's relationship to an enquiry/order/listing, not separate signup roles |
| Administrator | Existing user ID in backend `ADMIN_USER_IDS`; no client-granted role |
| Session | Expiring HTTP-only cookie secret backed by a database digest and auth version |
| Verification | Single-use email confirmation; not identity verification |
| Enquiry | Unique buyer/listing conversation shared with the seller |
| Manual reservation | Seller-set reserved availability status without a buyer order |
| Order reservation / hold | Buyer-specific expiring order pointer and mutation lock on an Offer |
| `orderLock` | Blocks seller edit/status/media/removal while an active order requires it |
| Order ledger | Private embedded `Offer.orders` array, including snapshots/dispute/review; no separate Order collection |
| Whole LKR / minor units | Listing asks use integer rupees; checkout snapshots multiply by 100 and add configured minor-unit fees |
| Test mode | Explicit non-production simulator; no real charge/refund/payout/reputation |
| `__v` / `revision` / `version` | Server edit counters; `version` payload must use the counter for that object, not an invented increment |
| `authVersion` | Authentication invalidation counter; distinct from optimistic record versions |
| Policy review | Configured literal matching flags an item hidden for human review |
| Report | User-submitted target snapshot/reason; resolution is separate from enforcement |
| Dispute | One buyer case on an eligible test order, pausing collection and retaining previous stage |
| Soft removal | Record marked removed, public access hidden; no immediate hard deletion |
| Saved-search fingerprint | Internal hash of canonical filters for duplicate detection, excluded from API output |
| Alert cursor / JobState | Private search progress/account rotation state; not a realtime delivery SLA |
| Best-effort notification | Separate write after a canonical action; failure may leave a missing notification |
| Placeholder | Deliberately illustrative configuration or starter technical rule requiring reviewed replacement |
