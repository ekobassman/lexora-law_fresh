import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, Mail, Lock, User, Scale } from 'lucide-react';

type AuthTab = 'login' | 'register' | 'forgot';

export function AuthForms() {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');
  const { signIn, signUp } = useAuth();
  const { t } = useLanguageContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') setActiveTab('register');
    else if (mode === 'login') setActiveTab('login');
  }, [searchParams]);

  const clearMessage = () => {
    setMessage('');
  };

  const getErrorMessage = (err: Error): string => {
    const msg = err.message?.toLowerCase() ?? '';
    if (
      msg.includes('load failed') ||
      msg.includes('failed to fetch') ||
      msg.includes('fetch failed') ||
      msg.includes('networkerror')
    ) {
      return t('auth.error_load_failed');
    }
    return err.message;
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessage();
    try {
      const { error } = await signIn(email, password);
      if (error) {
        setMessageType('error');
        setMessage(getErrorMessage(error));
      } else {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessage();
    try {
      const { error, needsConfirmation } = await signUp(email, password, name);
      if (error) {
        setMessageType('error');
        setMessage(getErrorMessage(error));
      } else if (needsConfirmation) {
        setMessageType('success');
        setMessage(t('auth.checkEmail'));
      } else {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessage();
    try {
      const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${baseUrl.replace(/\/$/, '')}/auth/reset-password`,
      });
      if (error) {
        setMessageType('error');
        setMessage(error.message);
      } else {
        setMessageType('success');
        setMessage(t('auth.resetSent'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <Scale className="w-96 h-96 absolute top-20 left-20 text-[#d4af37]" />
        <Scale className="w-64 h-64 absolute bottom-20 right-20 text-[#d4af37]" />
      </div>

      {/* Logo */}
      <div className="mb-8 text-center relative z-10">
        <div className="w-20 h-20 border-4 border-[#d4af37] rounded-full flex items-center justify-center mx-auto mb-4 bg-[#0f172a]">
          <span className="text-4xl text-[#d4af37] font-display font-bold">L</span>
        </div>
        <h1 className="text-4xl font-display text-white tracking-wider mb-2">LEXORA</h1>
        <p className="text-gray-400 text-lg">{t('auth.subtitleLogin')}</p>
      </div>

      {/* Main card */}
      <div className="w-full max-w-md bg-[#faf9f7] rounded-2xl shadow-2xl overflow-hidden relative z-10 border border-[#d4af37]/20">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              clearMessage();
            }}
            className={`flex-1 py-4 text-center font-medium transition-all ${
              activeTab === 'login'
                ? 'bg-[#0f172a] text-[#d4af37] border-b-2 border-[#d4af37]'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t('auth.login')}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              clearMessage();
            }}
            className={`flex-1 py-4 text-center font-medium transition-all ${
              activeTab === 'register'
                ? 'bg-[#0f172a] text-[#d4af37] border-b-2 border-[#d4af37]'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t('auth.signup')}
          </button>
        </div>

        <div className="p-8">
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg text-center border ${
                messageType === 'success'
                  ? 'bg-[#d4af37]/10 border-[#d4af37] text-[#0f172a]'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {message}
            </div>
          )}

          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#0f172a] mb-2">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 bg-white"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0f172a] mb-2">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 bg-white"
                    placeholder="••••••••"
                    required
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

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('forgot');
                    clearMessage();
                  }}
                  className="text-sm text-[#d4af37] hover:underline"
                >
                  {t('auth.forgotPassword')}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#d4af37] text-[#0f172a] font-bold py-4 rounded-lg hover:bg-[#b8941d] transition-colors disabled:opacity-50"
              >
                {loading ? t('auth.loading') : t('auth.loginButton')}
              </button>
            </form>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#0f172a] mb-2">
                  {t('auth.name')}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 bg-white"
                    placeholder="Max Mustermann"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0f172a] mb-2">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 bg-white"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0f172a] mb-2">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 bg-white"
                    placeholder="••••••••"
                    required
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
                {loading ? t('auth.loading') : t('auth.signupButton')}
              </button>
            </form>
          )}

          {activeTab === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-display text-[#0f172a] mb-2">
                  {t('auth.titleForgot')}
                </h3>
                <p className="text-gray-600 text-sm">{t('auth.subtitleForgot')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0f172a] mb-2">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 bg-white"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#d4af37] text-[#0f172a] font-bold py-4 rounded-lg hover:bg-[#b8941d] transition-colors disabled:opacity-50"
              >
                {loading ? t('auth.loading') : t('auth.resetButton')}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  clearMessage();
                }}
                className="w-full text-center text-sm text-[#d4af37] hover:underline mt-4"
              >
                {t('auth.backToLogin')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
