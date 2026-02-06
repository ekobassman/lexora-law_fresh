import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export function AuthForms() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { t } = useLanguageContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error: err, needsConfirmation } = await signUp(email, password, name);
        if (err) setError(getErrorMessage(err));
        else if (needsConfirmation) setSuccess(t('auth.confirm_email_message'));
        else navigate('/dashboard');
      } else {
        const { error: err } = await signIn(email, password);
        if (err) setError(getErrorMessage(err));
        else navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{mode === 'signup' ? t('auth.signup') : t('auth.login')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="text-sm font-medium mb-2 block">{t('auth.name')}</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={mode === 'signup'}
                placeholder="John Doe"
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium mb-2 block">{t('auth.email')}</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">{t('auth.password')}</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-green-500">{success}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '...' : mode === 'signup' ? t('auth.signup') : t('auth.login')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
