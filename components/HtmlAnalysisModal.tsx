import React, { useState } from 'react';

interface HtmlAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyze: (html: string) => void;
}

export const HtmlAnalysisModal: React.FC<HtmlAnalysisModalProps> = ({ isOpen, onClose, onAnalyze }) => {
  const [html, setHtml] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (html.trim()) {
      onAnalyze(html);
      setHtml('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 transition-all">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/50 rounded-t-xl">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
            Phân tích HTML & Tạo XPath
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 flex-1 flex flex-col overflow-hidden">
          <p className="text-sm text-slate-400 mb-3">
            Dán mã nguồn HTML (Copy element từ F12) vào bên dưới. Trợ lý sẽ tự động phân tích và gợi ý bảng XPath chuẩn.
          </p>
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder='<div id="login-form">
  <input name="email" ... />
  <button type="submit">Login</button>
</div>'
            className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm font-mono text-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none custom-scrollbar min-h-[200px]"
          />
        </div>

        <div className="p-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-800/30 rounded-b-xl">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={!html.trim()}
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <span>Phân tích ngay</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};