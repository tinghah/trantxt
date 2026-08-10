import { Header } from '../components/Common/Header';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useUpload } from '../hooks/useUpload';
import { useApi } from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Language, ProvidersResponse } from '../types';
import { formatFileSize } from '../utils/formatters';

const fileIcon = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return '📕';
  if (ext === 'docx' || ext === 'doc') return '📘';
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'].includes(ext || '')) return '🖼️';
  return '📄';
};

export const Upload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [targetLanguage, setTargetLanguage] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [outputFormat, setOutputFormat] = useState('pdf');
  const [provider, setProvider] = useState('deepl');
  const { uploads, upload, error: uploadError, clearProgress } = useUpload();
  const { get, post } = useApi();
  const [isUploading, setIsUploading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [providersInfo, setProvidersInfo] = useState<ProvidersResponse | null>(null);
  const [completedTranslationId, setCompletedTranslationId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    get('/api/config/languages').then((res: any) => {
      const list = res ?? [];
      setLanguages(list);
      if (list.length > 0) setTargetLanguage((prev) => prev || list[0].code);
    });
    get('/api/config/providers').then((res: any) => {
      setProvidersInfo(res ?? null);
      const configured = res?.providers?.find((p: any) => p.serverKeyConfigured);
      if (configured) setProvider(configured.id);
    });
  }, [get]);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    const valid: File[] = [];
    const maxSize = 50 * 1024 * 1024;
    for (const f of selectedFiles) {
      if (f.size > maxSize) {
        toast.error(`${f.name} exceeds 50MB limit`);
        continue;
      }
      valid.push(f);
    }
    if (valid.length > 0) {
      setFiles((prev) => [...prev, ...valid]);
      toast.success(`${valid.length} file(s) added`);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    handleFilesSelected(dropped);
  }, [handleFilesSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    handleFilesSelected(selected);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [handleFilesSelected]);

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one file');
      return;
    }
    try {
      setIsUploading(true);
      const results = await upload(files, { targetLanguage, outputFormat });
      if (results.length === 0) {
        toast.error(uploadError || 'Upload failed');
        return;
      }
      toast.success(`${results.length} file(s) uploaded successfully`);
      const docIds = results.map((r: any) => r.id || r.documentId).filter(Boolean);
      if (docIds.length > 0) {
        try {
          setIsTranslating(true);
          toast.loading('Translating your document...', { id: 'translating' });
          const translationResult = await post('/api/translations', {
            documentId: docIds[0],
            targetLanguages: [targetLanguage],
            outputFormat,
            provider,
            sourceLanguage,
          });
          const translationId = (translationResult as any)?.id;
          toast.success('Translation completed!', { id: 'translating' });
          if (translationId) {
            setCompletedTranslationId(translationId);
          }
        } catch (err: any) {
          toast.error(err.response?.data?.message || 'Could not create translation request', { id: 'translating' });
        }
      }
      setFiles([]);
      clearProgress();
    } catch (error) {
      toast.error(uploadError || 'Upload failed');
    } finally {
      setIsUploading(false);
      setIsTranslating(false);
    }
  };

  const uploadEntries = Object.values(uploads);
  const overallProgress = uploadEntries.length > 0
    ? Math.round(uploadEntries.reduce((sum, u) => sum + u.progress, 0) / uploadEntries.length)
    : 0;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Upload Document</h1>
          <p className="text-neutral-600">Upload your document for translation</p>
        </div>

        {completedTranslationId ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Translation Complete!</h2>
            <p className="text-neutral-600 mb-6">Your document has been translated successfully.</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => navigate(`/translations/${completedTranslationId}`)} className="btn-primary px-6 py-3">
                View Translated Document
              </button>
              <button onClick={() => { setCompletedTranslationId(null); clearProgress(); }} className="btn-outline px-6 py-3">
                Upload Another
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-primary-600 bg-primary-50 scale-[1.01]'
                  : 'border-neutral-300 bg-white hover:border-primary-400 hover:bg-primary-50/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInput}
                multiple
                disabled={isUploading}
                className="hidden"
                accept=".pdf,.docx,.jpg,.jpeg,.png,.gif,.bmp,.tiff"
              />
              <div className="text-5xl mb-4">{isDragging ? '📥' : '📄'}</div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                {isDragging ? 'Drop your files here' : 'Drop your files here'}
              </h3>
              <p className="text-neutral-500 mb-4">or click to browse</p>
              <p className="text-sm text-neutral-400">
                Supported: PDF, DOCX, JPG, PNG, GIF, BMP, TIFF (max 50MB each)
              </p>
            </div>

            {/* File Preview Cards */}
            {files.length > 0 && (
              <div ref={previewContainerRef} className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-neutral-900">
                    Selected Files ({files.length})
                  </h3>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    + Add More Files
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center gap-3 p-4 bg-white border border-neutral-200 rounded-xl hover:border-neutral-300 transition-colors"
                    >
                      <span className="text-3xl flex-shrink-0">{fileIcon(file.name)}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-neutral-900 truncate">{file.name}</p>
                        <p className="text-xs text-neutral-500">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        onClick={() => handleRemove(index)}
                        className="text-neutral-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors flex-shrink-0"
                        type="button"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {uploadEntries.length > 0 && (
              <div className="mt-6 card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-neutral-900">Upload Progress</h3>
                  <span className="text-sm font-bold text-primary-600">{overallProgress}%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-primary-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${overallProgress}%` }}
                  ></div>
                </div>
                {uploadEntries.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between text-sm text-neutral-600 py-1">
                    <span className="truncate">{entry.fileName}</span>
                    <span className="flex-shrink-0 ml-2">
                      {entry.status === 'completed' && <span className="text-green-600">✓ Done</span>}
                      {entry.status === 'failed' && <span className="text-red-600">✕ Failed</span>}
                      {entry.status === 'uploading' && <span>{entry.progress}%</span>}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Translating Animation */}
            {isTranslating && (
              <div className="mt-6 card border-primary-200 bg-primary-50">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-2xl">🌐</span>
                    </div>
                    <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-primary-400 border-t-transparent animate-spin"></div>
                  </div>
                  <div>
                    <p className="font-semibold text-primary-900">Translating your document...</p>
                    <p className="text-sm text-primary-700">This may take a moment depending on file size.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Settings */}
            {files.length > 0 && !isUploading && !isTranslating && (
              <div className="mt-6 card space-y-5">
                <h3 className="font-semibold text-neutral-900">Translation Settings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Source Language</label>
                    <select value={sourceLanguage} onChange={(e) => setSourceLanguage(e.target.value)} className="input-base">
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>{lang.name} ({lang.code})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Target Language</label>
                    <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)} className="input-base">
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>{lang.name} ({lang.code})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Translation Provider</label>
                    <select value={provider} onChange={(e) => setProvider(e.target.value)} className="input-base">
                      <option value="deepl">DeepL</option>
                      <option value="google">Google Translate</option>
                      <option value="azure">Azure Translator</option>
                    </select>
                    <p className="text-xs text-neutral-400 mt-1">
                      {providersInfo?.freeAvailable
                        ? 'Server keys available — free to use.'
                        : 'Add your own API key in Settings.'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Output Format</label>
                    <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} className="input-base">
                      <option value="pdf">PDF</option>
                      <option value="docx">DOCX</option>
                      <option value="txt">Text</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={isUploading || isTranslating}
                  className="btn-primary w-full py-3 text-lg font-semibold"
                >
                  {isUploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Uploading...
                    </span>
                  ) : isTranslating ? (
                    'Translating...'
                  ) : (
                    `Upload & Translate (${files.length} file${files.length > 1 ? 's' : ''})`
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
