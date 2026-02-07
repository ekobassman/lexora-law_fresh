import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PWAInstallBanner } from '@/components/layout/PWAInstallBanner';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Home } from '@/pages/Home';
import { Dashboard } from '@/pages/Dashboard';
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

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/forgot" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/letter-preview" element={<LetterPreview />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/imprint" element={<Imprint />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
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
        <Footer />
        <PWAInstallBanner />
      </div>
    </BrowserRouter>
  );
}

export default App;
