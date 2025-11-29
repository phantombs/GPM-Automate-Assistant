
import React, { useState, useMemo } from 'react';
import { fakerEN, fakerVI } from '@faker-js/faker';

interface FakerGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert?: (text: string) => void;
}

// Map categories to Faker methods (path is property access string)
const DATA_TYPES = [
  {
    category: "👤 Định danh (Identity)",
    items: [
      { label: "Họ và tên (Full Name)", path: "person.fullName" },
      { label: "Tên (First Name)", path: "person.firstName" },
      { label: "Họ (Last Name)", path: "person.lastName" },
      { label: "Giới tính", path: "person.sex" },
      { label: "Công việc (Job Title)", path: "person.jobTitle" },
    ]
  },
  {
    category: "🌐 Internet & Login",
    items: [
      { label: "Email", path: "internet.email" },
      { label: "Username", path: "internet.userName" },
      { label: "Password (An toàn)", path: "internet.password" },
      { label: "User Agent", path: "internet.userAgent" },
      { label: "IPv4 Address", path: "internet.ipv4" },
      { label: "IPv6 Address", path: "internet.ipv6" },
      { label: "MAC Address", path: "internet.mac" },
    ]
  },
  {
    category: "📞 Liên hệ & Địa điểm",
    items: [
      { label: "Số điện thoại", path: "phone.number" },
      { label: "Địa chỉ đầy đủ", path: "location.streetAddress" },
      { label: "Thành phố", path: "location.city" },
      { label: "Quốc gia", path: "location.country" },
    ]
  },
  {
    category: "💳 Tài chính & Mua sắm",
    items: [
      { label: "Số tài khoản (Account No)", path: "finance.accountNumber" },
      { label: "Tên sản phẩm", path: "commerce.productName" },
      { label: "Giá sản phẩm", path: "commerce.price" },
    ]
  },
  {
    category: "⚙️ Hệ thống & ID",
    items: [
      { label: "UUID", path: "string.uuid" },
      { label: "Nano ID", path: "string.nanoid" },
      { label: "File Name", path: "system.fileName" },
    ]
  }
];

// Vanilla JS Templates for GPM Automate "Execute JS Code" Node
const JS_TEMPLATES: Record<string, string> = {
  "person.fullName": `// [GPM] JS Code: Tạo tên ngẫu nhiên (Tiếng Việt)
var hos = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"];
var dems = ["Văn", "Thị", "Hữu", "Minh", "Quốc", "Gia", "Bảo", "Ngọc", "Thanh", "Đức", "Thái", "Quang"];
var tens = ["Huy", "Khang", "Bảo", "Minh", "Phúc", "Anh", "Khoa", "Phát", "Đạt", "Dũng", "Hoàng", "Long", "Nam", "Tú", "Kiên"];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Trả về kết quả cho biến
return rand(hos) + " " + rand(dems) + " " + rand(tens);`,

  "internet.email": `// [GPM] JS Code: Tạo Email ngẫu nhiên
var chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
var user = '';
for(var i=0; i<10; i++){
    user += chars[Math.floor(Math.random() * chars.length)];
}
var domains = ["gmail.com", "yahoo.com", "outlook.com"];
var domain = domains[Math.floor(Math.random() * domains.length)];

return user + "@" + domain;`,

  "internet.password": `// [GPM] JS Code: Tạo Password mạnh
var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
var length = 12;
var retVal = "";
for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
}
return retVal;`,

  "internet.userAgent": `// [GPM] JS Code: Random UserAgent (Cơ bản)
var osVersions = ["10.0", "11.0"];
var chromeVersions = ["120.0.0.0", "121.0.0.0", "122.0.0.0"];
var os = osVersions[Math.floor(Math.random() * osVersions.length)];
var chrome = chromeVersions[Math.floor(Math.random() * chromeVersions.length)];

return "Mozilla/5.0 (Windows NT " + os + "; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/" + chrome + " Safari/537.36";`,

  "phone.number": `// [GPM] JS Code: Tạo SĐT Việt Nam
var prefixes = ["09", "03", "07", "08", "05"];
var prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
var suffix = "";
for(var i=0; i<8; i++) {
    suffix += Math.floor(Math.random() * 10);
}
return prefix + suffix;`,

  "string.uuid": `// [GPM] JS Code: Tạo UUID v4
return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});`,

  "finance.accountNumber": `// [GPM] JS Code: Tạo số tài khoản ngân hàng (10-14 số)
var len = Math.floor(Math.random() * 5) + 10; // 10 to 14
var acc = "";
for(var i=0; i<len; i++) {
    acc += Math.floor(Math.random() * 10);
}
return acc;`,
};

export const FakerGeneratorModal: React.FC<FakerGeneratorModalProps> = ({ isOpen, onClose, onInsert }) => {
  const [selectedPath, setSelectedPath] = useState<string>("person.fullName");
  const [locale, setLocale] = useState<'vi' | 'en'>('vi');
  const [count, setCount] = useState<number>(5);
  const [generatedData, setGeneratedData] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  // New state for Mode: 'data' (Preview) or 'code' (JS Script)
  const [mode, setMode] = useState<'data' | 'code'>('data');

  const handleGenerate = () => {
    const f = locale === 'vi' ? fakerVI : fakerEN;
    const [domain, func] = selectedPath.split('.');
    
    // Safety check for dynamic access
    // @ts-ignore
    const module = f[domain];
    // @ts-ignore
    const method = module?.[func];

    if (typeof method === 'function') {
      const results = [];
      for (let i = 0; i < count; i++) {
        results.push(method());
      }
      setGeneratedData(results.join('\n'));
    } else {
      setGeneratedData("Lỗi: Không tìm thấy hàm tạo dữ liệu này.");
    }
  };

  const jsCode = useMemo(() => {
    return JS_TEMPLATES[selectedPath] || `// Chưa có template JS cho loại dữ liệu này.\n// Bạn vui lòng sử dụng chế độ tạo dữ liệu Text và copy vào danh sách.`;
  }, [selectedPath]);

  const displayContent = mode === 'data' ? generatedData : jsCode;

  const handleCopy = async () => {
    if (!displayContent) return;
    try {
      await navigator.clipboard.writeText(displayContent);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleInsert = () => {
    if (onInsert && displayContent) {
        // If code mode, wrap in markdown block
        const contentToInsert = mode === 'code' 
          ? `\`\`\`javascript\n${displayContent}\n\`\`\`` 
          : displayContent;
        onInsert(contentToInsert);
        onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/50 rounded-t-xl">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="text-purple-400 text-xl">🎲</span> Random Data & JS Code
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Controls */}
            <div className="space-y-5">
              
              {/* Mode Toggle */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase">Chế độ</label>
                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button 
                    onClick={() => setMode('data')}
                    className={`flex-1 py-1.5 text-sm rounded font-medium transition-all flex items-center justify-center gap-2 ${mode === 'data' ? 'bg-slate-800 text-white shadow ring-1 ring-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    📝 Dữ liệu Text
                  </button>
                  <button 
                     onClick={() => setMode('code')}
                     className={`flex-1 py-1.5 text-sm rounded font-medium transition-all flex items-center justify-center gap-2 ${mode === 'code' ? 'bg-yellow-900/30 text-yellow-500 shadow ring-1 ring-yellow-500/50' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    ⚡ Mã GPM (JS)
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                  {mode === 'data' 
                    ? "Tạo danh sách dữ liệu tĩnh để copy vào biến hoặc file."
                    : "Lấy đoạn mã Javascript để dán vào Node 'Execute JS Code' trong tool GPM."}
                </p>
              </div>

              <div className="h-px bg-slate-800"></div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Loại dữ liệu</label>
                <select 
                  value={selectedPath}
                  onChange={(e) => setSelectedPath(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block p-2.5 outline-none custom-scrollbar"
                >
                  {DATA_TYPES.map((group) => (
                    <optgroup key={group.category} label={group.category}>
                      {group.items.map((item) => (
                        <option key={item.path} value={item.path}>
                          {item.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Options only for Data Mode */}
              {mode === 'data' && (
                <div className="animate-in slide-in-from-top-2 fade-in">
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Ngôn ngữ</label>
                    <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                      <button 
                        onClick={() => setLocale('vi')}
                        className={`flex-1 py-1.5 text-xs rounded font-medium transition-all ${locale === 'vi' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        Tiếng Việt
                      </button>
                      <button 
                        onClick={() => setLocale('en')}
                        className={`flex-1 py-1.5 text-xs rounded font-medium transition-all ${locale === 'en' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        English
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">Số lượng: <span className="text-white">{count}</span></label>
                    <input 
                      type="range" 
                      min="1" 
                      max="50" 
                      value={count} 
                      onChange={(e) => setCount(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                </div>
              )}

              {mode === 'data' && (
                <button
                  onClick={handleGenerate}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium shadow-lg shadow-purple-900/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Tạo dữ liệu
                </button>
              )}
            </div>

            {/* Output */}
            <div className="flex flex-col h-full min-h-[250px]">
              <div className="flex items-center justify-between mb-1">
                 <label className="text-xs font-medium text-slate-400 uppercase">
                    {mode === 'data' ? "Kết quả Preview" : "Javascript Code"}
                 </label>
                 {displayContent && (
                   <button 
                    onClick={handleCopy}
                    className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                   >
                     {copyFeedback ? (
                       <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Đã copy</>
                     ) : (
                       <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Copy</>
                     )}
                   </button>
                 )}
              </div>
              <textarea
                readOnly
                value={displayContent}
                placeholder={mode === 'data' ? "Dữ liệu sinh ra sẽ hiện ở đây..." : "Code JS sẽ hiện ở đây..."}
                className={`flex-1 w-full border rounded-lg p-3 text-sm font-mono focus:ring-1 outline-none resize-none custom-scrollbar
                    ${mode === 'code' 
                        ? 'bg-slate-950 border-yellow-500/30 text-yellow-100 focus:border-yellow-500 focus:ring-yellow-500' 
                        : 'bg-slate-950 border-slate-800 text-slate-300 focus:border-purple-500 focus:ring-purple-500'
                    }
                `}
              />
            </div>
          </div>
        </div>
        
        {/* Footer */}
        {onInsert && (
             <div className="p-4 border-t border-slate-800 bg-slate-800/30 rounded-b-xl flex justify-end">
                <button
                    onClick={handleInsert}
                    disabled={!displayContent}
                    className="px-4 py-2 text-sm font-medium bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {mode === 'code' ? "Chèn Code vào Chat" : "Chèn Dữ liệu vào Chat"}
                </button>
             </div>
        )}
      </div>
    </div>
  );
};
