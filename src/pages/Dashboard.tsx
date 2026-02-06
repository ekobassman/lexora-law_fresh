import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatDashboard } from '@/components/chat/ChatDashboard';
import { Sidebar } from '@/components/layout/Sidebar';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { useCases } from '@/hooks/useCases';
import { Scale } from 'lucide-react';

export function Dashboard() {
  const { cases, loading, error, createCase } = useCases();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  const handleNewCase = async () => {
    setCreating(true);
    const newCase = await createCase('Nuova pratica');
    setCreating(false);
    if (newCase) navigate(`/cases/${newCase.id}`);
  };

  const handleFileSelect = (file: File) => {
    console.log('Upload file:', file.name, file.size);
    alert(`File "${file.name}" selezionato. Integrazione OCR in arrivo.`);
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      {/* Hero Title - luxury style */}
      <section className="bg-navy py-6 border-b-2 border-gold/30 shrink-0">
        <div className="container">
          <h1 className="text-center font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-wide text-gold drop-shadow-[0_2px_4px_rgba(201,162,77,0.3)]">
            DASHBOARD
          </h1>
        </div>
      </section>

      <main className="flex flex-1 min-h-0">
        <Sidebar
          cases={cases}
          loading={loading}
          error={error}
          onNewCase={handleNewCase}
          creating={creating}
        />
        {/* Content - ivory background, luxury cards */}
        <div className="flex-1 bg-ivory overflow-auto">
          <div className="container py-8 md:py-10">
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Header row */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="font-display text-2xl md:text-3xl font-medium text-navy flex items-center gap-2">
                  <Scale className="h-7 w-7 text-gold" />
                  AI Assistant
                </h2>
                <DocumentUpload
                  onFileSelect={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                />
              </div>
              <p className="text-navy/60 text-sm md:text-base">
                Seleziona una pratica dalla sidebar o carica un documento per iniziare.
              </p>

              {/* Chat card - luxury style */}
              <div className="rounded-2xl border-2 border-gold/30 bg-white shadow-premium overflow-hidden hover:border-gold/50 transition-all hover:shadow-[0_0_20px_rgba(201,162,77,0.15)]">
                <ChatDashboard caseId={undefined} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
