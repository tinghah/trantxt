import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { Document } from '../../types';
import { formatDate } from '../../utils/formatters';

export const RecentTranslations = () => {
  const { data: documents, get } = useApi<Document[]>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    get('/api/documents?limit=5').finally(() => setIsLoading(false));
  }, [get]);

  if (isLoading) {
    return <div className="animate-pulse space-y-2">Loading...</div>;
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">Recent Translations</h2>
      <div className="space-y-3">
        {documents && documents.length > 0 ? (
          documents.map((doc) => (
            <div key={doc.id} className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
              <div>
                <p className="font-medium text-neutral-900">{doc.filename}</p>
                <p className="text-sm text-neutral-500">{formatDate(doc.uploadDate)}</p>
              </div>
              <span className="px-3 py-1 bg-success/10 text-success text-sm rounded-full">
                {doc.status}
              </span>
            </div>
          ))
        ) : (
          <p className="text-neutral-500 text-sm">No translations yet</p>
        )}
      </div>
    </div>
  );
};
