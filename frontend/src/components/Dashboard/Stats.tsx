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
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-neutral-200 rounded w-24 mb-3"></div>
            <div className="h-8 bg-neutral-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: 'Pages Translated',
      value: metrics?.pagesTranslated || 0,
      icon: '📄',
      color: 'text-primary-600',
      bg: 'bg-primary-50',
    },
    {
      label: 'Files Uploaded',
      value: metrics?.filesUploaded || 0,
      icon: '📁',
      color: 'text-secondary-600',
      bg: 'bg-secondary-50',
    },
    {
      label: 'Tokens Used',
      value: metrics?.tokensUsed || 0,
      icon: '🔤',
      color: 'text-info',
      bg: 'bg-blue-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, i) => (
        <div key={i} className="card flex items-center gap-4">
          <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <span className="text-2xl">{stat.icon}</span>
          </div>
          <div>
            <p className="text-sm text-neutral-500">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value.toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
