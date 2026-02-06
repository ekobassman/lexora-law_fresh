# Imposta OPENAI_API_KEY per l'Edge Function process-ocr
# Legge da .env (VITE_OPENAI_API_KEY) e crea supabase/functions/.env + secrets

$root = (Get-Item $PSScriptRoot).Parent.FullName
$envFile = Join-Path $root ".env"
$funcEnv = Join-Path $root "supabase\functions\.env"

if (-not (Test-Path $envFile)) {
  Write-Host "ERRORE: .env non trovato in $root" -ForegroundColor Red
  exit 1
}

$content = Get-Content $envFile -Raw
$match = [regex]::Match($content, 'VITE_OPENAI_API_KEY=(.+)')
if (-not $match.Success -or [string]::IsNullOrWhiteSpace($match.Groups[1].Value)) {
  Write-Host "ERRORE: VITE_OPENAI_API_KEY non trovata in .env" -ForegroundColor Red
  exit 1
}

$key = $match.Groups[1].Value.Trim()
$key = $key.Trim('"').Trim("'")

# Crea supabase/functions/.env per sviluppo locale
$funcDir = Split-Path $funcEnv
if (-not (Test-Path $funcDir)) { New-Item -ItemType Directory -Path $funcDir -Force | Out-Null }
Set-Content -Path $funcEnv -Value "OPENAI_API_KEY=$key" -NoNewline
Write-Host "OK: supabase/functions/.env creato" -ForegroundColor Green

# Imposta secret Supabase (produzione) - richiede Supabase CLI
if (Get-Command supabase -ErrorAction SilentlyContinue) {
  Push-Location $root
  try {
    supabase secrets set "OPENAI_API_KEY=$key"
    if ($LASTEXITCODE -eq 0) {
      Write-Host "OK: Supabase secrets aggiornato (process-ocr)" -ForegroundColor Green
    } else {
      Write-Host "AVVISO: supabase secrets set fallito" -ForegroundColor Yellow
    }
  } finally {
    Pop-Location
  }
} else {
  Write-Host "AVVISO: Supabase CLI non installato - segreto solo in supabase/functions/.env (locale)" -ForegroundColor Yellow
  Write-Host "Per produzione: npm i -g supabase, poi supabase secrets set OPENAI_API_KEY=..." -ForegroundColor Gray
}
