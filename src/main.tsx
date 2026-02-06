import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './lib/i18n'
import './index.css'
import App from './App'
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </AuthProvider>
  </StrictMode>,
)
