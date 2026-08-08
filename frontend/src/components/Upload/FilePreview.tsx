import { formatFileSize } from '../../utils/formatters';

interface FilePreviewProps {
  files: File[];
  onRemove: (index: number) => void;
}

export const FilePreview = ({ files, onRemove }: FilePreviewProps) => {
  if (files.length === 0) return null;

  return (
    <div className="space-y-2 mt-6">
      <h3 className="font-medium text-neutral-900">Selected Files:</h3>
      <div className="space-y-2">
        {files.map((file, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200">
            <div className="flex items-center gap-3">
              <span className="text-xl">📎</span>
              <div>
                <p className="text-sm font-medium text-neutral-900">{file.name}</p>
                <p className="text-xs text-neutral-500">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button
              onClick={() => onRemove(index)}
              className="text-error hover:bg-error/10 p-2 rounded"
              type="button"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
