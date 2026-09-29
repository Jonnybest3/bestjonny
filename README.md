# Earn3X — deploy-ready marketplace MVP

Earn3X is configured as a genuine task marketplace: clients fund real tasks, workers complete and submit work, and the platform charges a disclosed 10% client-side platform fee. Worker plan activation fees are access/subscription fees and do not guarantee income.

## Configured worker plans

| Plan | Activation fee | Tasks/day |
|---|---:|---:|
| Beginner | ₦2,000 | 4–6 |
| Bronze | ₦3,500 | 7–10 |
| Diamond | ₦5,000 | 13–16 |
| Gold | ₦9,000 | 19–23 |
| 🌟 Gold | ₦15,000 | 25–28 |
| Expert | ₦25,000 | 30–35 |

Withdrawal policy: minimum ₦2,000; maximum ₦300,000,000; ₦100 fee; up to 4 requests/week; manual admin approval.

## Free-first deployment architecture

- Frontend/backend: Next.js
- Database/auth: Supabase free tier (subject to its current limits)
- Hosting: Vercel free tier (subject to its current limits)
- Payments: Paystack / Flutterwave after you create merchant accounts and add credentials as secrets

No payment secret, bank PIN, OTP, or password should be placed in source code or sent in chat.

## Setup

1. Create a Supabase project.
2. In Supabase SQL Editor, run `supabase/schema.sql`.
3. Create an auth account for the administrator.
4. In the `profiles` table, change that user's `role` to `admin`.
5. Copy `.env.example` to `.env.local` and add the Supabase project URL and anon key.
6. Run `npm install` then `npm run dev`.
7. Deploy the repository to a Git provider and connect it to Vercel, or use another supported Next.js host.
8. Add payment-provider secrets only to the host's environment-variable/secret settings.

## Important production work before accepting real money

- Implement signed Paystack/Flutterwave webhooks.
- Verify every deposit server-side before crediting a wallet.
- Use an immutable ledger for all balance changes.
- Add idempotency keys for payment events.
- Add rate limiting, CAPTCHA/abuse protection, email verification and password recovery.
- Add server-side authorization for every admin action.
- Add a proper bank-account verification workflow before withdrawals.
- Add task proof validation and dispute handling.
- Publish terms, privacy policy, refund rules and fee disclosures.

The current project is intentionally safe to deploy as an MVP without pretending that payment verification is complete. Do not accept real customer money until the payment webhook and ledger controls are completed.
