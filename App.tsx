

import React, { useState, useRef, useEffect } from 'react';
import { streamChatResponse, AiMode } from './services/geminiService';
import { Message, Role, ChatSession } from './types';
import { INITIAL_GREETING, GPM_OFFICIAL_DOCS } from './constants';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { ChatHistorySidebar } from './components/ChatHistorySidebar';
import { HtmlAnalysisModal } from './components/HtmlAnalysisModal';
import { PromptLibraryModal } from './components/PromptLibraryModal';
import { FakerGeneratorModal } from './components/FakerGeneratorModal';
import { GpmDocsModal } from './components/GpmDocsModal';

// --- Icons ---
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
  </svg>
);

const AttachIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
  </svg>
);

const CodeBracketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
  </svg>
);

const LightBulbIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-1.94c.413-.002.827-.006 1.241-.012.352-.005.696-.01 1.037-.015a6.45 6.45 0 10-4.556 0c.34.005.685.01 1.037.015.414.006.828.01 1.241.012V18zm0 0a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zM12 9a3.75 3.75 0 00-3.75 3.75c0 .605.156 1.17.433 1.666.234.417.46.903.46 1.498v.487a.75.75 0 01-1.5 0v-.487c0-.986-.345-1.764-.704-2.404A5.25 5.25 0 1115.704 15.8c-.36.64-.704 1.418-.704 2.404v.487a.75.75 0 01-1.5 0v-.487c0-.595.226-1.08.46-1.498A3.75 3.75 0 0012 9z" />
  </svg>
);

const MicrophoneIcon = ({ isListening }: { isListening: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill={isListening ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${isListening ? 'text-rose-500 animate-pulse' : ''}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const RobotIcon = () => (
    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-white/20">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12h1.5m13.5 0h1.5M17.25 3v1.5M12 18.75V21m-4.72-14.25l-1.35-1.35M18.07 4.5l-1.35 1.35M18.07 4.5l-1.35 1.35M13.5 10.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm9.75 0A9.75 9.75 0 1112 2.25 9.75 9.75 0 0123.25 10.5z" />
        </svg>
    </div>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const PencilSquareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
  </svg>
);

const XMarkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

const CommandIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-purple-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const DiceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
  </svg>
);

const SparkIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-4 h-4"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.624L16.5 21.75l-.398-1.126a3.375 3.375 0 00-2.455-2.456L12.75 18l1.126-.398a3.375 3.375 0 002.455-2.456L16.5 14.25l.398 1.126a3.375 3.375 0 002.456 2.456L20.25 18l-1.126.398a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
);
const BoltIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-4 h-4"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
);

const NetworkIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-4 h-4"}>
       <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z" />
       <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 9.75h15M4.5 14.25h15M10.5 2.25v19.5" />
    </svg>
);
const SearchIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-4 h-4"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);
const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

// --- Constants & Configs ---
const STORAGE_KEY = 'gpm_chat_sessions';
const ACTIVE_SESSION_KEY = 'gpm_active_session_id';
const INPUT_DRAFT_KEY = 'gpm_input_draft_';
const AUTO_SAVE_INTERVAL = 5000; // 5 seconds

const NODE_COMMANDS = [
  { label: '/click', desc: 'Click vào phần tử', value: 'Hướng dẫn sử dụng Node Click trong GPM' },
  { label: '/type', desc: 'Nhập văn bản (Type Text)', value: 'Cách dùng Node Type Text' },
  { label: '/open', desc: 'Mở trình duyệt (Open Browser)', value: 'Cấu hình Node Open Browser' },
  { label: '/script', desc: 'Chạy Javascript', value: 'Hướng dẫn Node Javascript Execute' },
  { label: '/api', desc: 'GPM Login API (V3)', value: 'Hướng dẫn sử dụng API để Start/Stop Profile' },
  { label: '/readexcel', desc: 'Đọc file Excel', value: 'Cách đọc dữ liệu từ Excel (Read Excel File)' },
  { label: '/wait', desc: 'Chờ đợi (Wait/Delay)', value: 'Sử dụng Node Wait/Delay' },
  { label: '/faker', desc: 'Tạo dữ liệu giả (Random)', value: '/faker' },
];

const sortSessions = (sessions: ChatSession[]) => {
  return [...sessions].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.lastMessageAt.getTime() - a.lastMessageAt.getTime();
  });
};

// FIX: Changed JSX.Element to React.ReactNode to resolve "Cannot find namespace 'JSX'" error.
const AI_MODES: Record<AiMode, { name: string; icon: React.ReactNode; description: string }> = {
  smart: {
    name: "Thông minh",
    icon: <SparkIcon />,
    description: "Mô hình Pro cho các tác vụ phức tạp."
  },
  fast: {
    name: "Nhanh",
    icon: <BoltIcon />,
    description: "Phản hồi tức thì cho các câu hỏi đơn giản."
  },
  deep_think: {
    name: "Tư duy sâu",
    icon: <NetworkIcon />,
    description: "Kích hoạt Thinking Mode cho yêu cầu chuyên sâu."
  },
  search: {
    name: "Web Search",
    icon: <SearchIcon />,
    description: "Sử dụng Google Search để có thông tin mới nhất."
  }
};


// --- Sub-Components ---
const WelcomeHero = ({ onAction }: { onAction: (text: string, isTool?: string) => void }) => {
    const cards = [
        {
            icon: <CodeBracketIcon />,
            title: "Phân tích HTML",
            desc: "Tạo XPath chuẩn xác từ source code",
            color: "from-cyan-500 to-blue-600",
            shadow: "shadow-cyan-500/20",
            tool: 'html'
        },
        {
            icon: <DiceIcon />,
            title: "Random JS",
            desc: "Tên, Email, SĐT bằng Javascript",
            color: "from-purple-500 to-pink-600",
             shadow: "shadow-purple-500/20",
            tool: 'faker'
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>,
            title: "Debug Kịch bản",
            desc: "Sửa lỗi script dừng, không click",
            color: "from-orange-500 to-red-600",
             shadow: "shadow-orange-500/20",
            prompt: "Kịch bản của tôi đang bị lỗi dừng đột ngột, hãy hướng dẫn tôi cách debug (tìm lỗi) chi tiết."
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" /></svg>,
            title: "GPM API V3",
            desc: "Code Python/JS điều khiển Profile",
            color: "from-emerald-500 to-teal-600",
             shadow: "shadow-emerald-500/20",
            prompt: "Hướng dẫn tôi sử dụng API của GPM Login để mở một profile bằng code Python."
        }
    ];

    return (
        <div className="flex flex-col items-center justify-center h-full max-w-5xl mx-auto px-6 pb-32 animate-fade-in-up">
            <div className="mb-10 relative group cursor-default">
                 <div className="absolute -inset-20 bg-indigo-500/20 blur-[100px] rounded-full animate-pulse-slow"></div>
                 <div className="relative animate-float p-1 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500">
                     <div className="p-6 bg-slate-950 rounded-[22px] backdrop-blur-xl">
                        <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="url(#gradient)" className="w-full h-full drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#6366f1" />
                                        <stop offset="50%" stopColor="#a855f7" />
                                        <stop offset="100%" stopColor="#06b6d4" />
                                    </linearGradient>
                                </defs>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12h1.5m13.5 0h1.5M17.25 3v1.5M12 18.75V21m-4.72-14.25l-1.35-1.35M18.07 4.5l-1.35 1.35M18.07 4.5l-1.35 1.35M13.5 10.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm9.75 0A9.75 9.75 0 1112 2.25 9.75 9.75 0 0123.25 10.5z" />
                            </svg>
                        </div>
                     </div>
                 </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-center tracking-tight mb-4 text-white">
                GPM <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 animate-glow">Automate AI</span>
            </h1>
            <p className="text-slate-400 text-center mb-12 max-w-xl text-lg font-light">
                Trợ lý thông minh cho GPM. <br className="md:hidden"/>Tối ưu hóa kịch bản, xử lý API và sửa lỗi.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                {cards.map((card, idx) => (
                    <button 
                        key={idx}
                        onClick={() => onAction(card.prompt || '', card.tool)}
                        className="group relative h-full w-full rounded-2xl p-px bg-gradient-to-b from-slate-700/50 to-slate-900/50 hover:from-indigo-500 hover:to-purple-600 transition-all duration-300 overflow-hidden"
                    >
                         <div className="absolute inset-0 bg-slate-950/80 m-px rounded-2xl z-10"></div>
                         <div className="relative z-20 flex flex-col h-full p-5 items-start bg-slate-950/40 hover:bg-slate-900/20 transition-colors backdrop-blur-md rounded-2xl">
                            <div className={`mb-3 p-2.5 rounded-xl bg-gradient-to-br ${card.color} text-white ${card.shadow} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                {card.icon}
                            </div>
                            <h3 className="font-bold text-slate-100 group-hover:text-white transition-colors text-lg">{card.title}</h3>
                            <p className="text-sm text-slate-500 group-hover:text-slate-300 mt-1">{card.desc}</p>
                         </div>
                    </button>
                ))}
            </div>
        </div>
    );
};


// --- Main App Component ---
export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{name: string, content: string} | null>(null);
  const [attachedImage, setAttachedImage] = useState<{data: string, mimeType: string, preview: string} | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isApiSetupRequired, setIsApiSetupRequired] = useState<boolean>(false);
  
  // Modals
  const [isHtmlModalOpen, setIsHtmlModalOpen] = useState(false);
  const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState(false);
  const [isFakerModalOpen, setIsFakerModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  
  const [isListening, setIsListening] = useState(false);

  // AI Mode State
  const [aiMode, setAiMode] = useState<AiMode>('smart');
  const [isModeSelectorOpen, setIsModeSelectorOpen] = useState(false);
  
  // Editing Message State
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedMessageContent, setEditedMessageContent] = useState('');

  // Slash Command State
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null); 
  const modeSelectorRef = useRef<HTMLDivElement>(null);

  // --- Persistence Logic ---

  const saveToLocalStorage = (currentSessions: ChatSession[], activeId: string | null) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSessions));
        if (activeId) {
            localStorage.setItem(ACTIVE_SESSION_KEY, activeId);
        }
    } catch (e) {
        console.error("Failed to save to localStorage", e);
    }
  };

  const saveInputDraft = (sessionId: string | null, value: string) => {
    if (!sessionId) return;
    try {
        localStorage.setItem(INPUT_DRAFT_KEY + sessionId, value);
    } catch (e) {}
  };

  const loadInputDraft = (sessionId: string | null) => {
    if (!sessionId) return '';
    return localStorage.getItem(INPUT_DRAFT_KEY + sessionId) || '';
  };

  // --- Session Management ---

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'Đoạn chat mới',
      messages: [{
        id: 'init',
        role: Role.MODEL,
        text: INITIAL_GREETING,
        timestamp: new Date()
      }],
      lastMessageAt: new Date(),
      isPinned: false
    };
    
    setSessions(prev => {
        const updated = sortSessions([newSession, ...prev]);
        saveToLocalStorage(updated, newSession.id);
        return updated;
    });
    setCurrentSessionId(newSession.id);
    setInputValue('');
  };

  // --- Effects & Initialization ---

  // Check API Key Status on Mount
  useEffect(() => {
    const checkApi = async () => {
        try {
            // @ts-ignore
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setIsApiSetupRequired(!hasKey);
        } catch (e) {
            setIsApiSetupRequired(true);
        }
    };
    checkApi();
  }, []);
  
  // Handle click outside for mode selector
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modeSelectorRef.current && !modeSelectorRef.current.contains(event.target as Node)) {
        setIsModeSelectorOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modeSelectorRef]);

  // Load state on Mount
  useEffect(() => {
    const savedSessions = localStorage.getItem(STORAGE_KEY);
    const lastActiveId = localStorage.getItem(ACTIVE_SESSION_KEY);

    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        const hydrated = parsed.map((s: any) => ({
          ...s,
          lastMessageAt: new Date(s.lastMessageAt),
          messages: s.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          })),
          isPinned: s.isPinned || false
        }));
        
        const sortedSessions = sortSessions(hydrated);
        setSessions(sortedSessions);
        
        // Restore active session or default to first
        const activeId = (lastActiveId && sortedSessions.find(s => s.id === lastActiveId)) 
          ? lastActiveId 
          : (sortedSessions.length > 0 ? sortedSessions[0].id : null);
        
        if (activeId) {
          setCurrentSessionId(activeId);
          setInputValue(loadInputDraft(activeId));
        } else {
          createNewSession();
        }
      } catch (e) {
        console.error("Failed to parse sessions", e);
        createNewSession();
      }
    } else {
      createNewSession();
    }
  }, []);

  // Heartbeat Auto-save every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
        if (sessions.length > 0) {
            saveToLocalStorage(sessions, currentSessionId);
            saveInputDraft(currentSessionId, inputValue);
        }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [sessions, currentSessionId, inputValue]);

  // Immediate save on critical session changes
  useEffect(() => {
    saveToLocalStorage(sessions, currentSessionId);
  }, [sessions, currentSessionId]);

  // Save draft on every keystroke
  useEffect(() => {
    saveInputDraft(currentSessionId, inputValue);
  }, [inputValue, currentSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [sessions, currentSessionId, isThinking]);

  // Speech Recognition Setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'vi-VN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  // --- Helpers ---

  const scrollToBottom = () => {
    if (editingMessageId) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectSession = (id: string) => {
    saveInputDraft(currentSessionId, inputValue);
    setCurrentSessionId(id);
    setInputValue(loadInputDraft(id));
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.removeItem(INPUT_DRAFT_KEY + id);
    let nextSessionId = currentSessionId;
    const remaining = sessions.filter(s => s.id !== id);
    
    if (currentSessionId === id) {
       nextSessionId = remaining.length > 0 ? remaining[0].id : null;
    }
    
    setSessions(remaining);
    saveToLocalStorage(remaining, nextSessionId);
    
    if (!nextSessionId && remaining.length === 0) {
        createNewSession();
    } else if (nextSessionId !== currentSessionId) {
        setCurrentSessionId(nextSessionId);
        setInputValue(loadInputDraft(nextSessionId));
    }
  };

  const togglePinSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => {
        const updated = prev.map(s => s.id === id ? { ...s, isPinned: !s.isPinned } : s);
        const sorted = sortSessions(updated);
        saveToLocalStorage(sorted, currentSessionId);
        return sorted;
    });
  };

  const renameSession = (id: string, newTitle: string) => {
    setSessions(prev => {
        const updated = prev.map(s => s.id === id ? { ...s, title: newTitle } : s);
        saveToLocalStorage(updated, currentSessionId);
        return updated;
    });
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  const updateCurrentSessionMessages = (newMessages: Message[]) => {
    if (!currentSessionId) return;
    setSessions(prev => {
        const updated = prev.map(s => {
            if (s.id === currentSessionId) {
                return { ...s, messages: newMessages, lastMessageAt: new Date() };
            }
            return s;
        });
        const sorted = sortSessions(updated);
        saveToLocalStorage(sorted, currentSessionId);
        return sorted;
    });
  };

  const updateSessionTitle = (sessionId: string, firstUserMessage: string) => {
    setSessions(prev => {
        const updated = prev.map(s => {
            if (s.id === sessionId && (s.title === 'Đoạn chat mới' || !s.title)) {
              const title = firstUserMessage.slice(0, 30) + (firstUserMessage.length > 30 ? '...' : '');
              return { ...s, title };
            }
            return s;
        });
        saveToLocalStorage(updated, currentSessionId);
        return updated;
    });
  };

  // --- Input Handlers ---

  const processFile = (file: File) => {
    const isImage = file.type.startsWith('image/');
    const reader = new FileReader();

    if (isImage) {
        reader.onload = (e) => {
            const preview = e.target?.result as string;
            const data = preview.split(',')[1];
            setAttachedImage({ data, mimeType: file.type, preview });
        };
        reader.readAsDataURL(file);
    } else {
        reader.onload = (e) => {
            const content = e.target?.result as string;
            setAttachedFile({ name: file.name, content: content });
        };
        reader.readAsText(file);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processFile(file);
    event.target.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) processFile(blob);
        }
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) processFile(e.dataTransfer.files[0]);
  };

  const sendChatMessage = async (
    text: string, 
    file: {name: string, content: string} | null,
    image: {data: string, mimeType: string, preview: string} | null
  ) => {
    if (!currentSessionId) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: file ? `${text}\n\n[Tệp đính kèm: ${file.name}]` : text,
      timestamp: new Date(),
      attachedFile: file ? { name: file.name, content: file.content } : undefined,
      attachedImage: image ? { data: image.data, mimeType: image.mimeType } : undefined
    };

    const updatedMessages = [...messages, userMsg];
    updateCurrentSessionMessages(updatedMessages);
    updateSessionTitle(currentSessionId, text || file?.name || "Hình ảnh");
    
    setIsThinking(true);

    try {
      const botMsgId = (Date.now() + 1).toString();
      const messagesWithBotPlaceholder = [
        ...updatedMessages,
        { id: botMsgId, role: Role.MODEL, text: '', timestamp: new Date() }
      ];
      updateCurrentSessionMessages(messagesWithBotPlaceholder);

      const historyContext = messages.slice(-10); 
      const stream = await streamChatResponse(historyContext, text, file?.content, image ? { data: image.data, mimeType: image.mimeType } : undefined, aiMode);

      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk;
        setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
            const newMsgs = s.messages.map(msg => 
              msg.id === botMsgId ? { ...msg, text: fullResponse } : msg
            );
            return { ...s, messages: newMsgs };
          }
          return s;
        }));
      }
    } catch (error: any) {
       console.error(error);
       setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
              const newMsgs = [...s.messages, { 
                  id: Date.now().toString(), 
                  role: Role.MODEL, 
                  text: "Tôi gặp lỗi: " + (error?.message || "Lỗi Token Limit hoặc kết nối."),
                  timestamp: new Date(),
                  isError: true
              }];
              return { ...s, messages: newMsgs };
          }
          return s;
        }));
    } finally {
      setIsThinking(false);
    }
  };

  const handleSendMessage = () => {
    if ((!inputValue.trim() && !attachedFile && !attachedImage) || isThinking) return;
    sendChatMessage(inputValue, attachedFile, attachedImage);
    setInputValue('');
    setAttachedFile(null);
    setAttachedImage(null);
    saveInputDraft(currentSessionId, '');
  };

  const startEditingMessage = (msg: Message) => {
    setEditingMessageId(msg.id);
    setEditedMessageContent(msg.text);
  };

  const handleSaveEdit = async (messageId: string) => {
    if (!currentSessionId || !editedMessageContent.trim()) return;
    const session = sessions.find(s => s.id === currentSessionId);
    if (!session) return;
    const msgIndex = session.messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;

    const originalMsg = session.messages[msgIndex];
    const updatedUserMsg: Message = { ...originalMsg, text: editedMessageContent, timestamp: new Date() };
    const botMsgId = (Date.now() + 1).toString();
    const newHistoryWithBot = [
        ...session.messages.slice(0, msgIndex),
        updatedUserMsg,
        { id: botMsgId, role: Role.MODEL, text: '', timestamp: new Date() }
    ];

    updateCurrentSessionMessages(newHistoryWithBot);
    setEditingMessageId(null);
    setEditedMessageContent('');
    setIsThinking(true);

    try {
        const stream = await streamChatResponse(
            session.messages.slice(0, msgIndex).slice(-10), 
            updatedUserMsg.text, 
            originalMsg.attachedFile?.content,
            originalMsg.attachedImage,
            aiMode
        );
        let fullResponse = '';
        for await (const chunk of stream) {
            fullResponse += chunk;
            setSessions(prev => prev.map(s => {
                if (s.id === currentSessionId) {
                    const newMsgs = s.messages.map(msg => msg.id === botMsgId ? { ...msg, text: fullResponse } : msg);
                    return { ...s, messages: newMsgs };
                }
                return s;
            }));
        }
    } catch (error: any) {
        console.error(error);
        setSessions(prev => prev.map(s => {
            if (s.id === currentSessionId) {
                const newMsgs = s.messages.map(msg => msg.id === botMsgId ? { ...msg, text: "Lỗi: " + error?.message, isError: true } : msg);
                return { ...s, messages: newMsgs };
            }
            return s;
        }));
    } finally { setIsThinking(false); }
  };

  // --- Feature Handlers ---

  const handleHtmlSubmit = (html: string) => {
    const analysisPrompt = `Hãy phân tích đoạn mã HTML sau và tạo bảng XPath chuẩn cho các phần tử quan trọng:\n\n\`\`\`html\n${html}\n\`\`\``;
    sendChatMessage(analysisPrompt, null, null);
  };

  const handleFixContent = (content: string) => {
    const isMermaid = /^\s*(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|journey|gitGraph|mindmap|timeline)/.test(content);
    let prompt = isMermaid 
        ? `Phân tích code Mermaid sau và sửa các lỗi Parsing/Syntax/Cycle Error...\n\n\`\`\`mermaid\n${content}\n\`\`\`` 
        : `Nội dung sau bị lỗi định dạng Markdown. Hãy định dạng lại chuẩn xác:\n\n${content}`;
    sendChatMessage(prompt, null, null);
  };

  const handleKnowledgeSync = () => {
      const syncPrompt = `NHIỆM VỤ: Sử dụng Google Search để truy cập các tài liệu chính thức sau và cập nhật context về các tính năng mới nhất (API V3, Node mới):\n${GPM_OFFICIAL_DOCS.join('\n')}\n\nHãy liệt kê 3 cập nhật quan trọng nhất bạn tìm thấy.`;
      sendChatMessage(syncPrompt, null, null);
  };

  const handleVoiceInput = () => {
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); } 
    else { recognitionRef.current ? (setIsListening(true), recognitionRef.current.start()) : alert("Browser not supported"); }
  };

  const handleExportChat = () => {
    if (!currentSession) return;
    const content = currentSession.messages.map(m => `[${m.role === Role.USER ? 'USER' : 'BOT'}]\n${m.text}\n`).join('\n---\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `GPM_Chat_${currentSession.id}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleSetupApiKey = async () => {
    try {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        setIsApiSetupRequired(false);
    } catch (e) {
        alert("Không thể mở hộp thoại chọn Key.");
    }
  };

  // --- UI Logic ---

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputValue(val);
    const match = val.match(/(?:^|\s)\/([a-zA-Z0-9]*)$/);
    if (match) { setSlashQuery(match[1]); setShowSlashMenu(true); } else setShowSlashMenu(false);
  };

  const handleSelectSlashCommand = (cmd: { value: string }) => {
    if (cmd.value === '/faker') { setIsFakerModalOpen(true); setShowSlashMenu(false); setInputValue(inputValue.replace(/(?:^|\s)\/faker$/, '').trim()); return; }
    const newVal = inputValue.replace(/(?:^|\s)\/([a-zA-Z0-9]*)$/, (match) => match.startsWith(' ') ? ' ' + cmd.value : cmd.value);
    setInputValue(newVal); setShowSlashMenu(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showSlashMenu && filteredCommands.length > 0) { handleSelectSlashCommand(filteredCommands[0]); return; }
      setShowSlashMenu(false); handleSendMessage();
    }
    if (e.key === 'Escape') setShowSlashMenu(false);
  };

  const filteredCommands = NODE_COMMANDS.filter(c => c.label.toLowerCase().includes(slashQuery.toLowerCase()));
  const isEmptyChat = messages.length <= 1;

  return (
    <div className="flex h-full bg-transparent overflow-hidden text-slate-100 font-sans">
      <HtmlAnalysisModal isOpen={isHtmlModalOpen} onClose={() => setIsHtmlModalOpen(false)} onAnalyze={handleHtmlSubmit} />
      <PromptLibraryModal isOpen={isPromptLibraryOpen} onClose={() => setIsPromptLibraryOpen(false)} onSelectPrompt={setInputValue} messages={messages} />
      <FakerGeneratorModal isOpen={isFakerModalOpen} onClose={() => setIsFakerModalOpen(false)} onInsert={(t) => setInputValue(prev => prev + '\n' + t)} />
      <GpmDocsModal isOpen={isDocsModalOpen} onClose={() => setIsDocsModalOpen(false)} onSync={handleKnowledgeSync} />

      <ChatHistorySidebar 
        sessions={sessions} currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession} onCreateSession={createNewSession}
        onDeleteSession={deleteSession} onRenameSession={renameSession}
        onTogglePinSession={togglePinSession} isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)} onOpenDocs={() => setIsDocsModalOpen(true)}
      />

      {isApiSetupRequired && (
          <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-500">
             <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
                <div className="w-20 h-20 bg-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto text-indigo-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Kích hoạt trợ lý với API Key cá nhân</h2>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Theo quy tắc bảo mật của hệ thống GPM AI, bạn cần cung cấp API Key từ chính tài khoản Google của mình để bắt đầu. 
                        <strong> Chúng tôi không bao giờ lưu trữ hoặc sử dụng Key mặc định của nhà phát triển.</strong>
                    </p>
                </div>
                <button
                    onClick={handleSetupApiKey}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-900/40 active:scale-95 flex items-center justify-center gap-3 group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:rotate-12 transition-transform">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                    </svg>
                    KẾT NỐI API KEY CỦA BẠN
                </button>
                <div className="space-y-3 pt-2">
                    <p className="text-[10px] text-slate-500 font-mono italic">
                        * Hộp thoại bảo mật của Google sẽ mở ra để bạn chọn Key. <br/>
                        * Hệ thống tự động sử dụng khóa này cho mọi tác vụ kịch bản.
                    </p>
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="inline-block text-[11px] text-indigo-400 hover:underline">
                        Hướng dẫn lấy API Key miễn phí & thiết lập thanh toán →
                    </a>
                </div>
             </div>
          </div>
      )}

      <div className="flex-1 flex flex-col h-full w-full relative">
        <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4 pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-slate-400 hover:text-white glass-dock rounded-xl">
              <MenuIcon />
            </button>
            <div className="flex items-center gap-3 glass-dock px-4 py-2 rounded-full backdrop-blur-md shadow-lg border border-white/5">
              <div className="md:hidden"><RobotIcon /></div>
              <h1 className="text-sm font-bold text-white truncate max-w-[150px] md:max-w-xs">{currentSession?.title || "GPM Assistant"}</h1>
            </div>

            {/* AI Mode Selector */}
            <div ref={modeSelectorRef} className="relative">
                <button onClick={() => setIsModeSelectorOpen(prev => !prev)} className="flex items-center gap-2 glass-dock pl-3 pr-2 py-1.5 rounded-full backdrop-blur-md shadow-lg border border-white/5 hover:border-cyan-400/50 transition-colors">
                    <span className="text-cyan-400">{AI_MODES[aiMode].icon}</span>
                    <span className="text-xs font-bold text-white">{AI_MODES[aiMode].name}</span>
                    <ChevronDownIcon />
                </button>
                {isModeSelectorOpen && (
                    <div className="absolute top-full mt-2 w-64 glass-panel rounded-xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2">
                        {(Object.keys(AI_MODES) as AiMode[]).map(mode => (
                            <button 
                                key={mode} 
                                onClick={() => { setAiMode(mode); setIsModeSelectorOpen(false); }}
                                className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${aiMode === mode ? 'bg-indigo-600/30' : 'hover:bg-slate-800/50'}`}
                            >
                                <span className={aiMode === mode ? 'text-indigo-300' : 'text-slate-400'}>{AI_MODES[mode].icon}</span>
                                <div>
                                    <p className={`font-bold text-sm ${aiMode === mode ? 'text-white' : 'text-slate-200'}`}>{AI_MODES[mode].name}</p>
                                    <p className="text-xs text-slate-400">{AI_MODES[mode].description}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
            
          </div>
          <div className="flex items-center gap-2 pointer-events-auto">
            <button onClick={handleExportChat} className="p-2.5 text-slate-400 hover:text-white glass-dock rounded-full border border-white/5"><DownloadIcon /></button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-2 md:px-0 pt-20 pb-44 custom-scrollbar scroll-smooth">
          {isEmptyChat ? (
             <WelcomeHero onAction={(t, tool) => tool === 'html' ? setIsHtmlModalOpen(true) : tool === 'faker' ? setIsFakerModalOpen(true) : setInputValue(t)} />
          ) : (
            <div className="max-w-4xl mx-auto space-y-8 px-4 py-6">
                {messages.slice(1).map((msg) => ( 
                <div key={msg.id} className={`flex w-full ${msg.role === Role.USER ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                    <div className={`flex gap-4 max-w-[95%] md:max-w-[85%] ${msg.role === Role.USER ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className="flex-shrink-0 mt-1 hidden md:block">
                            {msg.role === Role.USER ? <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center border border-white/10 shadow-lg shadow-cyan-500/20 text-[10px] font-bold">YOU</div> : <RobotIcon />}
                        </div>
                        <div className={`relative p-5 md:p-6 rounded-2xl shadow-xl border backdrop-blur-md group/msg transition-all w-full
                            ${msg.role === Role.USER ? 'bg-gradient-to-br from-indigo-600/80 to-blue-700/80 text-white rounded-tr-sm border-indigo-400/30' : 'glass-panel text-slate-200 rounded-tl-sm border-white/5'}
                            ${msg.isError ? 'border-red-500/50 bg-red-900/20 text-red-200' : ''}`}>
                            {editingMessageId === msg.id ? (
                                <div className="flex flex-col gap-3 min-w-[300px]">
                                    <textarea value={editedMessageContent} onChange={(e) => setEditedMessageContent(e.target.value)} className="w-full bg-slate-950 text-white p-4 rounded-xl border border-indigo-500/50 font-mono text-sm" autoFocus />
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setEditingMessageId(null)} className="px-3 py-1.5 bg-slate-700 rounded-lg text-xs font-medium"><XMarkIcon /> Hủy</button>
                                        <button onClick={() => handleSaveEdit(msg.id)} className="px-3 py-1.5 bg-green-600 rounded-lg text-xs font-medium"><CheckIcon /> Lưu & Hỏi lại</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {msg.attachedImage && <div className="mb-4 rounded-lg overflow-hidden border border-white/10 max-w-sm"><img src={`data:${msg.attachedImage.mimeType};base64,${msg.attachedImage.data}`} alt="Clip" className="w-full h-auto cursor-zoom-in" onClick={(e) => window.open((e.target as any).src, '_blank')} /></div>}
                                    <div className="prose prose-invert max-w-none"><MarkdownRenderer content={msg.text} onFixContent={handleFixContent} /></div>
                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5 text-[10px] opacity-60 font-mono">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {msg.role === Role.USER && !isThinking && <button onClick={() => startEditingMessage(msg)} className="opacity-0 group-hover/msg:opacity-100 p-1.5 hover:bg-white/10 rounded"><PencilSquareIcon /></button>}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                ))}
            </div>
          )}
          {isThinking && <div className="max-w-4xl mx-auto px-4 mt-4 animate-in fade-in"><div className="flex gap-4"><RobotIcon /><div className="glass px-6 py-4 rounded-3xl rounded-tl-none flex items-center gap-3 border border-cyan-500/20 shadow-lg shadow-cyan-900/10"><div className="flex gap-1.5"><div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}></div><div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}></div></div><span className="text-xs text-cyan-300 font-mono uppercase tracking-wider">AI Thinking...</span></div></div></div>}
          <div ref={messagesEndRef} />
        </main>

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[700px] z-40 px-4" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
          {isDragging && <div className="absolute inset-0 -top-24 bg-indigo-900/90 backdrop-blur-xl flex items-center justify-center z-50 border-2 border-dashed border-indigo-400 rounded-3xl animate-pulse shadow-2xl text-indigo-200 font-bold text-lg flex flex-col gap-2"><AttachIcon /><span>Thả file hoặc ảnh vào đây</span></div>}
          {showSlashMenu && filteredCommands.length > 0 && <div className="absolute bottom-full mb-4 w-full left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4"><div className="p-2.5 bg-slate-950/80 border-b border-slate-700 text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2"><span className="text-purple-400">⌘</span> Command Palette</div><div className="max-h-60 overflow-y-auto custom-scrollbar p-1.5">{filteredCommands.map((cmd, idx) => (<button key={idx} onClick={() => handleSelectSlashCommand(cmd)} className="w-full text-left px-3 py-2.5 hover:bg-indigo-600/20 hover:text-indigo-200 text-slate-300 flex items-center gap-3 rounded-xl transition-colors"><div className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-purple-400 group-hover:text-purple-300"><CommandIcon /></div><div><div className="font-bold text-sm text-slate-200">{cmd.label}</div><div className="text-xs opacity-60 truncate font-mono">{cmd.desc}</div></div></button>))}</div></div>}
          
          <div className="flex flex-col gap-2 mb-4 items-center">
            {attachedFile && <div className="bg-slate-800/90 border border-indigo-500/30 pl-2 pr-4 py-2 rounded-full text-sm text-indigo-300 shadow-xl flex items-center gap-3 w-fit animate-in slide-in-from-bottom-2 backdrop-blur-md"><div className="p-1.5 bg-indigo-500/20 rounded-full"><AttachIcon /></div><span className="truncate max-w-[200px] font-medium">{attachedFile.name}</span><button onClick={() => setAttachedFile(null)} className="hover:text-white transition-colors">✕</button></div>}
            {attachedImage && <div className="relative bg-slate-800/90 border border-cyan-500/30 p-1 rounded-xl shadow-2xl animate-in slide-in-from-bottom-2 backdrop-blur-md"><img src={attachedImage.preview} alt="Preview" className="w-24 h-24 object-cover rounded-lg" /><button onClick={() => setAttachedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"><XMarkIcon /></button></div>}
          </div>

          <div className="w-full relative group">
              <div className="relative flex items-end gap-2 glass-dock p-2 rounded-[32px] ring-1 ring-white/10 hover:ring-cyan-500/30 transition-all duration-300">
                <div className="flex gap-1 pb-1 pl-2">
                    <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-slate-400 hover:text-cyan-300 hover:bg-white/10 rounded-full transition-colors"><AttachIcon /></button>
                    <button onClick={() => setIsPromptLibraryOpen(true)} className="p-2.5 text-slate-400 hover:text-yellow-400 hover:bg-white/10 rounded-full transition-colors"><LightBulbIcon /></button>
                    <button onClick={() => setIsHtmlModalOpen(true)} className="p-2.5 text-slate-400 hover:text-blue-400 hover:bg-white/10 rounded-full transition-colors hidden sm:block"><CodeBracketIcon /></button>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".txt,.json,.gscript,.js,.ts,.html,.htm,image/*" />
                <textarea value={inputValue} onChange={handleInputChange} onKeyDown={handleKeyDown} onPaste={handlePaste} placeholder={isListening ? "Đang lắng nghe..." : "Dán ảnh hoặc hỏi về GPM..."} className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none py-3.5 px-3 max-h-40 resize-none custom-scrollbar min-h-[52px]" rows={1} />
                <div className="flex gap-2 pb-1 pr-2">
                    <button onClick={handleVoiceInput} className={`p-2.5 rounded-full transition-all ${isListening ? 'text-rose-500 bg-rose-500/10 animate-pulse' : 'text-slate-400 hover:text-rose-400 hover:bg-white/10'}`}><MicrophoneIcon isListening={isListening} /></button>
                    <button onClick={handleSendMessage} disabled={(!inputValue.trim() && !attachedFile && !attachedImage) || isThinking} className="p-2.5 bg-gradient-to-tr from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:from-slate-800 disabled:opacity-50 text-white rounded-full shadow-lg shadow-cyan-500/20 active:scale-95 flex items-center justify-center border border-white/10"><SendIcon /></button>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}