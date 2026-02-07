# Supabase Setup Lexora

## Eseguire le migrations

### Opzione 1: Supabase Dashboard

1. Vai su [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleziona il progetto Lexora
3. **SQL Editor** → **New query**
4. Copia il contenuto di `migrations/001_initial_schema.sql`
5. Incolla e clicca **Run**

### Opzione 2: Supabase CLI

```bash
# Installa Supabase CLI se necessario
npm install -g supabase

# Login
supabase login

# Link al progetto
supabase link --project-ref <PROJECT_REF>

# Applica le migrations
supabase db push
```

## Storage buckets

Dopo le migrations, crea il bucket (se non esiste) e applica le policy:

1. **Policy SQL**: la migration `004_storage_policies_documents.sql` (con `supabase db push`) crea le RLS policy per il bucket `documents` (INSERT/SELECT/DELETE per utenti autenticati sui propri file).
2. **Creazione bucket**: dalla root del progetto, con `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` impostati:
   ```bash
   npm run storage:ensure
   ```
   Crea il bucket `documents` (privato, 20MB, image/* e application/pdf) se non esiste.

Oppure manualmente: **Storage** → **New bucket** → Nome `documents`, Pubblico: No.
