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

Dopo la migration, crea il bucket per i documenti:

1. **Storage** → **New bucket**
2. Nome: `documents`
3. Pubblico: No (RLS via policies)
