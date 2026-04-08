import React from 'react';
import { X, ZoomIn, ZoomOut, Download } from 'lucide-react';

const ImageViewer = ({ url, onClose }) => {
  const [zoom, setZoom] = React.useState(1);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));

  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = url.split('/').pop() || 'screenshot.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Screenshot</h3>
          <div className="flex items-center gap-2">
            <button onClick={handleZoomOut} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              <ZoomOut size={18} />
            </button>
            <span className="text-sm text-gray-500">{Math.round(zoom * 100)}%</span>
            <button onClick={handleZoomIn} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              <ZoomIn size={18} />
            </button>
            <button onClick={handleDownload} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              <Download size={18} />
            </button>
            <button onClick={onClose} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              <X size={20} />
            </button>
          </div>
        </div>
        {/* Image */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-80px)] flex justify-center bg-gray-100 dark:bg-gray-900">
          <img 
            src={url} 
            alt="Payment Screenshot" 
            style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s' }}
            className="rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;