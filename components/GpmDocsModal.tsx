
import React from 'react';
import { GPM_OFFICIAL_DOCS } from '../constants';

interface GpmDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSync: () => void;
}

export const GpmDocsModal: React.FC<GpmDocsModalProps> = ({ isOpen, onClose, onSync }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-xl shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/50 rounded-t-xl">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-cyan-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c1.052 0 2.062.18 3 .512v-14.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM9 6.042a8.967 8.967 0 016-2.292m-6 2.292v14.25A8.987 8.987 0 0015 18c1.052 0 2.062.18 3 .512v-14.25A8.987 8.987 0 0015 3.75M9 19.713a11.962 11.962 0 01-3-1.463m9 1.463a11.962 11.962 0 013-1.463m-3-14.25v14.25" />
            </svg>
            Trung tâm tri thức GPM
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
          <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-lg">
             <p className="text-sm text-indigo-200 leading-relaxed">
                Hệ thống AI sẽ sử dụng công cụ <strong>Google Search</strong> để truy cập và phân tích dữ liệu mới nhất từ các nguồn chính thức bên dưới.
             </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nguồn dữ liệu tham chiếu</label>
            {GPM_OFFICIAL_DOCS.map((url, idx) => (
              <a 
                key={idx} 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 text-sm transition-all truncate"
              >
                {url}
              </a>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-800/30 rounded-b-xl flex flex-col gap-3">
          <button
            onClick={() => {
              onSync();
              onClose();
            }}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-lg font-bold shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-2 animate-glow"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Đồng bộ kiến thức ngay
          </button>
          <p className="text-[10px] text-center text-slate-500">Quá trình đồng bộ sẽ gửi một yêu cầu Deep Search tới AI để cập nhật context.</p>
        </div>
      </div>
    </div>
  );
};
