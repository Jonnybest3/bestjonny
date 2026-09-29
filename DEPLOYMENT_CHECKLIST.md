# Earn3X launch checklist

## Before launch
- [ ] Create Supabase project
- [ ] Run schema.sql
- [ ] Create admin user and set role=admin
- [ ] Create Vercel account
- [ ] Add environment variables
- [ ] Test worker registration/login
- [ ] Test client registration/approval
- [ ] Test task creation rules
- [ ] Implement and test Paystack webhook
- [ ] Implement and test Flutterwave webhook
- [ ] Implement immutable wallet ledger
- [ ] Test withdrawal limits and weekly counter
- [ ] Add Terms, Privacy, Refund and Task Rules pages
- [ ] Configure email confirmation/reset
- [ ] Add abuse/rate-limit controls

## Never do
- Never store payment secret keys in GitHub/source code.
- Never credit a wallet from a client-side payment success screen alone.
- Never promise guaranteed earnings from activation fees.
- Never pay workers for fake engagement, spam, fraud, or prohibited activity.
