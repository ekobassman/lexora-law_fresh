import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { supabase } from '@/lib/supabase';
import { Scale, Shield } from 'lucide-react';

export function AuthPage() {
  const { t } = useLanguageContext();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age18: false,
    terms: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('error');

    if (mode === 'signup') {
      if (formData.password !== formData.confirmPassword) {
        setMessage(t('auth.passwordMismatch'));
        setMessageType('error');
        setLoading(false);
        return;
      }
      if (!formData.age18 || !formData.terms) {
        setMessage(t('auth.acceptRequired'));
        setMessageType('error');
        setLoading(false);
        return;
      }

      const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { full_name: formData.name },
          emailRedirectTo: `${baseUrl.replace(/\/$/, '')}/auth/callback`,
        },
      });
      if (error) {
        setMessage(error.message);
        setMessageType('error');
      } else {
        setMessage(t('auth.checkEmail'));
        setMessageType('success');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (error) {
        setMessage(error.message);
        setMessageType('error');
      }
      else navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#d4af37] flex items-center justify-center text-[#d4af37] font-display text-xl font-bold">
            L
          </div>
          <span className="text-white font-display text-2xl tracking-wider">LEXORA</span>
        </Link>
        <LanguageSwitcher />
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Titolo */}
        <h1 className="text-4xl md:text-5xl font-display text-white text-center mb-3">
          {t('auth.titleLogin')}
        </h1>
        <p className="text-gray-400 text-center mb-10 text-lg">
          {t('auth.subtitleLogin')}
        </p>

        {/* Card */}
        <div className="w-full max-w-lg bg-[#f5f5f0] rounded-2xl p-8 shadow-2xl border border-[#d4af37]/20">
          {/* Toggle */}
          <div className="flex mb-8 bg-gray-200 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-3 rounded-md text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-[#0f172a] text-[#d4af37] shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('auth.login')}
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-3 rounded-md text-sm font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-[#0f172a] text-[#d4af37] shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('auth.signup')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome (solo signup) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-[#0f172a] font-medium mb-2 text-base">
                  {t('auth.fullName')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#d4af37] focus:outline-none focus:ring-1 focus:ring-[#d4af37] bg-white"
                  placeholder={t('auth.fullNamePlaceholder')}
                  required={mode === 'signup'}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-[#0f172a] font-medium mb-2 text-base">
                {t('auth.email')}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#d4af37] focus:outline-none focus:ring-1 focus:ring-[#d4af37] bg-white"
                placeholder="email@example.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[#0f172a] font-medium mb-2 text-base">
                {t('auth.password')}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#d4af37] focus:outline-none focus:ring-1 focus:ring-[#d4af37] bg-white"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Conferma Password (solo signup) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-[#0f172a] font-medium mb-2 text-base">
                  {t('auth.confirmPassword')}
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#d4af37] focus:outline-none focus:ring-1 focus:ring-[#d4af37] bg-white"
                  placeholder="••••••••"
                  required={mode === 'signup'}
                />
              </div>
            )}

            {/* Checkbox 18 anni (solo signup) */}
            {mode === 'signup' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 items-start">
                <input
                  type="checkbox"
                  id="age18"
                  checked={formData.age18}
                  onChange={(e) => setFormData({ ...formData, age18: e.target.checked })}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-[#d4af37] focus:ring-[#d4af37]"
                />
                <label htmlFor="age18" className="text-amber-900 text-sm leading-relaxed">
                  <strong>{t('auth.age18Title')}</strong>
                  <br />
                  {t('auth.age18Text')}
                </label>
              </div>
            )}

            {/* Checkbox Termini (solo signup) */}
            {mode === 'signup' && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 flex gap-3 items-start">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-[#d4af37] focus:ring-[#d4af37]"
                />
                <label htmlFor="terms" className="text-gray-700 text-sm leading-relaxed">
                  <Shield className="inline w-4 h-4 text-[#d4af37] mr-1" />
                  {t('auth.acceptTerms')}{' '}
                  <Link to="/terms" className="text-[#d4af37] hover:underline">
                    {t('auth.terms')}
                  </Link>
                  ,{' '}
                  <Link to="/privacy" className="text-[#d4af37] hover:underline">
                    {t('auth.privacy')}
                  </Link>
                  , {t('auth.and')}{' '}
                  <Link to="/disclaimer" className="text-[#d4af37] hover:underline">
                    {t('auth.disclaimer')}
                  </Link>
                  <p className="text-gray-500 text-xs mt-1">{t('auth.deleteInfo')}</p>
                </label>
              </div>
            )}

            {/* Link password dimenticata (solo login) */}
            {mode === 'login' && (
              <div className="text-right">
                <Link to="/auth/forgot" className="text-[#d4af37] text-sm hover:underline">
                  {t('auth.forgotPassword')}
                </Link>
              </div>
            )}

            {/* Bottone */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#d4af37] text-[#0f172a] py-4 rounded-lg font-bold text-lg hover:bg-[#b8941d] transition-colors disabled:opacity-50 shadow-md"
            >
              {loading
                ? t('auth.loading')
                : mode === 'login'
                  ? t('auth.loginButton')
                  : t('auth.signupButton')}
            </button>

            {/* Messaggi */}
            {message && (
              <div
                className={`mt-4 p-4 rounded-lg text-center text-sm ${
                  messageType === 'success'
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}
              >
                {message}
              </div>
            )}
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0f172a] border-t border-gray-800 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-[#d4af37]">
            <Scale className="w-5 h-5" />
            <span className="font-display text-lg">{t('auth.titleLogin')}</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
            <Link to="/terms" className="hover:text-[#d4af37] transition-colors">
              {t('footer.terms')}
            </Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-[#d4af37] transition-colors">
              {t('footer.privacy')}
            </Link>
            <span>•</span>
            <Link to="/disclaimer" className="hover:text-[#d4af37] transition-colors">
              {t('footer.disclaimer')}
            </Link>
            <span>•</span>
            <Link to="/imprint" className="hover:text-[#d4af37] transition-colors">
              {t('footer.imprint')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
