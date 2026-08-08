import { useEffect, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { UsageMetrics } from '../../types';

export const Stats = () => {
  const { data: metrics, get } = useApi<UsageMetrics>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    get('/api/user/usage').finally(() => setIsLoading(false));
  }, [get]);

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="card">
        <p className="text-neutral-600 text-sm mb-1">Pages Translated</p>
        <p className="text-3xl font-bold text-primary-600">{metrics?.pagesTranslated || 0}</p>
      </div>
      <div className="card">
        <p className="text-neutral-600 text-sm mb-1">Files Uploaded</p>
        <p className="text-3xl font-bold text-secondary-600">{metrics?.filesUploaded || 0}</p>
      </div>
      <div className="card">
        <p className="text-neutral-600 text-sm mb-1">Tokens Used</p>
        <p className="text-3xl font-bold text-info">{metrics?.tokensUsed || 0}</p>
      </div>
    </div>
  );
};
