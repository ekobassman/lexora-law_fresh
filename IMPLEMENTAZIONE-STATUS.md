# Lexora – Stato implementazione

## ✅ Completati

### STEP 1: Configurazione Base
- [x] Tailwind con colori Lexora (navy, gold)
- [x] `src/lib/supabase.ts` con variabili da .env
- [x] `src/types/index.ts` con tutte le interface
- [x] Routing in App.tsx (route pubbliche e protette)

### STEP 2: Autenticazione
- [x] AuthContext con login/signup/logout
- [x] Pagina Auth.tsx con form
- [x] ProtectedRoute per Dashboard
- [x] Logout in Navbar

### STEP 3: Database Setup
- [x] `supabase/migrations/001_initial_schema.sql` (tabelle, indici, RLS, trigger)
- [x] Istruzioni in `supabase/README.md`

### STEP 4: Layout & Navigation
- [x] Navbar con logo, lingua, login/logout
- [x] Footer
- [x] Layout responsive mobile-first
- [x] LanguageSwitcher con 11 lingue (ar, de, en, es, fr, it, pl, ro, ru, tr, uk)

### STEP 5: Chat Demo Homepage
- [x] ChatDemo in homepage
- [x] Limite 20 messaggi/giorno (localStorage)
- [x] Flusso conversazionale simulato (raccolta dati → riepilogo → bozza)
- [x] Preview documento generato
- [x] Pulsante "Salva nel Dashboard" (redirect a signup se non loggato)
- [x] Pagina LetterPreview

### STEP 6: Dashboard Utente
- [x] Dashboard.tsx protetta
- [x] Lista pratiche (cases) da Supabase
- [x] Creazione nuova pratica
- [x] Upload documenti con drag&drop
- [x] ChatDashboard integrata
- [x] CaseDetail con DocumentList, DocumentViewer, ChatEdit

### STEP 10: PWA
- [x] vite-plugin-pwa in vite.config.ts
- [x] manifest configurato (nome, colori, icons)
- [x] Service worker base (autoUpdate)
- [x] PWAInstallBanner component

### STEP 11: Edge Functions (struttura)
- [x] `supabase/functions/chat-completion/index.ts`
- [x] `supabase/functions/generate-document/index.ts`
- [x] `supabase/functions/process-ocr/index.ts`
- [x] `supabase/functions/stripe-webhook/index.ts`

---

## ⏳ Da completare

### STEP 7: Sistema Chat Completo
- [ ] Collegare ChatDemo/ChatDashboard/ChatEdit alla Edge Function `chat-completion`
- [ ] Gestione messaggi con Supabase realtime
- [ ] Integrazione OpenAI per risposte
- [ ] ChatEdit per modificare documenti esistenti (mode `edit`)

### STEP 8: Generazione Documenti
- [ ] Form raccolta dati per tipo documento
- [ ] Preview bozza prima della conferma
- [ ] Salvataggio documento nel DB
- [ ] Export PDF (libreria client-side o testo formattato)

### STEP 9: OCR
- [ ] Integrazione process-ocr Edge Function
- [ ] Chiamata upload → OCR dal frontend
- [ ] Visualizzazione risultati estratti

---

## Come procedere

1. **Supabase**: eseguire `supabase/migrations/001_initial_schema.sql` nel SQL Editor
2. **Environment**: verificare `.env` con `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
3. **PWA icons**: aggiungere `public/icons/icon-192.png` e `icon-512.png`
4. **Edge Functions**: implementare la logica OpenAI e OCR nelle funzioni
