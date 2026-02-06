import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useLanguageContext } from '@/contexts/LanguageContext';

export function ResetPassword() {
  const { t } = useLanguageContext();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
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
        setMessage(t('auth.passwordUpdated'));
        setTimeout(() => navigate('/auth'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#f5f5f0] rounded-2xl p-8 shadow-2xl border-2 border-[#d4af37]/30">
        <h1 className="text-3xl font-display text-[#0f172a] text-center mb-6">
          {t('auth.newPassword')}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.newPasswordPlaceholder')}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#d4af37] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20"
            required
            minLength={6}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d4af37] text-[#0f172a] py-3 rounded-lg font-semibold hover:bg-[#b8941d] transition-colors disabled:opacity-50"
          >
            {loading ? t('auth.loading') : t('auth.updatePassword')}
          </button>
        </form>
        {message && (
          <div className="mt-4 text-center text-[#0f172a] font-medium">{message}</div>
        )}
        <button
          type="button"
          onClick={() => navigate('/auth')}
          className="w-full mt-4 text-center text-sm text-[#d4af37] hover:underline"
        >
          {t('auth.backToLogin')}
        </button>
      </div>
    </div>
  );
}
