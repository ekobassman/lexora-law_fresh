import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatDashboard } from '@/components/chat/ChatDashboard';
import { Sidebar } from '@/components/layout/Sidebar';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { useCases } from '@/hooks/useCases';

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
    // TODO: integrazione process-ocr Edge Function
    console.log('Upload file:', file.name, file.size);
    alert(`File "${file.name}" selezionato. Integrazione OCR in arrivo.`);
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar
        cases={cases}
        loading={loading}
        error={error}
        onNewCase={handleNewCase}
        creating={creating}
      />
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex flex-col gap-6 max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">AI Assistant</h2>
            <DocumentUpload
              onFileSelect={handleFileSelect}
              accept=".pdf,.jpg,.jpeg,.png,.webp"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Seleziona una pratica dalla sidebar o carica un documento per iniziare.
          </p>
          <ChatDashboard caseId={undefined} />
        </div>
      </div>
    </main>
  );
}
