import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { Lock, Eye, EyeOff, Scale } from 'lucide-react';

export function AuthResetPassword() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const { t } = useLanguageContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setMessage(error.message);
      } else {
        setSuccess(true);
        setTimeout(() => navigate('/dashboard', { replace: true }), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md bg-[#faf9f7] rounded-2xl shadow-2xl p-8 border border-[#d4af37]/20 text-center">
          <p className="text-[#0f172a] font-medium">{t('auth.passwordUpdated')}</p>
          <p className="text-gray-600 text-sm mt-2">{t('auth.redirecting')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <Scale className="w-96 h-96 absolute top-20 left-20 text-[#d4af37]" />
      </div>

      <div className="mb-8 text-center relative z-10">
        <div className="w-20 h-20 border-4 border-[#d4af37] rounded-full flex items-center justify-center mx-auto mb-4 bg-[#0f172a]">
          <span className="text-4xl text-[#d4af37] font-display font-bold">L</span>
        </div>
        <h1 className="text-3xl font-display text-white tracking-wider">LEXORA</h1>
      </div>

      <div className="w-full max-w-md bg-[#faf9f7] rounded-2xl shadow-2xl p-8 relative z-10 border border-[#d4af37]/20">
        <h2 className="text-xl font-display text-[#0f172a] mb-4 text-center">
          {t('auth.titleForgot')}
        </h2>

        {message && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#0f172a] mb-2">
              {t('auth.newPassword')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 bg-white"
                placeholder={t('auth.newPasswordPlaceholder')}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-[#d4af37]"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d4af37] text-[#0f172a] font-bold py-4 rounded-lg hover:bg-[#b8941d] transition-colors disabled:opacity-50"
          >
            {loading ? t('auth.loading') : t('auth.updatePassword')}
          </button>

          <button
            type="button"
            onClick={() => navigate('/auth', { replace: true })}
            className="w-full text-center text-sm text-[#d4af37] hover:underline"
          >
            {t('auth.backToLogin')}
          </button>
        </form>
      </div>
    </div>
  );
}
