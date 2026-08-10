import { Header } from '../../components/Common/Header';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { TranslationDetail as TranslationDetailType } from '../../types';
import { formatDate, formatLanguage } from '../../utils/formatters';
import { DocumentPreviewModal } from '../../components/Common/DocumentPreviewModal';
import toast from 'react-hot-toast';

const statusBadge = (status: string) => {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: 'Processing', cls: 'bg-yellow-100 text-yellow-800' },
    processing: { label: 'Processing', cls: 'bg-blue-100 text-blue-800' },
    completed: { label: 'Completed', cls: 'bg-green-100 text-green-800' },
    error: { label: 'Error', cls: 'bg-red-100 text-red-800' },
    failed: { label: 'Error', cls: 'bg-red-100 text-red-800' },
  };
  return map[status] || { label: status, cls: 'bg-neutral-100 text-neutral-700' };
};

export const TranslationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: translation, get } = useApi<TranslationDetailType>();
  const [isLoading, setIsLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      get(`/api/translations/${id}`).finally(() => setIsLoading(false));
    }
  }, [id, get]);

  // Poll while pending
  const isPending = translation?.status === 'pending' || translation?.status === 'processing';
  useEffect(() => {
    if (!isPending || !id) return;
    const interval = setInterval(() => {
      get(`/api/translations/${id}`);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPending, id, get]);

  const handleDownload = async () => {
    if (!id) return;
    setDownloading(true);
    try {
      const response = await fetch(`/api/translations/${id}/download`);
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'Download failed');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const cd = response.headers.get('Content-Disposition') || '';
      const match = cd.match(/filename="(.+?)"/);
      a.href = url;
      a.download = match ? match[1] : `translation-${id}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (error: any) {
      toast.error(error.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900"></div>
        </main>
      </div>
    );
  }

  if (!translation) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="card text-center">
            <p className="text-neutral-600 mb-4">Translation not found</p>
            <button onClick={() => navigate('/history')} className="btn-primary">
              Back to History
            </button>
          </div>
        </main>
      </div>
    );
  }

  const badge = statusBadge(translation.status);
  const originalText = translation.originalContent?.[translation.sourceLanguage] || '';
  const translatedEntries = Object.entries(translation.translatedContent || {}).filter(
    ([lang]) => !lang.startsWith('_')
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate('/history')} className="text-blue-700 hover:text-blue-900 mb-6">
          ← Back to History
        </button>

        <div className="card mb-8">
          <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">{translation.documentName}</h1>
              <p className="text-neutral-600">{formatDate(translation.createdAt)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${badge.cls}`}>
                {isPending && (
                  <span className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                )}
                {badge.label}
              </span>
              {translation.status === 'completed' && (
                <button onClick={handleDownload} disabled={downloading} className="btn-primary">
                  {downloading ? 'Downloading...' : '⬇ Download Result'}
                </button>
              )}
              {translation.documentId && (
                <button onClick={() => setShowPreview(true)} className="btn-outline">
                  Preview Original
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Source Language</p>
              <p className="font-medium text-neutral-900">{formatLanguage(translation.sourceLanguage)}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 mb-1">Target Languages</p>
              <p className="font-medium text-neutral-900">
                {translation.targetLanguages.map((l) => formatLanguage(l)).join(', ')}
              </p>
            </div>
          </div>

          {translation.status === 'completed' && (
            <p className="text-sm text-neutral-500 mb-4">
              {translation.tokensUsed} tokens used · {translation.downloadCount} downloads
            </p>
          )}

          {translation.status === 'error' && translation.errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              <p className="font-medium mb-1">Translation failed</p>
              <p className="text-sm">{translation.errorMessage}</p>
            </div>
          )}
        </div>

        {translation.status === 'completed' ? (
          <div className="space-y-6">
            {translatedEntries.map(([lang, content]) => (
              <div key={lang} className="card">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                  {formatLanguage(lang)} — Compare
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-2">
                      Original ({formatLanguage(translation.sourceLanguage)})
                    </p>
                    <div className="bg-neutral-50 p-4 rounded-lg text-sm text-neutral-800 max-h-96 overflow-y-auto whitespace-pre-wrap">
                      {originalText || '(no extractable text)'}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-2">
                      Translated ({formatLanguage(lang)})
                    </p>
                    <div className="bg-green-50 p-4 rounded-lg text-sm text-neutral-800 max-h-96 overflow-y-auto whitespace-pre-wrap">
                      {typeof content === 'string' ? content : '(no content)'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-neutral-500 mb-2">This translation is still {isPending ? 'processing' : 'pending'}.</p>
            <p className="text-neutral-400 text-sm">Results will appear here automatically when ready.</p>
          </div>
        )}
      </main>

      {showPreview && translation.documentId && (
        <DocumentPreviewModal
          documentId={translation.documentId}
          documentName={translation.documentName}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};
