import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { formatFileSize, formatDate } from '../../utils/formatters';

interface PreviewData {
  document: {
    id: string;
    filename: string;
    originalFormat: string;
    fileSizeBytes: number;
    pageCount: number;
    status: string;
    uploadDate: string;
    metadata?: Record<string, any>;
  };
  mimeType: string;
  isImage: boolean;
  isText: boolean;
  isPdf: boolean;
  isBrowserRenderable: boolean;
  dataUrl: string | null;
  contentPreview: string | null;
  fileUrl: string;
}

interface Props {
  documentId: string;
  documentName: string;
  onClose: () => void;
}

const formatIcon = (format: string) => {
  const icons: Record<string, string> = {
    pdf: '📕',
    docx: '📘',
    doc: '📘',
    txt: '📝',
    md: '📝',
    csv: '📊',
    json: '📋',
    xml: '📋',
    html: '🌐',
    epub: '📗',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
    bmp: '🖼️',
    tiff: '🖼️',
    webp: '🖼️',
    svg: '🖼️',
  };
  return icons[format] || '📄';
};

export const DocumentPreviewModal = ({ documentId, documentName, onClose }: Props) => {
  const { get } = useApi<PreviewData>();
  const [preview, setPreview] = useState<PreviewData | null>(null);
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

  const handleOpenInBrowser = () => {
    if (!preview?.fileUrl) return;
    const token = localStorage.getItem('accessToken');
    const url = token
      ? `${preview.fileUrl}?token=${token}`
      : preview.fileUrl;
    window.open(url, '_blank');
  };

  const handleDownload = () => {
    if (!preview?.fileUrl) return;
    const token = localStorage.getItem('accessToken');
    const url = token
      ? `${preview.fileUrl}?download=true&token=${token}`
      : `${preview.fileUrl}?download=true`;
    const a = document.createElement('a');
    a.href = url;
    a.download = preview?.document?.filename || documentName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const doc = preview?.document;
  const format = doc?.originalFormat || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl flex-shrink-0">{formatIcon(format)}</span>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-neutral-900 truncate">{documentName}</h3>
              <p className="text-xs text-neutral-500">
                {doc ? `${formatFileSize(doc.fileSizeBytes)} · ${doc.originalFormat.toUpperCase()} · uploaded ${formatDate(doc.uploadDate)}` : ''}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-800 p-2 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-hidden p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-neutral-500">Loading preview...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-red-600 mb-2">{error}</p>
              <p className="text-neutral-500 text-sm">Preview not available for this file type.</p>
            </div>
          ) : (
            <div className="h-full">
              {/* PDF - render in iframe */}
              {preview?.isPdf && (
                <div className="h-[60vh] w-full rounded-lg overflow-hidden border border-neutral-200">
                  <iframe
                    src={preview.dataUrl || `/api/documents/${documentId}/file`}
                    className="w-full h-full"
                    title={documentName}
                  />
                </div>
              )}

              {/* Images - render in img tag */}
              {preview?.isImage && (
                <div className="flex justify-center bg-neutral-100 rounded-lg p-4 overflow-auto max-h-[60vh]">
                  <img
                    src={preview.dataUrl || `/api/documents/${documentId}/file`}
                    alt={documentName}
                    className="max-w-full max-h-[55vh] object-contain"
                  />
                </div>
              )}

              {/* Text/Markdown files - render as text */}
              {preview?.isText && (
                <div className="h-[60vh] overflow-auto bg-neutral-50 rounded-lg border border-neutral-200">
                  <pre className="p-4 text-sm text-neutral-800 font-mono whitespace-pre-wrap leading-relaxed">
                    {preview.contentPreview || 'No text content available.'}
                  </pre>
                </div>
              )}

              {/* DOCX, EPUB, and other non-previewable files */}
              {!preview?.isPdf && !preview?.isImage && !preview?.isText && (
                <div className="text-center py-16 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="text-5xl mb-4">{formatIcon(format)}</div>
                  <p className="text-neutral-700 mb-2 font-medium text-lg">
                    {format.toUpperCase()} Document
                  </p>
                  <p className="text-neutral-500 text-sm mb-6">
                    {formatFileSize(doc?.fileSizeBytes || 0)}
                    {doc?.pageCount ? ` · ${doc.pageCount} page(s)` : ''}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleOpenInBrowser}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg font-semibold text-sm hover:bg-primary-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open in Browser
                    </button>
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-neutral-300 text-neutral-700 rounded-lg font-semibold text-sm hover:bg-neutral-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {preview && !loading && !error && (
          <div className="flex items-center justify-between p-4 border-t border-neutral-200 bg-neutral-50 flex-shrink-0 rounded-b-xl">
            <p className="text-xs text-neutral-500">
              {format.toUpperCase()} · {formatFileSize(doc?.fileSizeBytes || 0)}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleOpenInBrowser}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open in Browser
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
