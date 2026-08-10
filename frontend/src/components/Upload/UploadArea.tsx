import { useCallback, useState } from 'react';

interface UploadAreaProps {
  onFilesSelected: (files: File[]) => void;
  isLoading?: boolean;
  maxFileSize?: number;
}

export const UploadArea = ({ onFilesSelected, isLoading = false, maxFileSize = 50 }: UploadAreaProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      onFilesSelected(files);
    },
    [onFilesSelected]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      onFilesSelected(files);
    },
    [onFilesSelected]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
        isDragging
          ? 'border-primary-600 bg-primary-50'
          : 'border-neutral-300 bg-neutral-50 hover:border-primary-600'
      }`}
    >
      <input
        type="file"
        id="file-input"
        onChange={handleFileInput}
        multiple
        disabled={isLoading}
        className="hidden"
        accept=".pdf,.docx,.jpg,.jpeg,.png,.gif,.bmp,.tiff"
      />
      <label htmlFor="file-input" className="cursor-pointer">
        <div className="text-4xl mb-4">📄</div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">Drop your files here</h3>
        <p className="text-neutral-600 mb-4">or click to browse</p>
        <p className="text-sm text-neutral-500">
          Supported: PDF, DOCX, DOC, TXT, MD, CSV, EPUB, JPG, PNG, GIF, BMP, TIFF, WebP (max {maxFileSize}MB each)
        </p>
      </label>
    </div>
  );
};
