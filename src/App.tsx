import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import {
  EXPECTED_SUPABASE_PROJECT_REF,
  SUPABASE_PROJECT_REF,
} from '@/lib/supabase';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PWAInstallBanner } from '@/components/layout/PWAInstallBanner';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Home } from '@/pages/Home';
import { Dashboard } from '@/pages/Dashboard';
import { DashboardNew } from '@/pages/DashboardNew';
import { AuthPage } from '@/pages/Auth';
import { AuthCallback } from '@/pages/AuthCallback';
import { ResetPassword } from '@/pages/Auth/ResetPassword';
import { ForgotPassword } from '@/pages/Auth/ForgotPassword';
import { Pricing } from '@/pages/Pricing';
import { CaseDetail } from '@/pages/CaseDetail';
import { LetterPreview } from '@/pages/LetterPreview';
import { Terms } from './pages/legal/Terms';
import { Privacy } from './pages/legal/Privacy';
import { Disclaimer } from './pages/legal/Disclaimer';
import { Imprint } from './pages/legal/Imprint';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { FAQ } from './pages/FAQ';
import { Help } from './pages/Help';

const isDev = (import.meta as { env?: { DEV?: boolean } }).env?.DEV ?? false;
const wrongProject =
  isDev &&
  SUPABASE_PROJECT_REF &&
  SUPABASE_PROJECT_REF !== EXPECTED_SUPABASE_PROJECT_REF;

function AppContent() {
  const location = useLocation();
  const isDashboardNew = location.pathname === '/dashboard/new';
  return (
    <div className="flex min-h-screen flex-col bg-[#0f172a]">
      {wrongProject && (
        <div
          className="sticky top-0 z-[100] flex items-center justify-center gap-2 bg-amber-600 px-4 py-2 text-center text-sm font-medium text-white"
          role="alert"
        >
          Wrong Supabase project: {SUPABASE_PROJECT_REF}. Expected:{' '}
          {EXPECTED_SUPABASE_PROJECT_REF}. Set VITE_SUPABASE_URL to
          https://{EXPECTED_SUPABASE_PROJECT_REF}.supabase.co
        </div>
      )}
      {!isDashboardNew && <Navbar />}
      <div className={isDashboardNew ? 'flex-1' : 'flex-1 pt-20'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/forgot" element={<ForgotPassword />} />
          <Route path="/auth/reset" element={<ResetPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/letter-preview" element={<LetterPreview />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/imprint" element={<Imprint />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/help" element={<Help />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/new"
            element={
              <ProtectedRoute>
                <DashboardNew />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cases/:id"
            element={
              <ProtectedRoute>
                <CaseDetail />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {!isDashboardNew && <Footer />}
      <PWAInstallBanner />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
