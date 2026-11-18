# Administrator guide

## Obtain access

There is no public admin signup or role-edit screen. An operator adds an existing User ObjectId to backend `ADMIN_USER_IDS` and the user reloads/signs in as needed. A placeholder or malformed ID grants no access. Use the [demo setup](local-demo.md) for a local example. Server gates authorize every admin route; hiding/showing navigation is not the security boundary. Suspended admins cannot use administrative routes.

Keep moderation reasons appropriate for their audience. Report resolution is admin-held with reporter-safe status only; account suspension reasons/appeal outcomes are holder-visible; order dispute resolutions and review moderation reasons are shared with order participants. Do not paste confidential reporter evidence into those shared fields.

## Reports and listing visibility — `/admin/moderation`

1. Open **Moderation** and select the report status queue.
2. Read target type/ID, reporter, snapshot and details. Reports target listings, users or received messages; there is no dedicated review-report target type.
3. Enter a resolution note and resolve/dismiss an open report. A stale/already-reviewed report conflicts; reload it.
4. For a listing report, choose **Load current listing**, then use **Hide listing** or **Restore visibility** with a reason and current listing version if needed. Report resolution and visibility are independent.

This queue does not automatically ban an account, erase messages, cancel paid orders or refund a buyer. Hidden listings are excluded from public details/discovery/favourites; the owner can see their restriction and remove an unlocked item. Already-known asset URLs are not instantaneously revoked.

## Policy review — `/admin/policy`

Open **Policy review queue**, enter a moderation note and choose **Approve listing** or **Keep listing hidden**. The versioned visibility decision clears the pending policy-review flag. Later owner edits run configured policy matching again. Bundled reject/review phrases and multilingual notices are explicit placeholders; approve based on reviewed operating policy, not an assumption that this engine enforces actual law or analyzes photos.

## Accounts and appeals — `/admin/accounts`

Use **User ID** and **Load account** to inspect a known account and current moderation version. Enter a **Public reason** to suspend/restore it. There is no full user-directory search UI. Admins cannot suspend themselves or other currently allowlisted admins; operator-managed allowlist removal is a separate responsibility.

Account-state changes invalidate old sessions. Suspended holders must sign in again to see the restricted Account status view. Suspension filters their public seller inventory without rewriting per-listing moderation. Restoring does not unhide separately hidden items.

The same screen lists **Appeals** by status. For an open appeal, supply a holder-visible resolution and **Accept and restore account** or **Reject appeal**. Acceptance restores atomically; rejection preserves suspension. Manual restoration also accepts the current open appeal. One appeal per suspension version is allowed, up to 100 stored appeals. A version conflict calls for refresh, not bypassing the check.

## Order disputes — `/admin/order-disputes`

Filter open/refunded/declined cases and open a direct case link if needed. Read buyer reason, seller response, order stage and immutable total. Provide **Resolution shared with both participants** and either **Simulate full refund** or **Decline refund and resume order**. Admin authority cannot resolve your own buyer/seller order. You may act as an ordinary seller participant only where its normal role permits.

Simulation/refunds require enabled non-production test mode; an admin can still decline an existing case when simulation is disabled. Refunds never move real money, verify returns, alter the original amount or automatically relist stock. There are no partial refunds, attachments, case reopening or automatic deadline/SLA. The queue refreshes manually; no dedicated admin alert service exists.

## Review moderation — `/admin/reviews`

Enter **Shared moderation reason** and choose **Hide review** or **Restore review** using the current order revision. Own-order admin moderation is forbidden. Test reviews must retain test labels; hiding/restoring does not make them real reputation. Reviews from non-completed orders or suspended participants remain publicly ineligible even if not hidden. The last 10 review moderation entries are retained per order, not a permanent audit archive.

## Operating limits

Listing/account audit arrays keep the last 100 decisions. There is no automated long-term audit export, admin MFA, dedicated review evidence/appeals service or production financial reconciliation. Maintenance commands can delete storage when explicitly applied; follow the [operations guide](https://github.com/BlueZoft/Past_Perfect_BackEnd/blob/master/docs/operations/operations.md), correct database/driver/configuration and reviewed policy. Do not treat health readiness as a complete production readiness check.

See [moderation workflows](../workflows/moderation-and-jobs.md), [API contracts](https://github.com/BlueZoft/Past_Perfect_BackEnd/blob/master/docs/reference/api.md) and [source evidence](../reference/source-map.md).
