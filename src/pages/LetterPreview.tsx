import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

const DEMO_PREVIEW_KEY = 'lexora_demo_preview';

export function LetterPreview() {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DEMO_PREVIEW_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setText(parsed.text ?? null);
      }
    } catch {
      setText(null);
    }
  }, []);

  if (!text) {
    return (
      <main className="container py-12 px-4">
        <p className="text-muted-foreground text-center">
          Nessuna bozza in anteprima. Genera una bozza dalla chat demo.
        </p>
        <div className="flex justify-center mt-4">
          <Link to="/">
            <Button>Torna alla home</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="max-w-2xl mx-auto py-12 px-6">
        <div className="mb-6 flex justify-between items-center">
          <Link to="/">
            <Button variant="outline" size="sm">
              ← Torna
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={() => {
              window.print();
            }}
          >
            Stampa
          </Button>
        </div>
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
          {text}
        </pre>
      </div>
    </main>
  );
}
