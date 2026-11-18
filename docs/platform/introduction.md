# Platform introduction

## Purpose and product model

Past Perfect is a used-item marketplace prototype intended for Sri Lanka. Its original ambition was a locally focused resale service; the code does not substantiate a claim to be the first such marketplace, provide market research or encode reviewed Sri Lankan legal policy. Its implemented currency is LKR and the UI supports English, Sinhala and Tamil. The geography shipped with it is deliberately a sample district and town, not an authoritative location directory.

The core unit is an **item listing**, called an `Offer` in the API and database. A listing has one owner, a description, a whole-LKR asking price, condition, category, optional location/category attributes and up to three images. There is no multi-unit shopping cart, inventory quantity, multi-seller basket or auction. Buyers discover items and contact the owner. In development, a verified buyer can also reserve one item and walk through a collection-only simulated order.

The same account can buy and sell; there is no separate seller application, paid subscription or business onboarding process. Administrator access is a server-side allowlist, not a user-selectable role. Email verification establishes access to an inbox, not identity, ownership of an item or trustworthiness.

## What is available

| Area | Current behavior | Practical boundary |
| --- | --- | --- |
| Accounts | Signup/login/logout, profile/bio/avatar, verification and password recovery | No social login, phone/KYC verification, account deletion or administrator MFA |
| Discovery | Keyword titles/descriptions, literal title search, category/location/price/condition/size and typed attribute filters | Keyword search is word-based; no typo correction, translation, transliteration or fuzzy engine |
| Saved interests | Private favourites and up to 25 named saved searches, with optional in-app matching alerts | Neither favourites nor alerts reserve stock; no email/push alerts |
| Seller inventory | Publish, edit current items, replace photos, manually reserve/release, mark sold, soft-remove | Sold listings cannot be reactivated; an order lock blocks owner changes |
| Conversation | Private buyer/listing enquiry threads with plain-text replies | Manual refresh; no realtime transport, attachments or read receipts |
| Order demonstration | Server-priced snapshot, expiring buyer hold, cancellation, test success/failure, seller readiness and buyer collection | New orders require a verified buyer and explicitly enabled non-production simulator |
| Remedies | Buyer dispute, one seller response, seller/admin simulated full refund or admin decline | Starter one-case/full-refund policy; no real refund, escrow, return verification or chargeback |
| Reviews | One immutable review on a completed test order, public test-labelled feed, admin hide/restore | No live customer reputation; opening a dispute/refund removes the review from eligible public results |
| Trust controls | Listing/user/received-message reports, bidirectional messaging blocks, listing moderation, suspension/appeals and sample policy review | No automatic legal classifier, image content classifier or dedicated review-report appeal workflow |
| Seller analytics | Own listing/order status counts, hidden count and simulated checkout/refund totals | No real earnings, settlements, payouts, traffic attribution or tax reporting |

## A typical experience

A visitor searches for a used item and reads its public listing and seller profile. Signing up adds the ability to save items, maintain search presets and enquire. The owner manages the listing through **My listings**. For a local order demo, the verified buyer chooses **Review order**, reviews the server's quote and reserves the item. The buyer simulates successful payment, the seller marks it ready, and the buyer confirms collection. A review can then be submitted, or an eligible buyer can open a dispute to demonstrate the remedy process.

This sequence is supported by version checks, server-side role checks and a private order ledger. The frontend does not invent final prices or grant permission because a button is visible. Conversely, a visible listing or a notification does not guarantee continued availability: another buyer, seller or moderator may have changed it before the next request.

## Local operation versus live services

The frontend runs locally on port 3000, the API on 3001 and MongoDB commonly on 27017. Local image storage and a private local mail outbox make demonstrations possible without external credentials. The mail outbox writes messages to files; it does not send mail to real inboxes. A Cloudinary storage adapter and TLS SMTP adapter exist but require actual secure configuration; their presence does not mean a live account is connected.

Checkout defaults to disabled. `PAYMENT_DRIVER=test` enables it only outside `NODE_ENV=production`. The API refuses test charging/refunds in production, has no live payment provider/webhook/payout/carrier adapter and collects no card data. Setting a provider-like environment value cannot enable a missing integration. Simulated receipts and review averages are demonstration artifacts.

## Language, content and safety

Language switching changes interface copy, document language and date/number formatting, and persists the choice in the browser. User-authored titles, descriptions, bios, messages, reviews and admin reasons stay as written. Catalogue labels and policy notices come from backend configuration. Native-speaker review remains needed before public launch.

Uploaded images are checked and converted to bounded, metadata-free WebP output. Removed/hidden items disappear from relevant public queries, but known image URLs can remain accessible until storage cleanup/cache expiry. Reports and blocks help moderation; they do not provide payment protection or complete identity isolation. A report decision, listing visibility decision, account suspension and order dispute are distinct actions with different effects.

## Current completion boundary

This version is a locally demonstrable application milestone with automated regression coverage, not a publicly deployed commercial marketplace. Actual hosting/TLS/backups, shared throttling, scale testing, monitoring, reviewed policy/geography/retention, production services and human accessibility/translation checks remain launch work. Optional MFA, long-term audit archival, richer review appeals, external realtime delivery and fuzzy discovery are tracked separately in the [roadmap](../planning/roadmap.md).

Use the [demo guide](../guides/local-demo.md) for preparation, the role guides for screen-by-screen tasks, and the [architecture](../architecture/overview.md) for the technical design.
