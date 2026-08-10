import { Header } from '../components/Common/Header';
import { UploadArea } from '../components/Upload/UploadArea';
import { FilePreview } from '../components/Upload/FilePreview';
import { useState, useEffect } from 'react';
import { useUpload } from '../hooks/useUpload';
import { useApi } from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Language, ProvidersResponse } from '../types';

export const Upload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [targetLanguage, setTargetLanguage] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [outputFormat, setOutputFormat] = useState('pdf');
  const [provider, setProvider] = useState('deepl');
  const { upload, error: uploadError } = useUpload();
  const { get, post } = useApi();
  const [isUploading, setIsUploading] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [providersInfo, setProvidersInfo] = useState<ProvidersResponse | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    get('/api/config/languages').then((res: any) => {
      const list = res ?? [];
      setLanguages(list);
      if (list.length > 0) {
        setTargetLanguage((prev) => prev || list[0].code);
      }
    });
    get('/api/config/providers').then((res: any) => {
      setProvidersInfo(res ?? null);
      const configured = res?.providers?.find((p: any) => p.serverKeyConfigured);
      if (configured) {
        setProvider(configured.id);
      }
    });
  }, [get]);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles([...files, ...selectedFiles]);
  };

  const handleRemove = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
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

      // Create translation requests for each uploaded document
      const docIds = results.map((r: any) => r.id || r.documentId).filter(Boolean);
      if (docIds.length > 0) {
        try {
          toast.loading('Translating your document...', { id: 'translating' });
          await post('/api/translations', {
            documentId: docIds[0],
            targetLanguages: [targetLanguage],
            outputFormat,
            provider,
            sourceLanguage,
          });
          toast.success('Translation completed', { id: 'translating' });
        } catch (err: any) {
          toast.error(err.response?.data?.message || 'Could not create translation request', { id: 'translating' });
        }
      }

      setFiles([]);
      setTimeout(() => navigate('/history'), 1500);
    } catch (error) {
      toast.error(uploadError || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Upload Document</h1>
          <p className="text-neutral-600">Upload your document for translation</p>
        </div>

        <div className="card mb-8">
          <UploadArea onFilesSelected={handleFilesSelected} isLoading={isUploading} />
          <FilePreview files={files} onRemove={handleRemove} />

          {files.length > 0 && (
            <div className="mt-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Source Language</label>
                  <select value={sourceLanguage} onChange={(e) => setSourceLanguage(e.target.value)} className="input-base">
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name} ({lang.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Target Language</label>
                  <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)} className="input-base">
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name} ({lang.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Translation Provider</label>
                <select value={provider} onChange={(e) => setProvider(e.target.value)} className="input-base">
                  <option value="deepl">DeepL</option>
                  <option value="google">Google Translate</option>
                  <option value="azure">Azure Translator</option>
                </select>
                <p className="text-xs text-neutral-500 mt-1">
                  {providersInfo?.freeAvailable
                    ? 'Server keys are available — using them is free. Add your own key in Settings to use it instead.'
                    : 'No server keys configured. Add your own key in Settings, or ask an admin to configure one.'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Output Format</label>
                <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} className="input-base">
                  <option value="pdf">PDF</option>
                  <option value="docx">DOCX</option>
                  <option value="txt">Text</option>
                </select>
              </div>

              <button onClick={handleUpload} disabled={isUploading} className="btn-primary w-full">
                {isUploading ? 'Uploading & Translating...' : 'Upload & Translate'}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
