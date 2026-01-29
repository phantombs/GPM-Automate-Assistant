
import React, { useState, useEffect } from 'react';

interface ApiKeyManagerProps {
  onKeySelected: () => void;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onKeySelected }) => {
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [checking, setChecking] = useState(true);

  const checkKey = async () => {
    try {
      // @ts-ignore
      const status = await window.aistudio.hasSelectedApiKey();
      setHasKey(status);
    } catch (e) {
      console.error("Lỗi kiểm tra API Key:", e);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkKey();
    // Kiểm tra định kỳ mỗi 2 giây để cập nhật trạng thái nếu người dùng đổi key
    const interval = setInterval(checkKey, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenPicker = async () => {
    try {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      // Giả định thành công theo quy tắc race condition
      setHasKey(true);
      onKeySelected();
    } catch (e) {
      alert("Không thể mở hộp thoại chọn Key. Vui lòng thử lại.");
    }
  };

  return (
    <div className="p-4 bg-slate-900/60 border border-white/5 rounded-xl mt-auto mx-2 mb-4 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${hasKey ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'} shadow-[0_0_8px_rgba(0,0,0,0.5)]`}></div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">API Status</span>
        </div>
        <span className={`text-[10px] font-mono ${hasKey ? 'text-emerald-400' : 'text-rose-400'}`}>
          {hasKey ? 'CONNECTED' : 'OFFLINE'}
        </span>
      </div>

      <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">
        {hasKey 
          ? "Hệ thống đang sử dụng API Key cá nhân của bạn. Dữ liệu được bảo mật tuyệt đối." 
          : "Vui lòng chọn API Key từ Google Cloud của bạn để bắt đầu sử dụng AI."}
      </p>

      <button
        onClick={handleOpenPicker}
        className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 border
          ${hasKey 
            ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white' 
            : 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/20'}
        `}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
        {hasKey ? "Đổi API Key" : "Cấu hình API Key"}
      </button>

      {!hasKey && (
        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          className="block text-center text-[9px] text-indigo-400 mt-2 hover:underline"
        >
          Hướng dẫn thiết lập Billing & Key
        </a>
      )}
    </div>
  );
};
