import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { Translation } from '../../types';
import { formatDate } from '../../utils/formatters';
import { Link } from 'react-router-dom';

const statusBadge = (status: string) => {
  const map: Record<string, { label: string; cls: string; icon: string }> = {
    pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
    processing: { label: 'Processing', cls: 'bg-blue-100 text-blue-800', icon: '⏳' },
    completed: { label: 'Completed', cls: 'bg-green-100 text-green-800', icon: '✅' },
    error: { label: 'Error', cls: 'bg-red-100 text-red-800', icon: '❌' },
    failed: { label: 'Error', cls: 'bg-red-100 text-red-800', icon: '❌' },
  };
  return map[status] || { label: status, cls: 'bg-neutral-100 text-neutral-700', icon: '•' };
};

export const RecentTranslations = () => {
  const { data: translations, get } = useApi<Translation[]>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    get('/api/user/history?limit=5').finally(() => setIsLoading(false));
  }, [get]);

  const hasPending = translations?.some((t) => t.status === 'pending' || t.status === 'processing');
  useEffect(() => {
    if (!hasPending) return;
    const interval = setInterval(() => { get('/api/user/history?limit=5'); }, 5000);
    return () => clearInterval(interval);
  }, [hasPending, get]);

  if (isLoading) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Recent Translations</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
              <div className="space-y-2">
                <div className="h-4 bg-neutral-200 rounded w-32"></div>
                <div className="h-3 bg-neutral-200 rounded w-20"></div>
              </div>
              <div className="h-6 bg-neutral-200 rounded-full w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-neutral-900">Recent Translations</h2>
        {translations && translations.length > 0 && (
          <Link to="/history" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All →</Link>
        )}
      </div>
      <div className="space-y-3">
        {translations && translations.length > 0 ? (
          translations.map((t) => {
            const badge = statusBadge(t.status);
            return (
              <Link
                key={t.id}
                to={`/translations/${t.id}`}
                className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-neutral-900 truncate group-hover:text-primary-600 transition-colors">
                    {t.documentName}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {t.sourceLanguage} → {t.targetLanguages.join(', ')} · {formatDate(t.createdAt)}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ml-3 flex-shrink-0 ${badge.cls}`}>
                  <span>{badge.icon}</span>
                  {(t.status === 'pending' || t.status === 'processing') ? (
                    <span className="flex items-center gap-1">
                      {badge.label}
                      <span className="inline-block h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    </span>
                  ) : badge.label}
                </span>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-8">
            <p className="text-neutral-500 mb-3">No translations yet</p>
            <Link to="/upload" className="btn-primary text-sm">Upload your first document</Link>
          </div>
        )}
      </div>
    </div>
  );
};
