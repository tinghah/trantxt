import toast from 'react-hot-toast';

/**
 * Download a translation file with proper auth headers and format support.
 * @param id Translation ID
 * @param fallbackName Fallback filename if no Content-Disposition header
 * @param format Output format: txt, pdf, docx
 */
export const downloadTranslation = async (
  id: string,
  fallbackName: string,
  format: 'txt' | 'pdf' | 'docx' = 'txt'
): Promise<void> => {
  const token = localStorage.getItem('accessToken');
  try {
    const response = await fetch(`/api/translations/${id}/download?format=${format}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.message || 'Download failed');
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const cd = response.headers.get('Content-Disposition') || '';
    const match = cd.match(/filename="(.+?)"/);
    a.href = url;
    a.download = match ? match[1] : `${fallbackName}-translated.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    toast.success('Download started');
  } catch (error: any) {
    toast.error(error.message || 'Download failed');
  }
};
