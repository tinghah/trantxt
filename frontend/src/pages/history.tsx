import { Header } from '../components/Common/Header';
import { useState, useEffect, useCallback } from 'react';
import { useApi } from '../hooks/useApi';
import { Translation } from '../types';
import { formatDate } from '../utils/formatters';
import { Link } from 'react-router-dom';
import { DocumentPreviewModal } from '../components/Common/DocumentPreviewModal';
import toast from 'react-hot-toast';

const statusBadge = (status: string) => {
  const map: Record<string, { label: string; cls: string; icon: string }> = {
    pending: { label: 'Processing', cls: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
    processing: { label: 'Processing', cls: 'bg-blue-100 text-blue-800', icon: '⏳' },
    completed: { label: 'Completed', cls: 'bg-green-100 text-green-800', icon: '✅' },
    error: { label: 'Error', cls: 'bg-red-100 text-red-800', icon: '❌' },
    failed: { label: 'Error', cls: 'bg-red-100 text-red-800', icon: '❌' },
  };
  return map[status] || { label: status, cls: 'bg-neutral-100 text-neutral-700', icon: '•' };
};

export const History = () => {
  const { data: translations, get } = useApi<Translation[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [page] = useState(1);
  const [previewDoc, setPreviewDoc] = useState<{ id: string; name: string } | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const loadData = useCallback(() => {
    return get(`/api/user/history?page=${page}&limit=20`).catch(() => {});
  }, [page, get]);

  useEffect(() => {
    setIsLoading(true);
    loadData().finally(() => setIsLoading(false));
  }, [loadData]);

  // Auto-refresh every 5s while there are pending translations
  const hasPending = translations?.some((t) => t.status === 'pending' || t.status === 'processing');
  useEffect(() => {
    if (!hasPending) return;
    const interval = setInterval(() => {
      loadData();
    }, 5000);
    return () => clearInterval(interval);
  }, [hasPending, loadData]);

  const handleDownload = async (id: string) => {
    setDownloading(id);
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
      setDownloading(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Translation History</h1>
          <p className="text-neutral-600">View all your translations and download results</p>
        </div>

        <div className="card">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900"></div>
            </div>
          ) : translations && translations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-neutral-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Document</th>
                    <th className="text-left py-3 px-4 font-semibold">Languages</th>
                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Tokens</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {translations.map((translation) => {
                    const badge = statusBadge(translation.status);
                    return (
                      <tr key={translation.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-medium text-neutral-900">{translation.documentName}</p>
                          <p className="text-xs text-neutral-500">{translation.documentFormat || 'document'}</p>
                        </td>
                        <td className="py-3 px-4">
                          {translation.sourceLanguage} → {translation.targetLanguages.join(', ')}
                        </td>
                        <td className="py-3 px-4">{formatDate(translation.createdAt)}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.cls}`}>
                            <span>{badge.icon}</span>
                            {translation.status === 'pending' || translation.status === 'processing' ? (
                              <span className="flex items-center gap-1">
                                {badge.label}
                                <span className="inline-block h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin ml-0.5"></span>
                              </span>
                            ) : (
                              badge.label
                            )}
                          </span>
                          {translation.status === 'error' && translation.errorMessage && (
                            <p className="text-xs text-red-600 mt-1 max-w-[220px] truncate" title={translation.errorMessage}>
                              {translation.errorMessage}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4">{translation.tokensUsed}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Link to={`/translations/${translation.id}`} className="text-blue-700 hover:text-blue-900 font-medium">
                              View
                            </Link>
                            {translation.documentId && (
                              <button
                                onClick={() => setPreviewDoc({ id: translation.documentId, name: translation.documentName })}
                                className="text-blue-700 hover:text-blue-900 font-medium"
                              >
                                Preview
                              </button>
                            )}
                            {translation.status === 'completed' && (
                              <button
                                onClick={() => handleDownload(translation.id)}
                                disabled={downloading === translation.id}
                                className="text-green-700 hover:text-green-900 font-medium disabled:opacity-50"
                              >
                                {downloading === translation.id ? 'Downloading...' : 'Download'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-neutral-500 mb-4">No translations found yet.</p>
              <Link to="/upload" className="btn-primary">Upload a document</Link>
            </div>
          )}
        </div>

        {previewDoc && (
          <DocumentPreviewModal
            documentId={previewDoc.id}
            documentName={previewDoc.name}
            onClose={() => setPreviewDoc(null)}
          />
        )}
      </main>
    </div>
  );
};
