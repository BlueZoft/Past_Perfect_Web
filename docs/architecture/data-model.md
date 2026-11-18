# Data model and consistency

These are logical relationships; MongoDB references are not relational foreign-key constraints. IDs are ObjectIds unless stated otherwise. Most models have Mongoose timestamps. Public/private behavior comes from schema selection **and** explicit route/aggregation projections, not schema selection alone.

## Collections and embedded records

| Collection / model | Purpose and principal relationships | Constraints and visibility |
| --- | --- | --- |
| `users` / User | Email, password hash, account profile, verification/recovery digests, suspension/authentication versions; embedded appeals and saved searches | Unique normalized email. Hash/tokens/audits/preferences excluded from normal reads; explicit response serializers control exposure |
| `sessions` / Session | Token digest → user; expiry and copied auth version | Expiry checked on each request; TTL index supports later cleanup |
| `offers` / Offer | One owner → User; listing content, price, category/attributes, media refs, availability/visibility; embedded order ledger and reservation | Owners may edit only allowed states; private orders/reservation excluded from public responses |
| `favourites` / Favourite | User → listing | Unique user/listing; saved items are private |
| `enquiries` / Enquiry | Buyer + seller + listing, title snapshot, last-message time | Unique buyer/listing; only participants read/reply |
| `messages` / Message | Enquiry + sender + plain text | Up to 2000 characters; independent writes |
| `blocks` / Block | User → blocked user | Unique directed pair; messaging checks both directions |
| `reports` / Report | Reporter → listing/user/message ID, snapshot, reason, status/resolution | Unique reporter/type/target; admin review and reporter-safe status views differ |
| `notifications` / Notification | Recipient, type, internal link, event key, optional read time | Unique user/event; no message/token body in notification API |
| `assetcleanups` / AssetCleanup | Driver + asset public ID + retry attempts | Unique asset/driver; reference checks before deletion |
| `jobstates` / JobState | String job ID, rotating account checkpoint | Search-alert progress; not a distributed queue or financial ledger |

## Listing record

Core fields are title (3–120 characters), description (10–4000), integer price (1–1,000,000,000 whole LKR), condition, optional clothing size, category, optional district/town, typed `attributes`, image metadata and owner. Bounds are technical starter policy, not market/legal research. The default catalogue has example attributes such as brand/model, furniture dimensions and book author/ISBN.

A listing has `status` = active/reserved/sold/removed, `moderationHidden`, optional policy review metadata, `orderLock`, and `__v`. Availability, moderation visibility and an order lock answer different questions. A hidden active item is not publicly discoverable; a manually reserved item may be unlocked but cannot start a new buyer order. A removed item has no public detail view and no owner restore action.

## Embedded order

Each order snapshots buyer/seller/listing IDs, title, item/platform/delivery/total **minor-unit** amounts, LKR currency, request key, expected listing version, status, revision, times and collection fulfilment. Payment mode/reference are filled by simulation. The listing's separate reservation points to the active order and may carry a hold expiry. Successful simulation removes the live reservation deadline; the order's earlier snapshot expiry can remain for history.

One order can embed one dispute and one review. Dispute data keeps its previous collection state, buyer reason/time, optional seller response/time, outcome/resolver/time and simulated refund fields. Review data stores immutable rating/text/time, hidden state and bounded moderation decisions. There is no general-purpose order address, card, carrier, settlement or payout record.

The ledger stops accepting new orders at 100 per listing. A partial unique compound index on embedded buyer/request-key pairs supports cross-listing idempotency-key conflict protection; service/CAS checks also prevent duplicates within a listing (a multikey unique index alone is not an intra-array uniqueness rule). No history is silently archived to bypass the bound.

## Versions and atomic updates

| Caller sends `version` from | Protects |
| --- | --- |
| Listing `__v` | Seller edit/status/removal/photo changes and admin listing visibility |
| Order `revision` | Payment/collection/cancellation, disputes, review creation/moderation |
| User `avatarVersion` | Avatar replacement/removal |
| User `moderationVersion` | Account state and appeals for that suspension |
| Saved search `revision` | Name/alert setting/removal |
| Report `__v` | Report review decision |

A 409 means reload current server state before deciding whether to retry. Listing/order writes can increment both listing and embedded order versions. Search worker cursor updates compare the search revision/prior cursor without incrementing its user-facing edit revision. Password reset and account moderation increment `authVersion` to invalidate sessions; that is not an optimistic edit version.

## Bounded history and independent side effects

Saved searches are capped at 25 per account. Appeals are capped at 100; account/listing audit retention is bounded to the last 100 entries, and review moderation to the last 10 per order. Those bounds are not a legal retention guarantee. Reports/messages/notifications have no general erasure UI in this version. User deletion, full archival and financial audit requirements remain separate work.

Core order/inventory updates are atomic within an Offer document. Ordinary notifications and message/media side effects are independent. See [moderation and jobs](../workflows/moderation-and-jobs.md) for recovery and retention, and [source map](../reference/source-map.md) for exact schemas/indexes. Future changes to catalogue IDs, order storage or array limits require an explicit migration/design; none is automatically performed.
