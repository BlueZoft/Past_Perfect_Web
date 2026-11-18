# Buyer and account guide

Interface labels below use English. The language selector switches application copy to Sinhala/Tamil while preserving user text and canonical filter values. See the [demo guide](local-demo.md) if you need a running local instance or local verification email.

## Create and maintain your account

1. Open **Sign up** and enter a username, email and password. Passwords need at least eight characters and no more than 72 UTF-8 bytes. Signup signs you in; ordinary browsing/selling does not require verified email.
2. Open **My profile** to edit username/bio and add, replace or remove an avatar. No avatar is uploaded during signup. Use JPEG/PNG/WebP within the 5 MB file limit; the server converts it to bounded WebP.
3. If email is configured, use the verification link from signup or **Send verification link** in My profile. Choose **Confirm email** on the link page. Return to My profile and **Refresh verification status** if the original tab has not updated. Verification is required before placing a test order, and does not certify identity or seller reliability.
4. Use **Sign out** when finished. If your session expires or a reset/moderation change invalidates it, sign in again.

For a forgotten password, open the recovery screen through login, enter your email and follow the newest recovery link. The response intentionally does not reveal whether an account exists. Confirm a new password explicitly, then sign in again; old sessions are invalidated. Verification/recovery links last 30 minutes, are single-use and are replaced when requested again. Local demos read mail files rather than a real mailbox.

## Find an item

On **Browse items**, use **Search in** to choose **Titles and descriptions** (word search) or **Title contains** (literal partial text). Add category, district/town, price range, condition, clothing size and any category-specific **Attribute filters**. A town must belong to the selected configured district; size is cleared when moving to a non-clothing category. Keywords can use quoted phrases or a leading minus term; they do not correct typos or translate terms.

Choose relevance, newest or price sorting as available. Changing filters resets page navigation. You can share the browse URL; pages show current inventory, not a frozen result snapshot. Open a card to inspect photos, description, attributes, asking price, status and the seller profile. Reserved/sold listings may remain accessible through saved links, but public discovery lists active items only.

## Save favourites and searches

Sign in and use the listing's save control to add/remove a favourite. **Favourites** is private; saving does not reserve the item. Reserved/sold favourites may remain, while hidden/removed/suspended-owner items are omitted.

After a valid browse result loads, enter **Search name** and choose **Save this search**. Optionally check **New listing alerts**. Open **Saved searches** to **Run saved search**, **Rename search**, toggle alerts or **Delete saved search**. There are at most 25 presets; equivalent canonical filters cannot be saved twice under different labels. Running a preset starts with normal pagination/current public results. To change filters, run it, adjust browse and save a new preset; renaming changes only its name.

Alerts are off by default and delivered only inside the app. Enabling starts a new eligibility window; existing pre-enable listings are not backfilled. The API must be running (or its CLI batch run) and a settling/scan delay applies. Opting out does not erase delivered notifications. Refresh a conflicted preset; after an uncertain save, check the saved list before retrying.

## Enquire and arrange collection

Use the listing enquiry/message form to ask the owner a question about an active item. Go to **Enquiries** to reopen the thread and **Refresh messages** to load new content. Replies are plain text, at most 2000 characters, visible to the two participants. Threads survive a sold/removed listing. If a send's outcome is uncertain, refresh before resending.

Blocking either way or account suspension can stop new messages. Do not put card credentials, recovery links or sensitive personal/payment information into messages. The app does not negotiate a legally reviewed sale contract or provide buyer protection through messaging.

## Demonstrate an order

This section requires `PAYMENT_DRIVER=test` outside production and a verified buyer. No real money moves.

1. On another seller's active item, choose **Review order**. Review the item, platform/delivery fee and total from the server. Delivery is zero because fulfilment is collection-only. Fees/hold duration are technical configurable examples.
2. Choose **Reserve item**. This creates a buyer-specific hold and opens **Order details**. Recover an uncertain creation through **My orders**; a favourite/manual seller reservation is not the same hold.
3. Before expiry, choose **Simulate successful payment** or **Simulate failed payment**. A failure releases the pending item. **Cancel reservation** is available to either participant only while awaiting payment.
4. After simulated success, use the order message form to arrange collection if needed. The seller chooses **Mark ready for collection**; only then can you **Confirm collection**.
5. On a completed test order, submit one **Rating** and **Review text**. Reviews cannot be edited. Public reviews/averages are explicitly test-labelled and are not real customer reputation.

Disabled checkout or an unavailable listing is not a payment failure against your bank: there is no live charge. If a version/state conflict appears, use **Refresh order** and review the current state before acting.

## Problems, reports and disputes

Use report controls for a listing, seller or received message. Choose a reason and optional details; check your report-status page for the outcome. Repeating the same report does not reopen it. A report does not automatically hide content or refund an order. Use blocking to prevent messaging and manage blocked accounts at `/blocked-users`; public information and prior conversation history are not erased.

For an eligible confirmed/ready/completed test-paid order, enter **Buyer reason** and **Open order dispute**. Only one case is available per order. Collection actions pause. The seller can respond once and approve a full simulated refund; an administrator can also refund or decline with a shared resolution. A decline restores the prior collection stage. A refund never verifies return, relists the item or moves real money. Existing reviews become publicly ineligible while the order is disputed/refunded. There is no partial-refund, evidence-attachment or case-reopening feature.

If suspended, sign in again after the enforcement change and use **Account status** to read the reason and submit an appeal. The restricted interface still includes own orders and notifications, pending cancellation and permitted dispute remedies; it does not restore shopping/messaging privileges. Recovery/reset does not lift suspension.

See [workflow details](../workflows/marketplace.md), [screens](../reference/routes-and-capabilities.md) and [source evidence](../reference/source-map.md).
