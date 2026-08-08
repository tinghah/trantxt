import { Header } from '../components/Common/Header';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { TranslationDetail } from '../types';
import { formatDate, getStatusColor } from '../utils/formatters';
import toast from 'react-hot-toast';

export const TranslationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: translation, get } = useApi<TranslationDetail>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      get(`/api/translations/${id}`).finally(() => setIsLoading(false));
    }
  }, [id, get]);

  const handleDownload = async () => {
    if (!id) return;
    try {
      const response = await fetch(`/api/translations/${id}/download`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `translation-${id}.pdf`;
      a.click();
      toast.success('Download started');
    } catch (error) {
      toast.error('Download failed');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8">Loading...</main>
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

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate('/history')} className="text-primary-600 hover:text-primary-700 mb-6">
          ← Back to History
        </button>

        <div className="card mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">{translation.documentName}</h1>
              <p className="text-neutral-600">{formatDate(translation.createdAt)}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(translation.status)}`}>
              {translation.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8 pb-8 border-b border-neutral-200">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Source Language</p>
              <p className="font-medium text-neutral-900">{translation.sourceLanguage}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 mb-1">Target Languages</p>
              <p className="font-medium text-neutral-900">{translation.targetLanguages.join(', ')}</p>
            </div>
          </div>

          {translation.status === 'completed' && (
            <button onClick={handleDownload} className="btn-primary">
              Download Translation
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Original Content</h2>
            <div className="bg-neutral-50 p-4 rounded text-sm text-neutral-700 max-h-96 overflow-y-auto">
              {translation.originalContent}
            </div>
          </div>

          {translation.translatedContent && (
            <div className="card">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Translated Content</h2>
              <div className="bg-neutral-50 p-4 rounded text-sm text-neutral-700 max-h-96 overflow-y-auto">
                {Object.entries(translation.translatedContent).map(([lang, content]) => (
                  <div key={lang} className="mb-4">
                    <p className="font-medium text-neutral-900 mb-2">{lang}</p>
                    <p>{content as string}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
