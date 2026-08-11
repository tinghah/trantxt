import { Header } from '../../components/Common/Header';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { TranslationDetail as TranslationDetailType } from '../../types';
import { formatDate, formatLanguage } from '../../utils/formatters';
import { DocumentPreviewModal } from '../../components/Common/DocumentPreviewModal';
import { downloadTranslation } from '../../utils/download';
import toast from 'react-hot-toast';

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

export const TranslationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, get } = useApi<any>();
  const translation = data?.translation as TranslationDetailType | undefined;
  const [isLoading, setIsLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'txt' | 'pdf' | 'docx'>('txt');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (id) { setIsLoading(true); get(`/api/translations/${id}`).finally(() => setIsLoading(false)); }
  }, [id, get]);

  const isPending = translation?.status === 'pending' || translation?.status === 'processing';
  useEffect(() => {
    if (!isPending || !id) return;
    const interval = setInterval(() => { get(`/api/translations/${id}`); }, 4000);
    return () => clearInterval(interval);
  }, [isPending, id, get]);

  const handleDownload = async (format?: 'txt' | 'pdf' | 'docx' | 'png') => {
    if (!id) return;
    setDownloading(true);
    if (format === 'png') {
      // Download the translated image directly
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`/api/translations/${id}/image`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
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
        a.download = match ? match[1] : `${translation?.documentName || 'translation'}-translated.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast.success('Download started');
      } catch (error: any) {
        toast.error(error.message || 'Download failed');
      }
    } else {
      await downloadTranslation(id, translation?.documentName || 'translation', format || downloadFormat);
    }
    setDownloading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-500">Loading translation details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!translation) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-neutral-600 text-lg mb-4">Translation not found</p>
            <button onClick={() => navigate('/history')} className="btn-primary px-6 py-2.5">Back to History</button>
          </div>
        </main>
      </div>
    );
  }

  const badge = statusBadge(translation.status);
  const originalText = translation.originalContent?.[translation.sourceLanguage] || '';
  const translatedEntries = Object.entries(translation.translatedContent || {}).filter(([lang]) => !lang.startsWith('_'));

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate('/history')} className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-6 font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to History
        </button>

        {/* Header Card */}
        <div className="card mb-6">
          <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-neutral-900 mb-1">{translation.documentName}</h1>
              <p className="text-neutral-500">{formatDate(translation.createdAt)}</p>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold flex-shrink-0 ${badge.cls}`}>
              <span>{badge.icon}</span>
              {isPending ? (
                <span className="flex items-center gap-1.5">
                  {badge.label}
                  <span className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                </span>
              ) : badge.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-1">Source Language</p>
              <p className="font-medium text-neutral-900">{formatLanguage(translation.sourceLanguage)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-1">Target Languages</p>
              <p className="font-medium text-neutral-900">{translation.targetLanguages.map((l) => formatLanguage(l)).join(', ')}</p>
            </div>
          </div>

          {translation.status === 'completed' && (
            <p className="text-sm text-neutral-500 mb-4">
              {translation.tokensUsed} tokens used · {translation.downloadCount} downloads
            </p>
          )}

          {translation.status === 'error' && translation.errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
              <p className="font-medium mb-1">Translation failed</p>
              <p className="text-sm">{translation.errorMessage}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-neutral-200 items-center">
            {translation.status === 'completed' && (
              <>
                <select
                  value={downloadFormat}
                  onChange={(e) => setDownloadFormat(e.target.value as any)}
                  className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm font-medium bg-white dark:bg-neutral-900"
                >
                  <option value="txt">TXT</option>
                  <option value="pdf">PDF</option>
                  <option value="docx">DOCX</option>
                </select>
                <button onClick={() => handleDownload()} disabled={downloading} className="action-btn-success">
                  {downloading ? (
                    <>
                      <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Download Translated
                    </>
                  )}
                </button>
              </>
            )}
            {translation.documentId && (
              <button onClick={() => setShowPreview(true)} className="action-btn-outline">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                Preview Original
              </button>
            )}
            {isPending && (
              <div className="action-btn bg-yellow-50 border-2 border-yellow-200 text-yellow-700 cursor-default">
                <span className="inline-block h-4 w-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></span>
                Processing...
              </div>
            )}
          </div>
        </div>

        {/* Translation Content */}
        {translation.status === 'completed' ? (
          (translation.translatedContent as any)?._isImage ? (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-neutral-900">Translated Image</h2>
                <button onClick={() => handleDownload('png')} disabled={downloading} className="action-btn-success">
                  {downloading ? (
                    <>
                      <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Download Image
                    </>
                  )}
                </button>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 flex justify-center">
                <img
                  src={`/api/translations/${translation.id}/image?token=${localStorage.getItem('accessToken') || ''}`}
                  alt="Translated"
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </div>
              <p className="text-sm text-neutral-500 mt-3">
                Text was read from the original image, translated, and re-rendered in place.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {translatedEntries.map(([lang, content]) => (
                <div key={lang} className="card">
                  <h2 className="text-lg font-semibold text-neutral-900 mb-4">{formatLanguage(lang)} — Compare</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-2">Original ({formatLanguage(translation.sourceLanguage)})</p>
                      <div className="bg-neutral-50 p-4 rounded-lg text-sm text-neutral-800 max-h-96 overflow-y-auto whitespace-pre-wrap border border-neutral-200">
                        {originalText || '(no extractable text)'}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-2">Translated ({formatLanguage(lang)})</p>
                      <div className="bg-green-50 p-4 rounded-lg text-sm text-neutral-800 max-h-96 overflow-y-auto whitespace-pre-wrap border border-green-200">
                        {typeof content === 'string' ? content : '(no content)'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="card text-center py-12">
            <div className="text-4xl mb-4">{isPending ? '⏳' : '📄'}</div>
            <p className="text-neutral-500 mb-2 text-lg">
              {isPending ? 'Translation is processing...' : 'Waiting to start...'}
            </p>
            <p className="text-neutral-400 text-sm">Results will appear here automatically when ready.</p>
          </div>
        )}
      </main>

      {showPreview && translation.documentId && (
        <DocumentPreviewModal documentId={translation.documentId} documentName={translation.documentName} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
};
