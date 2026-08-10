import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { DocumentPreview } from '../../types';
import { formatFileSize, formatDate } from '../../utils/formatters';

interface Props {
  documentId: string;
  documentName: string;
  onClose: () => void;
}

export const DocumentPreviewModal = ({ documentId, documentName, onClose }: Props) => {
  const { get } = useApi<DocumentPreview>();
  const [preview, setPreview] = useState<DocumentPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    get(`/api/documents/${documentId}/preview`)
      .then((res: any) => {
        setPreview(res ?? null);
        setLoading(false);
      })
      .catch((err: any) => {
        setError(err.response?.data?.message || 'Failed to load preview');
        setLoading(false);
      });
  }, [documentId, get]);

  const doc = preview?.document;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <div>
            <h3 className="text-lg font-bold text-neutral-900">{documentName}</h3>
            <p className="text-xs text-neutral-500">
              {doc ? `${formatFileSize(doc.fileSizeBytes)} · uploaded ${formatDate(doc.uploadDate)} · ${doc.pageCount} page(s)` : ''}
            </p>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-800 p-2">✕</button>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="animate-pulse text-center py-16 text-neutral-500">Loading preview...</div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-error mb-2">{error}</p>
              <p className="text-neutral-500 text-sm">
                The file preview is not available. Download the file directly from the translation view instead.
              </p>
            </div>
          ) : preview?.isImage && preview.dataUrl ? (
            <div className="flex justify-center bg-neutral-100 rounded-lg p-4">
              <img src={preview.dataUrl} alt={documentName} className="max-w-full max-h-[60vh] object-contain" />
            </div>
          ) : preview?.mimeType === 'application/pdf' ? (
            <div className="text-center py-10 bg-neutral-100 rounded-lg">
              <p className="text-neutral-700 mb-2 font-medium">PDF Document</p>
              <p className="text-neutral-500 text-sm mb-4">
                {formatFileSize(doc?.fileSizeBytes || 0)} · {doc?.pageCount || 1} page(s)
              </p>
              <button
                onClick={() => {
                  get(`/api/documents/${documentId}/preview`).then((res: any) => {
                    if (res?.dataUrl) {
                      window.open(res.dataUrl, '_blank');
                    }
                  });
                }}
                className="btn-primary text-sm"
              >
                Open PDF
              </button>
            </div>
          ) : (
            <div className="bg-neutral-50 rounded-lg p-4 max-h-[50vh] overflow-y-auto">
              <p className="text-xs text-neutral-500 mb-2">Text preview:</p>
              <pre className="whitespace-pre-wrap text-sm text-neutral-800 font-mono">
                {preview?.contentPreview || 'No text content available for preview.'}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
