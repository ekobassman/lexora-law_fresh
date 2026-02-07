import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { Scale } from 'lucide-react';

export function ResetPassword() {
  const { t } = useLanguageContext();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (password !== confirmPassword) {
      setMessage(t('auth.passwordMismatch'));
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setMessage(error.message);
      } else {
        setSuccess(true);
        setMessage(t('auth.passwordUpdated'));
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#d4af37] flex items-center justify-center text-[#d4af37] font-display text-xl font-bold">
            L
          </div>
          <span className="text-white font-display text-2xl tracking-wider">LEXORA</span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-display text-white text-center mb-3">
          {t('auth.newPassword')}
        </h1>
        <p className="text-gray-400 text-center mb-10 text-lg">
          {t('auth.subtitleReset')}
        </p>

        <div className="w-full max-w-lg bg-[#f5f5f0] rounded-2xl p-8 shadow-2xl border border-[#d4af37]/20">
          {success ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-100 text-green-800 border border-green-300 rounded-lg text-center">
                {message}
              </div>
              <p className="text-center text-[#0f172a] text-sm">
                {t('auth.redirecting')}
              </p>
              <Link
                to="/dashboard"
                className="block w-full text-center text-[#d4af37] hover:underline py-2"
              >
                {t('auth.backToLogin')}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[#0f172a] font-medium mb-2 text-base">
                  {t('auth.newPassword')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.newPasswordPlaceholder')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#d4af37] focus:outline-none focus:ring-1 focus:ring-[#d4af37] bg-white"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-[#0f172a] font-medium mb-2 text-base">
                  {t('auth.confirmPassword')}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#d4af37] focus:outline-none focus:ring-1 focus:ring-[#d4af37] bg-white"
                  required
                  minLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#d4af37] text-[#0f172a] py-4 rounded-lg font-bold text-lg hover:bg-[#b8941d] transition-colors disabled:opacity-50 shadow-md"
              >
                {loading ? t('auth.loading') : t('auth.updatePassword')}
              </button>
              {message && (
                <div className="p-4 bg-red-100 text-red-800 border border-red-300 rounded-lg text-sm">
                  {message}
                </div>
              )}
              <Link
                to="/auth"
                className="block w-full text-center text-[#d4af37] text-sm hover:underline py-2"
              >
                {t('auth.backToLogin')}
              </Link>
            </form>
          )}
        </div>
      </main>

      <footer className="py-8 px-4 flex justify-center">
        <div className="flex items-center gap-2 text-[#d4af37]">
          <Scale className="w-5 h-5" />
          <span className="font-display text-lg">{t('auth.titleLogin')}</span>
        </div>
      </footer>
    </div>
  );
}
