# Moderation, notifications and background workflows

## Reporting and listing visibility

A signed-in user reports a listing, user or received message using an allowed reason and optional detail text. The API verifies access and stores a bounded target snapshot. A reporter can see their own report type/reason/status through **My reports** (also linked from report notifications); admins see the review queue and private snapshots. One reporter/type/target record is retained; submitting again does not reopen it.

Admins resolve or dismiss an open report with a resolution and current report version. That decision does not automatically hide the listing, suspend the user or delete the message. Listing hide/restore is a separate versioned action, surfaced for listing reports. Hidden items disappear from public listing views/favourites; owners see the restriction. A hide is not an order cancellation or refund.

## Account enforcement and policy

Suspension/restoration requires admin authority, a reason and current `moderationVersion`; both change `authVersion`, so old sessions fail and users must log in again. Suspension hides the seller through discovery eligibility, without rewriting each listing's visibility. Restoration does not unhide separately hidden listings. The holder can appeal one time per suspension version, with up to 100 stored appeals. Admin acceptance restores the account and closes the current open appeal atomically; rejection leaves suspension intact. Manual restoration also closes the current open appeal as accepted.

The policy engine uses configured NFKC-normalized, case-insensitive literal terms against title/description. Reject rules block the content; review rules hide it pending **Policy review queue**. Approval/keep-hidden uses listing moderation and clears the policy-review flag; later edits are evaluated again. The shipped phrases are explicit examples, not actual law or a content classifier. No image/semantic classifier or automatic retroactive policy sweep exists.

Dispute/refund and review moderation use separate queues. They do not follow report resolution automatically. Review moderation records a shared reason, changes visibility and increments the order revision; admins cannot moderate their own buyer/seller orders. Audit retention is bounded (10 review decisions; 100 listing/account decisions), not a permanent compliance archive.

## Ordinary in-app notifications

Types include message, moderation, report, verification, account, order and search. Notifications store recipient, event key, server-generated internal link, timestamps and read state. The private list does not embed message bodies, raw tokens or report resolution notes. The header polls unread count every 30 seconds and on window focus; opening the notification page loads a page that can be refreshed and marked read.

Most feature notifications are persisted after the canonical operation using best-effort upserts. A committed order, message or moderation action can therefore succeed even if its notification is missing. Deduplication reduces repeated event rows; it is not a transactional outbox guaranteeing all events. Message content itself is manually refreshed and not streamed by the header poll.

## Saved-search alert delivery

Alerts are a separate opt-in flow with stricter retry semantics:

1. Creating a preset or toggling alerts on sets an eligibility start and scan cursor. Alerts default off; pre-enable listings are excluded. Preferences are private and capped at 25 per account.
2. The API sweeps at startup/every minute; `npm run search:alerts` processes one manual batch. `JobState` rotates eligible accounts (at most 10 per batch), with up to 10 matching listings per search per pass step.
3. Queries use current saved filters, exclude own/hidden/inactive/suspended-seller inventory, apply a settling cutoff (default 60 seconds) and sort by createdAt/ID. Changed-catalogue invalid presets are retained but skipped.
4. Before each write the worker rechecks recipient preference/revision and current match/visibility. It persists a notification using a unique recipient/search/listing event key, then advances the cursor using its prior cursor/revision.
5. Failed persistence leaves progress retryable. Completed ranges wrap to the enable floor, catching late inserts or later matches within that window; existing event keys deduplicate revisits. Disabling/deleting/renaming prevents stale cursor updates from overwriting preferences.

An already in-flight notification may finish after opt-out; delivered notifications remain. A link can become unavailable after delivery. Batches and repeated scans can delay alerts as history grows; there is no realtime/SLA promise or external email/push. Retain deduplication markers when designing future notification retention.

## Expiry and media maintenance

| Work | Execution | Bound / effect |
| --- | --- | --- |
| Pending order expiry | Startup/minute timer, applicable reads/quotes, `npm run orders:expire` | Up to 100 expired locked listings per batch; only matching pending reservation releases |
| Search alerts | Startup/minute timer, `npm run search:alerts` | 10 accounts, up to 25 presets each, 10 matching listings per preset |
| Retired image cleanup | Feature cleanup attempts and explicit media maintenance | Up to 100 queued assets/drain; rechecks listing/avatar references and original driver |
| Removed-listing image retention | `npm run media:maintenance` | Dry-run default; explicit `--apply` detaches eligible old media and drains cleanup; records/history remain |
| Local orphan inspection | `npm run media:orphans` | Dry-run default; explicit `--apply`; generated regular files only, grace/cursor/reference checks |

Media retention default is 30 days and orphan grace 24 hours: both are technical placeholders to review before applying. Neither job is a general account/message/order purge. The API installs no cron and timers stop with the process. Non-overlap flags are process-local; checkpoints/event keys are not a distributed job lease system. See [operations](https://github.com/BlueZoft/Past_Perfect_BackEnd/blob/master/docs/operations/operations.md), [source map](../reference/source-map.md) and the [admin guide](../guides/administrators.md).
