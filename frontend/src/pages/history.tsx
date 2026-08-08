import { Header } from '../components/Common/Header';
import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { Translation } from '../types';
import { formatDate, getStatusColor } from '../utils/formatters';
import { Link } from 'react-router-dom';

export const History = () => {
  const { data: translations, get } = useApi<Translation[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setIsLoading(true);
    get(`/api/user/history?page=${page}&limit=20`).finally(() => setIsLoading(false));
  }, [page, get]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Translation History</h1>
          <p className="text-neutral-600">View all your translations</p>
        </div>

        <div className="card">
          {isLoading ? (
            <div className="animate-pulse">Loading...</div>
          ) : translations && translations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-neutral-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Document</th>
                    <th className="text-left py-3 px-4 font-semibold">Languages</th>
                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {translations.map((translation) => (
                    <tr key={translation.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4">{translation.documentName}</td>
                      <td className="py-3 px-4">{translation.sourceLanguage} → {translation.targetLanguages.join(', ')}</td>
                      <td className="py-3 px-4">{formatDate(translation.createdAt)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(translation.status)}`}>
                          {translation.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Link to={`/translations/${translation.id}`} className="text-primary-600 hover:text-primary-700 font-medium">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-neutral-500">No translations found</p>
          )}
        </div>
      </main>
    </div>
  );
};
