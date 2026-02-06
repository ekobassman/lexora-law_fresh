# LOGICA DEL SISTEMA LEXORA

Documento estratto dal progetto legacy lexora-law-main. Descrive il comportamento, i flussi e i dati del sistema in linguaggio naturale, senza riferimento al codice sorgente.

---

## 1. SISTEMA DI CHAT (3 tipologie)

### 1.1 Chat Demo (Homepage)

**Contesto**: Chat accessibile senza login, pensata per conversioni. Posizionata sulla landing page dentro un frame dorato.

**Flusso conversazionale**:
- Lexora inizia con un messaggio di benvenuto che invita l’utente a descrivere la sua situazione legale.
- L’utente può scrivere o caricare un documento (immagine/PDF). Se carica un file, viene eseguita la pipeline completa: upload → OCR → analisi → bozza.
- Le domande dell’AI riguardano: tipo di problema, controparte, date, dati mancanti. L’AI raccoglie le informazioni necessarie prima di generare una lettera.
- Prima di generare il documento finale, l’AI presenta un riepilogo e chiede conferma esplicita (ok, sì, procedi, ecc.).
- In modalità demo, l’AI non genera mai una lettera completa da scaricare: si limita a raccogliere dati e a invitare alla registrazione, eventualmente chiedendo l’email.
- Se l’utente è loggato con piano pagato/admin/unlimited, la demo non è attiva e viene usata la chat completa.

**Limiti**:
- Massimo 20 messaggi utente al giorno (chiave per giorno locale, non rolling 24h).
- Il limite scatta solo dopo che è stato generato almeno un documento nella sessione.
- Admin e utenti unlimited/paid bypassano il limite.

**Preview documento**:
- Quando viene generata una bozza, viene mostrata in un’area dedicata e il testo viene salvato in session storage per la pagina di preview.
- L’utente può copiare, stampare, inviare via email o aprire una pagina di anteprima (letter-only preview).
- Dopo azioni di export (copia, preview, stampa, email) agli utenti anonimi viene proposto di salvare il caso con registrazione.

**Persistenza**:
- Messaggi, bozza e contesto AI sono salvati in localStorage per sopravvivere al refresh.
- Un buffer di sicurezza riduce il rischio di perdita dati in caso di chiusura improvvisa.
- Dopo 15 minuti di inattività la chat viene azzerata per privacy.

**Migrazione al dashboard**:
- Al raggiungimento del limite o in fase di “salva caso” i dati (messaggi + bozza) vengono salvati in localStorage con una chiave di migrazione.
- Dopo la registrazione, al primo accesso al dashboard questi dati vengono importati nella chat e salvati nel DB.

---

### 1.2 Chat Dashboard (Utente loggato)

**Contesto**: Chat nella dashboard utente, con o senza pratica selezionata.

**Modalità**:
- **Con pratica selezionata**: la chat è collegata alla pratica; messaggi e bozze possono essere salvati nel fascicolo; si applicano i limiti per piano (messaggi/giorno per pratica).
- **Senza pratica (modalità generale)**: chat libera, nessun salvataggio nel DB, nessun conteggio messaggi; l’AI risponde in modo breve e utile (come usare Lexora, cosa fare, ecc.) e invita a selezionare o creare una pratica per generare documenti.

**Differenze rispetto alla demo**:
- Richiede autenticazione.
- Storia chat persistente in database (dashboard_chat_history, case_chat_messages).
- Contesto iniettato: profilo utente (nome, indirizzo, ecc.) e contesto pratica (titolo, autorità, aktenzeichen, scadenza, documenti OCR, bozza esistente).
- Creazione pratica dalla chat: quando è pronta una bozza formale valida, viene mostrato un bottone “Salva pratica” e un dialog per il nome; al salvataggio viene creata una nuova pratica con bozza e titolo.

**Generazione documenti**:
- Stesso flusso della demo: raccolta dati → riepilogo → conferma → generazione.
- Divieto assoluto di placeholder ([Nome], [Data], ecc.): se mancano dati, l’AI chiede senza generare.
- L’AI usa automaticamente i dati mittente dal profilo (non chiede nome/indirizzo se già presenti).

**Ricerca legale online**:
- Se il messaggio richiede informazioni esterne (indirizzi, procedure, enti competenti), viene eseguita una ricerca web autonoma.
- Se il risultato ha alta confidenza: proposta all’utente con richiesta di conferma prima di usarlo nei documenti.
- Se confidenza bassa: l’AI chiede all’utente i dettagli, senza inventare.

**Limiti per piano**:
- Free: 3 messaggi/giorno.
- Starter: 15 messaggi/giorno.
- Pro: 50 messaggi/giorno.
- Unlimited: nessun limite.
- Admin bypassa sempre i limiti.
- Il conteggio è per utente e per giorno (message_date).

**Migrazione dalla demo**:
- Al caricamento del dashboard, se esiste una migrazione pendente (meno di 24 ore), messaggi e bozza demo vengono importati nella chat e nel DB, poi i dati in localStorage vengono cancellati.

---

### 1.3 Chat Edit (Modifica documenti)

**Contesto**: Chat nella pagina di dettaglio pratica, usata per modificare la bozza esistente.

**Modalità**:
- `chat`: domande e risposte generali sulla pratica.
- `modify`: focus sulla modifica della bozza.

**Comandi / flusso di editing**:
- L’utente scrive istruzioni in linguaggio naturale (es. “Formulazione più decisa”, “Aggiungi che ho già pagato”).
- L’AI applica le modifiche e restituisce una nuova versione della lettera, possibilmente con marcatori ---LETTERA--- / ---FINE LETTERA---.
- Un bottone “Aggiorna bozza” compare solo quando nella storia c’è un messaggio AI che contiene una lettera valida; al click il testo viene estratto e sostituisce la bozza nella pratica.

**Placeholder**:
- Se la bozza contiene placeholder ([Nome], [Data], ecc.), al primo ingresso nella modalità modify l’AI invia automaticamente un messaggio che elenca i campi mancanti e chiede di fornirli.

**Contesto isolato**:
- La conversazione è vincolata alla pratica corrente; l’AI non deve mescolare informazioni di altre pratiche.

**Estrazione lettera**:
- L’AI può restituire testo misto (commenti + lettera). Il sistema estrae solo la parte formale (apertura, chiusura, firma) e la propone come nuova bozza.

---

## 2. GENERAZIONE DOCUMENTI

### 2.1 Tipi di documenti

- **school_absence**: assenze scolastiche (giustifiche, asilo, ecc.).
- **employer_letter**: lettere al datore di lavoro (dimissioni, ferie, certificati, ecc.).
- **landlord_letter**: lettere al proprietario (affitto, sfratto, manutenzione, ecc.).
- **authority_letter**: lettere a uffici pubblici (comune, agenzia, tribunale, multe, ecc.).
- **generic**: lettera generica mittente–destinatario.

### 2.2 Dati richiesti per tipo

Per ogni tipo sono definiti campi obbligatori e opzionali; **location** e **letter_date** sono obbligatori per evitare placeholder [Luogo] e [Data].

Esempi:
- **school_absence**: nome genitore, nome studente, nome scuola, date assenza, motivo, luogo, data lettera.
- **employer_letter**: nome mittente, indirizzo mittente, nome datore, oggetto, dettagli richiesta, luogo, data lettera.
- **landlord_letter**: nome inquilino, indirizzo inquilino, nome proprietario, oggetto, dettagli, luogo, data lettera.
- **authority_letter**: nome mittente, indirizzo mittente, nome autorità, oggetto, dettagli, luogo, data lettera.
- **generic**: mittente, destinatario, oggetto, contenuto, luogo, data lettera.

Il tipo di documento viene inferito da parole chiave nel messaggio (in 11 lingue).

### 2.3 Struttura dei documenti

- Struttura: Mittente → Destinatario → Luogo + Data → Oggetto → Corpo → Chiusura → Firma.
- Formato: DIN 5008 per DE/AT/CH, standard per IT/FR/ES, ecc.
- Nessun placeholder: se manca un dato, si chiede all’utente e non si genera il testo.
- Marcatori tecnici [LETTER] e [/LETTER] usati in output, poi rimossi nella presentazione.

### 2.4 Flusso

1. Utente descrive il problema o carica un documento.
2. AI fa domande mirate fino a raccogliere tutti i campi richiesti.
3. AI propone un riepilogo e chiede conferma esplicita.
4. Solo dopo conferma: generazione della lettera formale.
5. Controllo anti-placeholder: se il testo contiene [Nome], [Data], ecc., il sistema non accetta la bozza e chiede i dati mancanti.
6. Presentazione della bozza all’utente (copia, preview, stampa, email, salvataggio in pratica).

---

## 3. SISTEMA OCR

### 3.1 Due percorsi

**Percorso 1 – Canonical pipeline (Demo / Case flow)**  
Upload → upload-document (Supabase) → ocr-document → analyze-and-draft.  
I file vanno in Storage, la riga document viene creata nel DB, l’OCR e l’analisi sono eseguiti da Edge Functions.

**Percorso 2 – OCR client (Dashboard chat)**  
Uso di `/api/ocr` (Vercel) con OpenAI Vision. Immagini compresse se > 2MB; limite 10MB.

### 3.2 Estrazione dati

- Estrazione testo da immagini (JPG, PNG, WEBP) e PDF.
- HEIC/HEIF non supportati; messaggio chiaro all’utente.
- Risultato OCR usato come contesto per analisi e generazione bozze.

### 3.3 Integrazione con la chat

- Nel demo: caricamento file → pipeline completa → OCR + analisi + bozza → messaggio AI con riepilogo e bozza.
- Nel dashboard: upload/camera porta su /scan; l’OCR può essere inviato come messaggio con prefisso tipo “[Document uploaded]” seguito dal testo estratto.
- Nel contesto pratica: i documenti con raw_text vengono iniettati nel prompt per la chat dashboard.

---

## 4. DATABASE & STORAGE

### 4.1 Tabelle principali

- **profiles**: id (FK auth.users), full_name, address, city, postal_code, country, preferred_language, sender_*, is_admin, is_family, plan_override, stripe_customer_id, stripe_subscription_id, created_at, updated_at.
- **pratiche**: id, user_id, title, authority, aktenzeichen, deadline, status, letter_text, draft_response, tone, chat_history (JSONB), created_at, updated_at.
- **documents**: id, user_id, pratica_id, bucket, path, file_name, mime_type, ocr_text, status, direction (incoming/outgoing), created_at.
- **dashboard_chat_history**: user_id, role, content, created_at.
- **dashboard_chat_messages**: user_id, message_date, messages_count (conteggio giornaliero).
- **case_chat_messages**: pratica_id, user_id, role, content, created_at (chat per pratica).
- **usage_counters_monthly**: user_id, period_key, cases_created, documents_processed, ecc.
- **subscriptions / stripe**: customer_id, subscription_id, plan.

### 4.2 Relazioni

- profiles 1:1 con auth.users.
- pratiche N:1 con auth.users.
- documents N:1 con pratiche e user_id.
- dashboard_chat_* legati a user_id.
- case_chat_messages legati a pratica_id e user_id.

### 4.3 Row Level Security (RLS)

- Utenti vedono e modificano solo i propri profili, pratiche e documenti.
- Condizioni basate su auth.uid() = user_id (o id per profiles).
- Service role per operazioni server-side (upload, webhook, ecc.).

### 4.4 Storage

- **Uploads**: file caricati dagli utenti (immagini, PDF).
- **pipeline_documents**: documenti usati nella pipeline.
- Politiche: lettura/scrittura solo per utente proprietario; upload-document usa service role.

---

## 5. AUTENTICAZIONE

### 5.1 Signup / Login

- **Signup**: email, password, nome. Redirect a /dashboard dopo conferma.
- **Login**: email, password.
- Supabase Auth (JWT). Sessione con refresh automatico.

### 5.2 Protezione rotte

- Rotte dashboard e pratiche richiedono utente loggato.
- Rotte admin richiedono ruolo admin (user_roles o profilo).
- Geo-block: alcuni paesi (es. RU, CN) possono essere bloccati con status 451.

### 5.3 Gestione sessione

- onAuthStateChange per aggiornare stato UI.
- Token JWT usato per Edge Functions (header Authorization).
- Demo/anonymous: signInAnonymously per ottenere un token valido; header X-Demo-Mode per bypass RLS su upload/OCR.

### 5.4 Ruoli

- **user**: utente standard.
- **admin**: accesso pannello admin, bypass limiti.
- **free / starter / pro / unlimited**: piani subscription (vedi sezione Pagamenti).

---

## 6. PAGAMENTI (Stripe)

### 6.1 Checkout

- create-checkout: crea sessione Stripe Checkout con metadata user_id e price_id.
- Redirect a Stripe, poi a /checkout-success o /subscription in base al risultato.

### 6.2 Webhook

Eventi gestiti:
- **checkout.session.completed**: associazione subscription a user_id, aggiornamento piano.
- **customer.subscription.created / updated**: aggiornamento plan e limiti.
- **customer.subscription.deleted**: downgrade a free.
- **invoice.payment_failed**: log e possibile email (Resend).
- **invoice.paid**: conferma pagamento.

### 6.3 Aggiornamento piani

- Mappatura Price ID → plan (starter, pro, unlimited).
- Limiti per piano: max_cases (starter 10, pro 50, unlimited 999999).
- Profili con is_family=true o plan_override non vengono modificati da Stripe (protezione famiglia/admin).

### 6.4 Limiti usage-based

- **Messaggi chat**: dashboard_chat_messages, conteggio per giorno.
- **Pratiche mensili**: usage_counters_monthly, cases_created.
- **Credits**: sistema credits (credits-consume, credits-refill-monthly) per consumo AI; possibili SYSTEM_CREDITS_EXHAUSTED e AI_CREDITS_EXHAUSTED.

---

## 7. EDGE FUNCTIONS

| Funzione | Scopo |
|----------|-------|
| **homepage-trial-chat** | Chat demo/homepage; input: message, language, conversationHistory, isFirstMessage, isDemo, legalSearchContext; output: ok, reply, draftText. |
| **dashboard-chat** | Chat dashboard; auth obbligatorio; input: message, userLanguage, chatHistory, caseId, userProfile, caseContext; output: response, draftReady, draftResponse, suggestedAction, messagesUsed, messagesLimit. |
| **chat-with-ai** | Chat modifica pratica; auth obbligatorio; input: userMessage, letterText, draftResponse, praticaData, chatHistory, mode; output: response (lettera estratta se mode=modify). |
| **upload-document** | Upload file in Storage + creazione riga document; multipart/form-data; supporta X-Demo-Mode. |
| **ocr-document** | Esegue OCR su document_id già caricato; aggiorna ocr_text. |
| **analyze-and-draft** | Analisi + generazione bozza da document_id; output: analysis, draft_text, ocr_text. |
| **create-case** | Crea nuova pratica da titolo, draft_response, status. |
| **create-checkout** | Crea sessione Stripe Checkout. |
| **stripe-webhook** | Gestione eventi Stripe (subscription, invoice, checkout). |
| **entitlements** | Restituisce plan, role, limits (messages, cases) per l’utente corrente. |
| **sync-subscription** | Sincronizza stato Stripe con profilo. |
| **customer-portal** | Redirect al portale Stripe per gestione abbonamento. |
| **check-subscription** | Verifica stato subscription. |
| **credits-consume** | Consuma credits per operazione AI. |
| **credits-get-status** | Stato credits utente. |
| **credits-refill-monthly** | Rifornimento mensile credits. |
| **extract-text** | Estrazione testo da file (alternativa OCR). |
| **process-document** | Pipeline alternativa per processare documenti. |
| **anonymous-analyze / anonymous-chat / anonymous-ocr** | Varianti per utenti anonimi. |
| **geo-check** | Controllo paese e possibile blocco. |
| **health** | Health check. |
| **admin-*** | Funzioni admin (user lookup, metrics, override, ecc.). |
| **web-search** | Ricerca web per contesto legale. |
| **send-contact-email / send-support-email** | Invio email via Resend. |
| **storage-upload** | Upload generico su Storage. |
| **sitemap** | Generazione sitemap. |

---

## 8. MULTI-LINGUA & LOCALIZZAZIONE

### 8.1 Lingue supportate (11)

IT, DE, EN, FR, ES, PL, RO, TR, AR, UK, RU.

### 8.2 Determinazione lingua

- Lingua UI: scelta esplicita dall’utente tramite LanguageContext; persistita in localStorage/profilo.
- Fallback: lingua browser, poi paese (country) se disponibile.
- L’AI risponde sempre nella lingua passata esplicitamente (userLanguage / language) senza auto-detect.

### 8.3 Paesi e normative

- 19 paesi configurabili (DE, AT, CH, IT, FR, ES, PL, RO, NL, BE, PT, GR, CZ, HU, SE, DK, FI, NO, IE, GB, OTHER).
- Per paese: defaultLanguage, authorityTerm (es. Behörde, Autorità), letterFormat (din5008, standard, uk).
- CountryLawSelector permette di scegliere il paese di riferimento per contesto legale e formattazione.

### 8.4 Adattamento normative

- legalRulesEngine: regole per paese (terminologia, formati).
- legalVersions: versioni localizzate di clausolele e testi legali.
- I documenti generati rispettano formato e terminologia del paese scelto.

### 8.5 Traduzioni

- File JSON in src/locales (ar, de, en, es, fr, it, pl, ro, ru, tr, uk).
- i18next per chiavi di traduzione; fallback su inglese se manca la chiave.

---

## Glossario

- **Pratica / Case**: fascicolo utente contenente lettera originale, bozza, documenti e chat.
- **Draft**: bozza di risposta formale generata dall’AI.
- **Letter text**: testo della lettera originale ricevuta (es. da OCR).
- **Aktenzeichen**: numero di riferimento/caso dell’autorità.
- **Scope gate**: filtro che respinge richieste fuori ambito legale/amministrativo.
- **Placeholder block**: blocco che impedisce di accettare bozze con [Nome], [Data], ecc.
- **Document gate**: logica che richiede conferma prima della generazione del documento finale.
