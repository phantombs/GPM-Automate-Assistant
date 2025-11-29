import React from 'react';

interface PromptLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
}

const CATEGORIES = [
  {
    title: "Cơ bản & XPath",
    prompts: [
      "Làm sao để lấy XPath của nút Đăng nhập?",
      "Giải thích các node cơ bản trong GPM Automate",
      "Cách sử dụng biến (Variable) trong kịch bản",
      "Sửa lỗi 'Element not found' như thế nào?"
    ]
  },
  {
    title: "Dữ liệu & Excel",
    prompts: [
      "Hướng dẫn đọc dữ liệu từ file Excel từng dòng",
      "Cách ghi kết quả chạy vào file Text",
      "Làm sao để kiểm tra ô Excel có trống hay không?",
      "Cách tách chuỗi (Split Text) và lấy phần tử đầu"
    ]
  },
  {
    title: "Logic & Nâng cao",
    prompts: [
      "Viết vòng lặp For duyệt qua danh sách file",
      "Cách xử lý Captcha ảnh bằng dịch vụ bên thứ 3",
      "Random thời gian chờ giữa các bước",
      "Cách Fake IP và kiểm tra IP trước khi vào web"
    ]
  }
];

export const PromptLibraryModal: React.FC<PromptLibraryModalProps> = ({ isOpen, onClose, onSelectPrompt }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/50 rounded-t-xl">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-yellow-400">💡</span> Thư viện Mẫu câu hỏi
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((cat, idx) => (
              <div key={idx} className="space-y-3">
                <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                  {cat.title}
                </h4>
                <div className="space-y-2">
                  {cat.prompts.map((prompt, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => {
                        onSelectPrompt(prompt);
                        onClose();
                      }}
                      className="w-full text-left p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/50 text-slate-300 hover:text-white text-sm transition-all duration-200 group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform inline-block">
                        {prompt}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-800/30 rounded-b-xl text-center">
            <p className="text-xs text-slate-500">Chọn một câu hỏi để điền nhanh vào khung chat</p>
        </div>
      </div>
    </div>
  );
};