# Seller guide

Any active signed-in account can sell; there is no separate merchant registration or payout onboarding. The app is a local prototype. Listing prices use whole LKR; demo order/analytics amounts use LKR minor units. No live settlement or carrier service is connected.

## Publish an item

1. Open **Sell an item** (or **Create a listing** in My listings).
2. Enter a 3–120 character title, 10–4000 character description, whole-LKR price from 1 to 1,000,000,000 and a supported condition: New with Tags, Like New, Fairly Used, Used or Worn.
3. Choose a category and optional district/town from the configured catalogue. Shipped geography is example content. Use clothing size only for clothing; complete any category fields shown. Changing category clears the category-specific fields.
4. Select one to three JPEG/PNG/WebP photos, each at most 5 MB. Animated, corrupt or over-dimension images are rejected. Output is auto-rotated, metadata-free WebP, bounded to 1920 px (avatars 512 px), without enlargement.
5. Submit and check **My listings**. A configured policy rejection prevents the listing. A review match can produce a hidden item awaiting admin policy review; it is not publicly available merely because a record was created.

Do not rely on bundled example policy terms as real legal/product guidance. Product photos and descriptions remain your authored content; they are not translated or automatically verified.

## Manage current listings

Filter **My listings** by current active/reserved/sold status. Open **Edit** for editable active/reserved items to change details and replace the whole photo set. Photo replacement is not a partial append API. Keep existing photos by leaving replacement alone. Updates use the loaded version; reload after a conflict.

| Control / state | Meaning |
| --- | --- |
| **Reserve** | Manually mark an unlocked active item reserved; no buyer order or payment is created |
| **Make available** | Release an unlocked manual reservation to active |
| **Mark sold** | Manually mark an unlocked active/reserved item sold; does not establish a completed test order or review eligibility |
| **Remove listing** → **Confirm removal** | Soft removal from current inventory; no restore UI; order/messages remain |
| Active order lock | Edit/status/photo/removal operations cannot override the buyer's order |
| Hidden by moderation | Owner cannot edit/reactivate; removal is still allowed if no order lock |
| Sold | Cannot edit/reactivate; can remove when unlocked |

Removed/hidden items disappear from relevant public results. Media cleanup is separate; already-known image URLs may remain accessible. A soft remove is not permanent erasure. To sell a legitimately available item again after a completed/refunded sold listing, create a new listing rather than reactivating the old one.

## Messages and test collection

Open **Enquiries** for buyer conversations and refresh manually. Only thread participants can read/reply. Existing threads survive sale/removal. Blocks in either direction or a suspended recipient prevent sending. Avoid sensitive financial/personal information; if an uncertain send may have succeeded, refresh before retrying.

**My orders** includes orders where you are the seller or buyer. A buyer-specific pending hold locks inventory. You may **Cancel reservation** only while awaiting payment; expiry/failure can also release it. Only the buyer can simulate payment. After success, the listing is sold but locked: choose **Mark ready for collection**, then wait for the buyer's **Confirm collection**. Order contact reuses the buyer/listing conversation and enforces messaging restrictions.

No real charge is captured, no payout is due and no delivery service is ordered. A manual sold label and a simulated completed order are distinct records/actions.

## Handle a dispute and reviews

The buyer may open one dispute on an eligible test order. Read their reason, optionally **Submit seller response** once, and, if agreed, enter a shared resolution and **Simulate full refund**. The refund is always the original full checkout total, never an editable partial amount. An admin may refund or decline; decline restores the prior stage. Refund retains sold/removed inventory and does not verify physical return or republish it.

A completed test-order buyer may leave one immutable review. The seller profile feed shows eligible reviews with clear test labels. Opening a dispute/refund removes that order from current public review results; an eligible completed state can return after decline. Admins can hide/restore a review independently of the listing. Sellers cannot edit a buyer review, post a review through seller authority or use a seller-response-to-review feature (not implemented).

## Read seller analytics

Open **Seller analytics** and **Refresh analytics**. The tables count your listings and orders by stored status, with a separate hidden-listing count. Removed listings still contribute to all-time inventory counts. Simulated checkout totals show test paid/refunded amounts, including configured checkout fees. They are not net proceeds, real GMV, payouts, taxes, profit or traffic metrics. Another user's ID/query cannot switch your analytics scope.

If suspended, new selling/messaging/fulfilment/analytics is restricted; Account status, appeals and permitted order remedies remain available. See the [admin process](administrators.md), [marketplace states](../workflows/marketplace.md) and [source map](../reference/source-map.md).
