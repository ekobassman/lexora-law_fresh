import { useParams, Link } from 'react-router-dom';
import { ChatEdit } from '@/components/chat/ChatEdit';
import { DocumentViewer } from '@/components/documents/DocumentViewer';
import { DocumentList } from '@/components/documents/DocumentList';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { useCaseDetail } from '@/hooks/useCaseDetail';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const { caseData, documents, loading, error } = useCaseDetail(id);

  const handleFileSelect = (file: File) => {
    console.log('Upload per caso:', id, file.name);
    alert(`File "${file.name}". Integrazione OCR in arrivo.`);
  };

  if (loading) {
    return (
      <main className="container py-12 px-4">
        <p className="text-muted-foreground">Caricamento pratica...</p>
      </main>
    );
  }

  if (error || !caseData) {
    return (
      <main className="container py-12 px-4">
        <p className="text-destructive mb-4">{error ?? 'Pratica non trovata'}</p>
        <Link to="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna al Dashboard
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)]">
      <div className="w-64 shrink-0 border-r border-navy-light p-4">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <h3 className="font-semibold mb-3">Documenti</h3>
        <DocumentUpload onFileSelect={handleFileSelect} />
        <DocumentList documents={documents} />
      </div>
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-semibold mb-6">{caseData.title}</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-medium mb-3">Bozza</h2>
            <DocumentViewer
              content={caseData.draft_response ?? caseData.letter_text ?? ''}
            />
          </div>
          <div>
            <h2 className="text-lg font-medium mb-3">Modifica con AI</h2>
            <ChatEdit caseId={caseData.id} draftResponse={caseData.draft_response} />
          </div>
        </div>
      </div>
    </main>
  );
}
