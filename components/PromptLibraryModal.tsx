

import React, { useMemo } from 'react';
import { Message, Role } from '../types';

interface PromptLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
  messages: Message[];
}

const STATIC_CATEGORIES = [
  {
    title: "Tra cứu Node & Lệnh",
    prompts: [
      "Chi tiết thông tin Node Click",
      "Hướng dẫn sử dụng Node Type Text",
      "Tham số của Node HTTP Request",
      "Lưu ý khi dùng Node Read Excel File",
      "Cấu hình Node For Loop như thế nào?"
    ]
  },
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
    title: "GPM Login API (Quản lý Profile)",
    prompts: [
      "Cách mở Profile ID ... bằng code Python",
      "Sử dụng API để tạo Profile mới",
      "Endpoint để cập nhật Proxy cho Profile",
      "Làm sao để lấy danh sách Profile đang chạy?",
      "Code Node.js để Start Profile qua Local API"
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

const CONTEXT_RULES = [
    {
        keywords: ['excel', 'sheet', 'csv', 'file', 'dữ liệu', 'đọc', 'ghi'],
        prompts: [
            "Làm sao để đọc file Excel mà không bị lỗi font?",
            "Cách append dữ liệu vào file Excel có sẵn",
            "Kiểm tra file có tồn tại trong thư mục hay không?",
            "Cách lấy số dòng của file Excel"
        ]
    },
    {
        keywords: ['xpath', 'html', 'dom', 'element', 'phần tử', 'tìm', 'click', 'gõ', 'nhập'],
        prompts: [
            "Cách tạo XPath chứa text() tương đối",
            "Xử lý phần tử nằm trong iframe",
            "Tìm phần tử cha của một nút (parent node)",
            "Cách click vào phần tử bị che khuất"
        ]
    },
    {
        keywords: ['lỗi', 'error', 'bug', 'fail', 'không chạy', 'dừng'],
        prompts: [
            "Tại sao tool báo thành công nhưng không thấy click?",
            "Cách debug từng bước để tìm lỗi",
            "Xử lý lỗi timeout khi mạng chậm",
            "Làm sao để bỏ qua lỗi và chạy tiếp (Try-Catch)?"
        ]
    },
    {
        keywords: ['proxy', 'ip', 'mạng', 'http', 'request', 'api', 'profile', 'start', 'open'],
        prompts: [
            "Hướng dẫn dùng API Start Profile bằng Python",
            "Cách đổi Proxy cho Profile qua API",
            "Kiểm tra IP hiện tại bằng script",
            "Cấu hình xoay Proxy sau mỗi lần chạy"
        ]
    },
    {
         keywords: ['captcha', 'recaptcha', 'giải', 'mã'],
         prompts: [
             "Cách lấy SiteKey để giải ReCaptcha",
             "Hướng dẫn dùng extension giải Captcha",
             "Code mẫu giải Captcha ảnh số"
         ]
    }
];

export const PromptLibraryModal: React.FC<PromptLibraryModalProps> = ({ isOpen, onClose, onSelectPrompt, messages }) => {
  if (!isOpen) return null;

  const displayCategories = useMemo(() => {
    // 1. Analyze context
    const suggestions = new Set<string>();
    
    // Get last 5 user messages
    const recentContent = messages
        .filter(m => m.role === Role.USER)
        .slice(-5)
        .map(m => m.text.toLowerCase())
        .join(' ');

    if (recentContent) {
        CONTEXT_RULES.forEach(rule => {
            if (rule.keywords.some(k => recentContent.includes(k))) {
                rule.prompts.forEach(p => suggestions.add(p));
            }
        });
    }

    const contextualPrompts = Array.from(suggestions).slice(0, 4);
    
    const categories = [];

    // Add contextual category if exists
    if (contextualPrompts.length > 0) {
        categories.push({
            title: "✨ Gợi ý theo ngữ cảnh",
            prompts: contextualPrompts
        });
    }

    // Add static categories
    categories.push(...STATIC_CATEGORIES);

    return categories;
  }, [messages]);

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
            {displayCategories.map((cat, idx) => (
              <div key={idx} className="space-y-3">
                <h4 className={`text-sm font-bold uppercase tracking-wider border-b pb-2 ${idx === 0 && cat.title.startsWith("✨") ? "text-yellow-400 border-yellow-500/30" : "text-blue-400 border-slate-800"}`}>
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