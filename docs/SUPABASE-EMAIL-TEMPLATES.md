# Supabase Email Templates – Lexora Luxury Style

Usa questi template su **Supabase Dashboard** → ttzykwwaruxcstftanae → **Authentication** → **Email Templates**.

---

## 1. Confirm signup

**Subject:** Willkommen bei Lexora - Bitte E-Mail bestätigen

**Body HTML:**
```html
<div style="background-color: #0f172a; padding: 40px 20px; font-family: Georgia, serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 2px solid #d4af37; border-radius: 16px; padding: 40px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="display: inline-block; width: 60px; height: 60px; border: 3px solid #d4af37; border-radius: 50%; line-height: 60px; font-size: 28px; color: #d4af37; font-weight: bold;">L</div>
      <h1 style="color: #0f172a; font-size: 28px; margin: 15px 0 0 0; letter-spacing: 2px;">LEXORA</h1>
    </div>
    <h2 style="color: #0f172a; font-size: 24px; margin-bottom: 20px; text-align: center;">Willkommen bei Lexora</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px; text-align: center;">
      Vielen Dank für Ihre Registrierung. Bitte bestätigen Sie Ihre E-Mail-Adresse, um mit Ihrem Rechtsassistenten zu starten.
    </p>
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{ .ConfirmationURL }}" style="background-color: #d4af37; color: #0f172a; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
        E-Mail bestätigen
      </a>
    </div>
    <p style="color: #9ca3af; font-size: 14px; text-align: center; margin-top: 30px;">
      Wenn Sie kein Konto erstellt haben, können Sie diese E-Mail ignorieren.
    </p>
    <div style="text-align: center; margin-top: 30px; color: #d4af37; font-size: 12px;">
      © 2026 Lexora. Alle Rechte vorbehalten.
    </div>
  </div>
</div>
```

---

## 2. Magic Link

**Subject:** Lexora – Ihr Magic-Link zum Einloggen

**Body HTML:**
```html
<div style="background-color: #0f172a; padding: 40px 20px; font-family: Georgia, serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 2px solid #d4af37; border-radius: 16px; padding: 40px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="display: inline-block; width: 60px; height: 60px; border: 3px solid #d4af37; border-radius: 50%; line-height: 60px; font-size: 28px; color: #d4af37; font-weight: bold;">L</div>
      <h1 style="color: #0f172a; font-size: 28px; margin: 15px 0 0 0; letter-spacing: 2px;">LEXORA</h1>
    </div>
    <h2 style="color: #0f172a; font-size: 24px; margin-bottom: 20px; text-align: center;">Einloggen mit Magic Link</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px; text-align: center;">
      Klicken Sie auf den Button unten, um sich bei Lexora anzumelden. Der Link ist einmalig und kurz gültig.
    </p>
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{ .ConfirmationURL }}" style="background-color: #d4af37; color: #0f172a; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
        Jetzt einloggen
      </a>
    </div>
    <p style="color: #9ca3af; font-size: 14px; text-align: center; margin-top: 30px;">
      Wenn Sie diesen Zugang nicht angefordert haben, können Sie diese E-Mail ignorieren.
    </p>
    <div style="text-align: center; margin-top: 30px; color: #d4af37; font-size: 12px;">
      © 2026 Lexora. Alle Rechte vorbehalten.
    </div>
  </div>
</div>
```

---

## 3. Reset Password

**Subject:** Lexora – Passwort zurücksetzen

**Body HTML:**
```html
<div style="background-color: #0f172a; padding: 40px 20px; font-family: Georgia, serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #f5f5f0; border: 2px solid #d4af37; border-radius: 16px; padding: 40px; text-align: center;">
    <div style="margin-bottom: 30px;">
      <div style="display: inline-block; width: 60px; height: 60px; border: 3px solid #d4af37; border-radius: 50%; line-height: 60px; font-size: 28px; color: #d4af37; font-weight: bold;">L</div>
      <h1 style="color: #0f172a; font-size: 28px; margin: 15px 0 0 0; letter-spacing: 2px;">LEXORA</h1>
    </div>
    <h2 style="color: #0f172a; font-size: 24px; margin-bottom: 20px; font-family: serif;">Passwort zurücksetzen</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
      Sie haben angefordert, Ihr Passwort zurückzusetzen. Klicken Sie auf die Schaltfläche unten, um ein neues Passwort zu erstellen.
    </p>
    <div style="margin: 40px 0;">
      <a href="{{ .ConfirmationURL }}" style="background-color: #d4af37; color: #0f172a; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
        Passwort zurücksetzen
      </a>
    </div>
    <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">
      Wenn Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.<br>
      Der Link ist 24 Stunden gültig.
    </p>
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #d4af37; color: #d4af37; font-size: 12px;">
      © 2026 Lexora. Alle Rechte vorbehalten.
    </div>
  </div>
</div>
```

---

## Variabile Supabase

- `{{ .ConfirmationURL }}` – Link di conferma / Magic Link / reset password
- `{{ .Email }}` – Email dell’utente
- `{{ .SiteURL }}` – Site URL configurato

## Opzione: Disabilitare conferma email

Per login immediato senza conferma:
**Authentication** → **Providers** → **Email** → disattiva **"Confirm email"**

Meno sicuro, ma l’utente entra subito.

---

## Fix: Link email punta a localhost

1. **Vercel** → Environment Variables → aggiungi: `VITE_APP_URL=https://lexora-law-fresh.vercel.app`
2. **Supabase** → Authentication → URL Configuration: Site URL e Redirect URLs includano `https://lexora-law-fresh.vercel.app/auth/callback` e `https://lexora-law-fresh.vercel.app/auth/reset-password`
3. **Redeploy** su Vercel.
