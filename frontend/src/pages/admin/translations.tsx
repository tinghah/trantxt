import { Header } from '../../components/Common/Header';
import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { TranslationApproval } from '../../types';
import toast from 'react-hot-toast';

export const AdminTranslations = () => {
  const { data: translations, get, put } = useApi<TranslationApproval[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    setIsLoading(true);
    const endpoint = filter === 'pending' ? '/api/admin/translations/pending' : '/api/admin/translations';
    get(endpoint).finally(() => setIsLoading(false));
  }, [filter, get]);

  const handleApprove = async (id: string) => {
    try {
      await put(`/api/admin/translations/${id}/approve`, {});
      toast.success('Translation approved');
      get(filter === 'pending' ? '/api/admin/translations/pending' : '/api/admin/translations');
    } catch (error) {
      toast.error('Failed to approve translation');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await put(`/api/admin/translations/${id}/reject`, {});
      toast.success('Translation rejected');
      get(filter === 'pending' ? '/api/admin/translations/pending' : '/api/admin/translations');
    } catch (error) {
      toast.error('Failed to reject translation');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-neutral-900">Translation Approvals</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'pending' ? 'btn-primary' : 'btn-ghost'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'all' ? 'btn-primary' : 'btn-ghost'
              }`}
            >
              All
            </button>
          </div>
        </div>

        <div className="card">
          {isLoading ? (
            <div className="animate-pulse">Loading...</div>
          ) : translations && translations.length > 0 ? (
            <div className="space-y-4">
              {translations.map((translation) => (
                <div key={translation.id} className="border border-neutral-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-neutral-900">{translation.documentName}</h3>
                      <p className="text-sm text-neutral-600">{translation.userName}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      translation.status === 'pending' ? 'bg-warning/10 text-warning' :
                      translation.status === 'approved' ? 'bg-success/10 text-success' :
                      'bg-error/10 text-error'
                    }`}>
                      {translation.status}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 mb-4">
                    {translation.sourceLanguage} → {translation.targetLanguages.join(', ')}
                  </p>
                  {translation.status === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(translation.id)}
                        className="btn-primary flex-1"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(translation.id)}
                        className="btn-outline flex-1"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500">No translations found</p>
          )}
        </div>
      </main>
    </div>
  );
};
