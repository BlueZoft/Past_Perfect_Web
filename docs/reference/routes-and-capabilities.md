# Browser routes and capability reference

These are frontend routes from `src/App.jsx`, not API prefixes. Page components redirect/check login/admin state; the backend separately enforces permissions. All normal pages can display loading/errors; absence of a control does not establish an API guarantee.

| Route | Screen / purpose | Intended access |
| --- | --- | --- |
| `/` | Browse and filters, save search | Public; save requires active account |
| `/offer/:id` | Listing detail, favourite/report/enquiry controls, Review order link | Public detail; actions require eligible account |
| `/seller/:id` | Seller profile, active items, eligible test reviews | Public; report/block requires account |
| `/policy` | Configured sample marketplace rules | Public |
| `/login`, `/signup`, `/recover` | Account entry/recovery request | Public |
| `/verify-email`, `/reset-password` | Explicit fragment-token confirmation | Public link flows |
| `/profile` | Profile/avatar/email verification | Active account |
| `/publish` | Create listing | Active account |
| `/my-listings`, `/my-listings/:id/edit` | Owner inventory/edit/photos | Active owner, allowed item state |
| `/favourites`, `/saved-searches` | Private saved interests | Active account |
| `/enquiries`, `/enquiries/:id` | Participant inbox/thread | Active participant |
| `/blocked-users` | Own block management | Active account |
| `/reports` | Own report status list | Active account |
| `/notifications` | Private notification list/read actions | Active or suspended account |
| `/checkout/:id` | Server quote/reservation review | Active non-owner; verified/test mode for creation |
| `/orders`, `/orders/:id` | Participant history/detail/remedies/review | Participants; suspended access restricted to permitted actions |
| `/analytics` | Own seller counts/test totals | Active account |
| `/account-status` | Suspension reason and appeals | Signed-in account; appeal requires suspension |
| `/admin/moderation` | Reports and listing visibility | Active allowlisted admin |
| `/admin/accounts` | Known User-ID account enforcement and appeal queue | Active allowlisted admin |
| `/admin/policy` | Pending policy listings | Active allowlisted admin |
| `/admin/order-disputes`, `/admin/order-disputes/:id` | Case queues/detail/decisions | Active allowlisted admin; own-case decision restriction |
| `/admin/reviews` | Review hide/restore | Active allowlisted admin; own-order restriction |
| `/payment` | Legacy informational unavailable screen | Normal route; does not process payments |
| Any unmatched path | Not-found screen | Normal route set |

Suspended browser sessions have only `/account-status`, `/notifications`, `/orders` and `/orders/:id`; other paths redirect to Account status. Public API resources remain public. The server permits some verification/appeal/read actions even when the restricted browser does not expose a full profile screen. See [security](../architecture/security.md) for exact endpoint boundaries.

## Capability and storage distinctions

| Term in UI | What is persisted | What it does not imply |
| --- | --- | --- |
| Favourite | User/listing association | A reservation or copy of an item |
| Saved search | Private canonical filters/name/preferences | Historical result snapshot or availability guarantee |
| New listing alert | Private deduplicated notification/link | Realtime external push or inventory hold |
| Manual Reserve | Item status reserved | Buyer-specific order/payment |
| Reserve item at checkout | Order snapshot + matching locked reservation | Actual payment |
| Simulated payment/refund | Test mode/reference and state change | Money moved, escrow, payout or real receipt |
| Review | One completed test-order rating/text | Verified real customer reputation |
| Remove listing | Soft-removed state | Permanent data/asset erasure |
| Resolve report | Report outcome | Automatic hide/ban/refund |
| Email verified | Confirmed inbox token | Identity/KYC or seller quality |

See [source evidence](source-map.md) for all route/controller files and the [API reference](https://github.com/BlueZoft/Past_Perfect_BackEnd/blob/master/docs/reference/api.md) for request methods/payloads.
