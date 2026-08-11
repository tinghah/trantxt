import { Header } from '../components/Common/Header';
import { useState, useEffect, useCallback } from 'react';
import { useApi } from '../hooks/useApi';
import { Translation } from '../types';
import { formatDate } from '../utils/formatters';
import { Link, useNavigate } from 'react-router-dom';
import { DocumentPreviewModal } from '../components/Common/DocumentPreviewModal';
import { downloadTranslation } from '../utils/download';

const statusBadge = (status: string) => {
  const map: Record<string, { label: string; cls: string; icon: string }> = {
    pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-800 border border-yellow-200', icon: '⏳' },
    processing: { label: 'Processing', cls: 'bg-blue-100 text-blue-800 border border-blue-200', icon: '⏳' },
    completed: { label: 'Completed', cls: 'bg-green-100 text-green-800 border border-green-200', icon: '✅' },
    error: { label: 'Failed', cls: 'bg-red-100 text-red-800 border border-red-200', icon: '❌' },
    failed: { label: 'Failed', cls: 'bg-red-100 text-red-800 border border-red-200', icon: '❌' },
  };
  return map[status] || { label: status, cls: 'bg-neutral-100 text-neutral-700 border border-neutral-200', icon: '•' };
};

export const History = () => {
  const { data: translations, get } = useApi<Translation[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [page] = useState(1);
  const [previewDoc, setPreviewDoc] = useState<{ id: string; name: string } | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadFormats, setDownloadFormats] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const loadData = useCallback(() => {
    return get(`/api/user/history?page=${page}&limit=20`).catch(() => {});
  }, [page, get]);

  useEffect(() => {
    setIsLoading(true);
    loadData().finally(() => setIsLoading(false));
  }, [loadData]);

  const hasPending = translations?.some((t) => t.status === 'pending' || t.status === 'processing');
  useEffect(() => {
    if (!hasPending) return;
    const interval = setInterval(() => { loadData(); }, 5000);
    return () => clearInterval(interval);
  }, [hasPending, loadData]);

  const handleDownload = async (id: string, name: string) => {
    const format = (downloadFormats[id] as any) || 'txt';
    setDownloading(id);
    await downloadTranslation(id, name, format);
    setDownloading(null);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Translation History</h1>
          <p className="text-neutral-600">View all your translations and download results</p>
        </div>

        {isLoading ? (
          <div className="card">
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            </div>
          </div>
        ) : translations && translations.length > 0 ? (
          <div className="space-y-4">
            {translations.map((translation) => {
              const badge = statusBadge(translation.status);
              const isPending = translation.status === 'pending' || translation.status === 'processing';
              return (
                <div key={translation.id} className="card-hover">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="min-w-0 flex-1">
                      <Link to={`/translations/${translation.id}`} className="text-lg font-bold text-neutral-900 hover:text-primary-600 transition-colors block truncate">
                        {translation.documentName}
                      </Link>
                      <p className="text-sm text-neutral-500 mt-1">
                        {translation.sourceLanguage} → {translation.targetLanguages.join(', ')} · {formatDate(translation.createdAt)}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold flex-shrink-0 ${badge.cls}`}>
                      <span>{badge.icon}</span>
                      {isPending ? (
                        <span className="flex items-center gap-1.5">
                          {badge.label}
                          <span className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                        </span>
                      ) : badge.label}
                    </span>
                  </div>

                  {translation.status === 'error' && translation.errorMessage && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-red-700">{translation.errorMessage}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate(`/translations/${translation.id}`)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg font-semibold text-sm hover:bg-primary-700 transition-colors shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      View Details
                    </button>

                    {translation.documentId && (
                      <button
                        onClick={() => setPreviewDoc({ id: translation.documentId, name: translation.documentName })}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-neutral-300 text-neutral-700 rounded-lg font-semibold text-sm hover:bg-neutral-50 hover:border-neutral-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        Preview Original
                      </button>
                    )}

                    {translation.status === 'completed' && (
                      <>
                        <select
                          value={downloadFormats[translation.id] || 'txt'}
                          onChange={(e) => setDownloadFormats((prev) => ({ ...prev, [translation.id]: e.target.value }))}
                          className="px-2 py-2 border border-neutral-300 rounded-lg text-xs font-medium bg-white"
                        >
                          <option value="txt">TXT</option>
                          <option value="pdf">PDF</option>
                          <option value="docx">DOCX</option>
                        </select>
                        <button
                          onClick={() => handleDownload(translation.id, translation.documentName)}
                          disabled={downloading === translation.id}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {downloading === translation.id ? (
                            <>
                              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                              Downloading...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                              Download
                            </>
                          )}
                        </button>
                      </>
                    )}

                    {isPending && (
                      <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-50 border-2 border-yellow-200 text-yellow-700 rounded-lg font-semibold text-sm">
                        <span className="inline-block h-4 w-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></span>
                        Processing...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">📄</div>
            <p className="text-neutral-500 mb-4 text-lg">No translations found yet.</p>
            <Link to="/upload" className="btn-primary px-6 py-2.5">Upload your first document</Link>
          </div>
        )}

        {previewDoc && (
          <DocumentPreviewModal documentId={previewDoc.id} documentName={previewDoc.name} onClose={() => setPreviewDoc(null)} />
        )}
      </main>
    </div>
  );
};
