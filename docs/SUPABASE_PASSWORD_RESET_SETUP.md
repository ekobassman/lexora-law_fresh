# Supabase Password Reset — Lexora Branding

This document describes how to configure Supabase so Lexora password reset emails use custom sender branding and the Lexora luxury HTML template.

---

## A) Custom SMTP (Sender Branding)

1. Open **Supabase Dashboard** for your project.
2. Go to: **Authentication** → **Email** (or **Authentication** → **Providers** → **Email**) → **SMTP Settings**.
3. Enable **Custom SMTP**.
4. Configure:
   | Field | Value |
   |-------|-------|
   | **Sender name** | Lexora |
   | **Sender email** | no-reply@lexora-law.com |
   | **Reply-to** | support@lexora-law.com |
   | **Host** | Your SMTP provider host (e.g. `smtp.postmarkapp.com` for Postmark, `smtp.mailgun.org` for Mailgun) |
   | **Port** | 587 (TLS) or 465 (SSL) |
   | **Username** | Your SMTP provider username |
   | **Password** | Your SMTP provider password |
5. **Save**.
6. Use **Send test email** in Supabase to verify the sender shows "Lexora" and not Supabase.

> **SMTP providers:** If not configured yet, set up Postmark or Mailgun, verify the domain `lexora-law.com`, and use their SMTP credentials in Supabase.

---

## B) Reset Password Email Template

1. In Supabase Dashboard, go to: **Authentication** → **Email Templates**.
2. Select the **Reset password** template.
3. Replace the entire HTML body with the contents of:
   ```
   supabase/email-templates/reset-password-lexora.html
   ```
4. **Important:** Supabase uses `{{ .ConfirmationURL }}` as the reset link placeholder. The template already uses it. If Supabase uses a different variable (e.g. `{{ .SiteURL }}` combined with a hash), adjust the template to match.
5. **Save** the template.

---

## C) Site URL / Redirect (Supabase)

1. Go to: **Authentication** → **URL Configuration**.
2. Set **Site URL** to your production URL, e.g. `https://lexora-law.com`.
3. Add **Redirect URLs** if needed: `https://lexora-law.com/auth/reset`, `https://lexora-law.com/auth/reset-password`.
4. The app code passes `redirectTo: /auth/reset` when requesting a password reset, so the link in the email will open the Lexora reset page.

---

## D) Verify — Manual Test Steps

1. Go to the login page and click "Forgot password?" (or `/auth/forgot`).
2. Enter a valid email and submit.
3. Check your inbox. Confirm:
   - **Sender** shows **Lexora** (`no-reply@lexora-law.com`), not Supabase.
   - **Subject/body** matches Lexora luxury style (navy background, gold accents).
4. Click the "Set new password" button in the email.
5. The link should open the Lexora `/auth/reset` page (not a generic Supabase page).
6. Enter new password + confirm password, then submit.
7. On success: message shows, then redirect to `/dashboard`.

---

## Code Changes Summary

| File | Change |
|------|--------|
| `src/pages/Auth/ForgotPassword.tsx` | `redirectTo` set to `/auth/reset` |
| `src/pages/Auth/ResetPassword.tsx` | Luxury layout, confirm password, success → redirect to `/dashboard`, i18n |
| `src/App.tsx` | Routes `/auth/reset` and `/auth/reset-password` both render `ResetPassword` |
| `src/i18n/locales/*.json` | Added `auth.subtitleReset`, `auth.confirmPasswordPlaceholder` (all 11 locales) |
| `supabase/email-templates/reset-password-lexora.html` | Lexora luxury HTML template (paste into Supabase) |
| `docs/SUPABASE_PASSWORD_RESET_SETUP.md` | Setup instructions for SMTP + email template |
