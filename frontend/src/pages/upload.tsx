import { Header } from '../components/Common/Header';
import { UploadArea } from '../components/Upload/UploadArea';
import { FilePreview } from '../components/Upload/FilePreview';
import { useState } from 'react';
import { useUpload } from '../hooks/useUpload';
import { useApi } from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const Upload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [outputFormat, setOutputFormat] = useState('pdf');
  const { upload, error: uploadError } = useUpload();
  const { post } = useApi();
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

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
          await post('/api/translations', {
            documentId: docIds[0],
            targetLanguages: [targetLanguage],
            outputFormat,
          });
          toast.success('Translation request created');
        } catch (err: any) {
          toast.error(err.response?.data?.message || 'Could not create translation request');
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
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Target Language</label>
                <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)} className="input-base">
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                  <option value="pt">Portuguese</option>
                  <option value="ja">Japanese</option>
                  <option value="zh">Chinese</option>
                </select>
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
