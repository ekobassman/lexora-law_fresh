import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const BANNER_DISMISSED_KEY = 'lexora_pwa_banner_dismissed';

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Verifica se già installata (display-mode standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone) setInstalled(true);

    const dismissed = sessionStorage.getItem(BANNER_DISMISSED_KEY);
    if (!dismissed && deferredPrompt) setVisible(true);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    if (deferredPrompt && !sessionStorage.getItem(BANNER_DISMISSED_KEY)) {
      setVisible(true);
    }
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setVisible(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    sessionStorage.setItem(BANNER_DISMISSED_KEY, '1');
    setVisible(false);
  };

  if (!visible || installed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-4 rounded-lg border border-gold/50 bg-navy p-4 shadow-lg md:left-auto md:right-4 md:max-w-md">
      <p className="text-sm">
        Installa Lexora per usarlo offline e come app.
      </p>
      <div className="flex shrink-0 gap-2">
        <Button size="sm" onClick={handleInstall}>
          Installa
        </Button>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded p-1 hover:bg-navy-light"
          aria-label="Chiudi"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
