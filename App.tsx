import React, { useState, useRef, useEffect } from 'react';
import { streamChatResponse } from './services/geminiService';
import { Message, Role, ChatSession } from './types';
import { INITIAL_GREETING } from './constants';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { ChatHistorySidebar } from './components/ChatHistorySidebar';
import { HtmlAnalysisModal } from './components/HtmlAnalysisModal';
import { PromptLibraryModal } from './components/PromptLibraryModal';
import { FakerGeneratorModal } from './components/FakerGeneratorModal';

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

// --- Constants & Configs ---
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Modals
  const [isHtmlModalOpen, setIsHtmlModalOpen] = useState(false);
  const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState(false);
  const [isFakerModalOpen, setIsFakerModalOpen] = useState(false);
  
  const [isListening, setIsListening] = useState(false);
  
  // Editing Message State
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedMessageContent, setEditedMessageContent] = useState('');

  // Slash Command State
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null); 

  // --- Effects & Logic ---

  useEffect(() => {
    const savedSessions = localStorage.getItem('gpm_chat_sessions');
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
        
        if (sortedSessions.length > 0) {
          setCurrentSessionId(sortedSessions[0].id);
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

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('gpm_chat_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    scrollToBottom();
  }, [sessions, currentSessionId, isThinking]);

  // Speech Recognition
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

      recognitionRef.current.onerror = (event: any) => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const scrollToBottom = () => {
    if (editingMessageId) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
    
    setSessions(prev => sortSessions([newSession, ...prev]));
    setCurrentSessionId(newSession.id);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let nextSessionId = currentSessionId;
    if (currentSessionId === id) {
       const remaining = sessions.filter(s => s.id !== id);
       if (remaining.length > 0) {
           nextSessionId = remaining[0].id;
       } else {
           nextSessionId = null;
       }
    }
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    localStorage.setItem('gpm_chat_sessions', JSON.stringify(newSessions));
    
    if (!nextSessionId && newSessions.length === 0) {
        createNewSession();
    } else if (nextSessionId !== currentSessionId) {
        setCurrentSessionId(nextSessionId);
    }
  };

  const togglePinSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => {
        const updated = prev.map(s => s.id === id ? { ...s, isPinned: !s.isPinned } : s);
        return sortSessions(updated);
    });
  };

  const renameSession = (id: string, newTitle: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
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
        return sortSessions(updated);
    });
  };

  const updateSessionTitle = (sessionId: string, firstUserMessage: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId && s.title === 'Đoạn chat mới') {
        const title = firstUserMessage.slice(0, 30) + (firstUserMessage.length > 30 ? '...' : '');
        return { ...s, title };
      }
      return s;
    }));
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setAttachedFile({ name: file.name, content: content });
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processFile(file);
    event.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const sendChatMessage = async (text: string, file: {name: string, content: string} | null) => {
    if (!currentSessionId) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: file ? `${text}\n\n[Tệp đính kèm: ${file.name}]` : text,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMsg];
    updateCurrentSessionMessages(updatedMessages);
    updateSessionTitle(currentSessionId, text || file?.name || "Tin nhắn");
    
    setIsThinking(true);

    try {
      const botMsgId = (Date.now() + 1).toString();
      const messagesWithBotPlaceholder = [
        ...updatedMessages,
        { id: botMsgId, role: Role.MODEL, text: '', timestamp: new Date() }
      ];
      updateCurrentSessionMessages(messagesWithBotPlaceholder);

      // Fix: Use 'messages' (past history) instead of 'updatedMessages' (which includes current userMsg).
      // This prevents the current message from being duplicated in the history sent to Gemini.
      const historyContext = messages.slice(-10); 
      const stream = await streamChatResponse(historyContext, text, file?.content);

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
    } catch (error) {
       console.error(error);
       setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
             const newMsgs = [...s.messages, { 
                id: Date.now().toString(), 
                role: Role.MODEL, 
                text: "Tôi gặp lỗi khi kết nối hoặc nội dung quá dài (Token Limit). Vui lòng thử lại với nội dung ngắn hơn.",
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
    if ((!inputValue.trim() && !attachedFile) || isThinking) return;
    sendChatMessage(inputValue, attachedFile);
    setInputValue('');
    setAttachedFile(null);
  };

  const startEditingMessage = (msg: Message) => {
    setEditingMessageId(msg.id);
    setEditedMessageContent(msg.text);
  };

  const cancelEditingMessage = () => {
    setEditingMessageId(null);
    setEditedMessageContent('');
  };

  const handleSaveEdit = async (messageId: string) => {
    if (!currentSessionId || !editedMessageContent.trim()) return;

    const session = sessions.find(s => s.id === currentSessionId);
    if (!session) return;
    const msgIndex = session.messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;

    const updatedUserMsg: Message = {
        ...session.messages[msgIndex],
        text: editedMessageContent,
        timestamp: new Date()
    };
    
    const newHistory = [
        ...session.messages.slice(0, msgIndex),
        updatedUserMsg
    ];

    updateCurrentSessionMessages(newHistory);
    setEditingMessageId(null);
    setEditedMessageContent('');
    setIsThinking(true);

    try {
        const botMsgId = (Date.now() + 1).toString();
        const messagesWithBotPlaceholder = [
            ...newHistory,
            { id: botMsgId, role: Role.MODEL, text: '', timestamp: new Date() }
        ];
        updateCurrentSessionMessages(messagesWithBotPlaceholder);
        const contextForStream = newHistory.slice(0, -1).slice(-10); 
        const stream = await streamChatResponse(contextForStream, updatedUserMsg.text, null);
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
    } catch (error) {
        console.error(error);
        setSessions(prev => prev.map(s => {
            if (s.id === currentSessionId) {
                const newMsgs = [...s.messages, { 
                    id: Date.now().toString(), 
                    role: Role.MODEL, 
                    text: "Lỗi khi tạo lại câu trả lời hoặc vượt quá giới hạn token.", 
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

  const handleHtmlSubmit = (html: string) => {
    const analysisPrompt = `Hãy phân tích đoạn mã HTML sau và tạo bảng XPath chuẩn cho các phần tử quan trọng:\n\n\`\`\`html\n${html}\n\`\`\``;
    sendChatMessage(analysisPrompt, null);
  };

  const handlePromptSelect = (prompt: string) => {
    setInputValue(prompt);
  };

  const handleFixContent = (content: string) => {
    const isMermaid = /^\s*(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|journey|gitGraph|mindmap|timeline)/.test(content);
    let prompt = '';
    
    if (isMermaid && !content.includes(':::')) {
        prompt = `Phân tích code Mermaid sau và sửa các lỗi Parsing/Syntax/Cycle Error.

CODE CẦN SỬA:
\`\`\`mermaid
${content}
\`\`\`

YÊU CẦU SỬA LỖI BẮT BUỘC:
1. **XÓA SỐ THỨ TỰ**: Loại bỏ hoàn toàn các số thứ tự dạng \`1.\`, \`2.\` hoặc các dấu gạch đầu dòng ở đầu mỗi dòng code.
2. **SỬA LỖI CYCLE (Parent-Child)**:
   - Nếu \`subgraph A\` chứa node \`A\`, đây là lỗi Cycle.
   - **Cách sửa:** Đổi ID Subgraph thành tên khác (ví dụ: \`subgraph Grp_A\`).
3. **CÚ PHÁP ID & KẾT NỐI**:
   - ID Node TUYỆT ĐỐI KHÔNG chứa khoảng trắng. Nếu thấy (VD: \`Gr NodeA\`), hãy xóa phần thừa hoặc nối lại (\`NodeA\`).
   - Kiểm tra các mũi tên \`-->\`, đảm bảo phía sau là ID hợp lệ, không có ký tự rác.
4. **LỖI KÝ TỰ ĐẶC BIỆT (Parse Error)**:
   - Nếu nội dung hiển thị (trong dấu []) chứa ký tự đặc biệt như \`()\`, \`:\`, \`[]\`, \`.\` (ví dụ: \`NodeA[Data (Body): json]\`), BẮT BUỘC phải bọc trong ngoặc kép.
   - **Cách sửa:** \`NodeA["Data (Body): json"]\`.

TRẢ VỀ:
- Chỉ trả về block code Mermaid đã sửa.
- KHÔNG giải thích.`;
    } else {
        prompt = `Nội dung hướng dẫn sau đây bị lỗi định dạng Markdown. Hãy định dạng lại chuẩn xác:\n\n${content}`;
    }
    sendChatMessage(prompt, null);
  };

  const handleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        setIsListening(true);
        recognitionRef.current.start();
      } else {
        alert("Trình duyệt của bạn không hỗ trợ tính năng nhận diện giọng nói.");
      }
    }
  };

  const handleExportChat = () => {
    if (!currentSession) return;
    const content = currentSession.messages.map(m => 
      `[${m.role === Role.USER ? 'USER' : 'BOT'} - ${new Date(m.timestamp).toLocaleString()}]\n${m.text}\n`
    ).join('\n-------------------\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GPM_Chat_Export_${currentSession.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputValue(val);
    const match = val.match(/(?:^|\s)\/([a-zA-Z0-9]*)$/);
    if (match) {
      setSlashQuery(match[1]);
      setShowSlashMenu(true);
    } else {
      setShowSlashMenu(false);
    }
  };

  const handleSelectSlashCommand = (cmd: { value: string }) => {
    if (cmd.value === '/faker') {
        setIsFakerModalOpen(true);
        setShowSlashMenu(false);
        const newVal = inputValue.replace(/(?:^|\s)\/faker$/, '');
        setInputValue(newVal.trim());
        return;
    }
    const newVal = inputValue.replace(/(?:^|\s)\/([a-zA-Z0-9]*)$/, (match) => {
        return match.startsWith(' ') ? ' ' + cmd.value : cmd.value;
    });
    setInputValue(newVal);
    setShowSlashMenu(false);
  };

  const handleFakerInsert = (text: string) => {
    setInputValue(prev => prev + (prev ? '\n' : '') + text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showSlashMenu) {
        if (filteredCommands.length > 0) {
            handleSelectSlashCommand(filteredCommands[0]);
            return;
        }
        setShowSlashMenu(false);
      }
      handleSendMessage();
    }
    if (e.key === 'Escape') {
        setShowSlashMenu(false);
    }
  };

  const handleWelcomeAction = (text: string, isTool?: string) => {
      if (isTool === 'html') {
          setIsHtmlModalOpen(true);
      } else if (isTool === 'faker') {
          setIsFakerModalOpen(true);
      } else {
          setInputValue(text);
      }
  };

  const filteredCommands = NODE_COMMANDS.filter(c => 
    c.label.toLowerCase().includes(slashQuery.toLowerCase()) || 
    c.desc.toLowerCase().includes(slashQuery.toLowerCase())
  );

  const isEmptyChat = messages.length <= 1;

  return (
    <div className="flex h-full bg-transparent overflow-hidden text-slate-100 font-sans">
      {/* Modals */}
      <HtmlAnalysisModal 
        isOpen={isHtmlModalOpen} 
        onClose={() => setIsHtmlModalOpen(false)} 
        onAnalyze={handleHtmlSubmit}
      />
      <PromptLibraryModal 
        isOpen={isPromptLibraryOpen}
        onClose={() => setIsPromptLibraryOpen(false)}
        onSelectPrompt={handlePromptSelect}
        messages={messages}
      />
      <FakerGeneratorModal
        isOpen={isFakerModalOpen}
        onClose={() => setIsFakerModalOpen(false)}
        onInsert={handleFakerInsert}
      />

      {/* Sidebar */}
      <ChatHistorySidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onCreateSession={createNewSession}
        onDeleteSession={deleteSession}
        onRenameSession={renameSession}
        onTogglePinSession={togglePinSession}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full w-full relative">
        {/* Header - Transparent Floating */}
        <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4 pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-slate-400 hover:text-white glass-dock rounded-xl transition-colors">
              <MenuIcon />
            </button>
            <div className="flex items-center gap-3 glass-dock px-4 py-2 rounded-full backdrop-blur-md shadow-lg border border-white/5">
              <div className="md:hidden"><RobotIcon /></div>
              <div className="min-w-0 max-w-[150px] md:max-w-xs">
                <h1 className="text-sm font-bold text-white tracking-tight truncate flex items-center gap-2">
                  {currentSession?.title || "GPM Assistant"}
                  {currentSession?.isPinned && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-cyan-400">
                      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z" clipRule="evenodd" />
                    </svg>
                  )}
                </h1>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 pointer-events-auto">
            <button 
                onClick={handleExportChat}
                className="p-2.5 text-slate-400 hover:text-white glass-dock rounded-full transition-colors hover:bg-slate-800 border border-white/5"
                title="Xuất nội dung chat"
            >
                <DownloadIcon />
            </button>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto px-2 md:px-0 pt-20 pb-44 custom-scrollbar scroll-smooth">
          {isEmptyChat ? (
             <WelcomeHero onAction={handleWelcomeAction} />
          ) : (
            <div className="max-w-4xl mx-auto space-y-8 px-4 py-6">
                {messages.slice(1).map((msg) => ( 
                <div key={msg.id} className={`flex w-full ${msg.role === Role.USER ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                    <div className={`flex gap-4 max-w-[95%] md:max-w-[85%] ${msg.role === Role.USER ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* Avatar */}
                    <div className="flex-shrink-0 mt-1 hidden md:block">
                        {msg.role === Role.USER ? (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-white/10 ring-1 ring-white/10">
                            <span className="text-[10px] font-bold text-white tracking-widest">YOU</span>
                        </div>
                        ) : <RobotIcon />}
                    </div>

                    {/* Message Content Bubble */}
                    <div className={`relative p-5 md:p-6 rounded-2xl shadow-xl overflow-hidden group/msg transition-all w-full border backdrop-blur-md
                        ${msg.role === Role.USER 
                            ? 'bg-gradient-to-br from-indigo-600/80 to-blue-700/80 text-white rounded-tr-sm border-indigo-400/30 shadow-[0_5px_15px_rgba(79,70,229,0.3)]' 
                            : 'glass-panel text-slate-200 rounded-tl-sm border-white/5'} 
                        ${msg.isError ? 'border-red-500/50 bg-red-900/20 text-red-200' : ''}
                    `}>
                        
                        {/* Editing Mode */}
                        {editingMessageId === msg.id ? (
                        <div className="flex flex-col gap-3 w-full min-w-[300px]">
                            <textarea
                            value={editedMessageContent}
                            onChange={(e) => setEditedMessageContent(e.target.value)}
                            className="w-full bg-slate-900/80 text-white p-4 rounded-xl border border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-400 text-sm resize-y min-h-[100px] shadow-inner font-mono"
                            autoFocus
                            />
                            <div className="flex justify-end gap-2">
                            <button 
                                onClick={cancelEditingMessage}
                                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                                >
                                <XMarkIcon /> Hủy
                                </button>
                                <button 
                                onClick={() => handleSaveEdit(msg.id)}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shadow-lg shadow-green-900/20"
                                >
                                <CheckIcon /> Lưu & Hỏi lại
                                </button>
                            </div>
                        </div>
                        ) : (
                        <>
                            <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-950/80 prose-pre:border prose-pre:border-slate-800/80 prose-pre:backdrop-blur-sm">
                                <MarkdownRenderer 
                                    content={msg.text} 
                                    onFixContent={handleFixContent}
                                />
                            </div>
                            
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                                <div className={`text-[10px] opacity-60 font-mono ${msg.role === Role.USER ? 'text-indigo-100' : 'text-slate-500'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>

                                {/* Edit Button */}
                                {msg.role === Role.USER && !isThinking && (
                                <button 
                                    onClick={() => startEditingMessage(msg)}
                                    className="opacity-0 group-hover/msg:opacity-100 p-1.5 text-indigo-200 hover:text-white hover:bg-white/10 rounded transition-all"
                                    title="Sửa tin nhắn"
                                >
                                    <PencilSquareIcon />
                                </button>
                                )}
                            </div>
                        </>
                        )}
                    </div>
                    </div>
                </div>
                ))}
            </div>
          )}
          
          {/* Thinking Indicator */}
          {isThinking && (
              <div className="max-w-4xl mx-auto px-4 mt-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex gap-4">
                   <div className="hidden md:block"><RobotIcon /></div>
                   <div className="glass px-6 py-4 rounded-3xl rounded-tl-none flex items-center gap-3 w-fit shadow-lg shadow-cyan-900/10 border border-cyan-500/20">
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-xs text-cyan-300 font-mono uppercase tracking-wider ml-1">AI Processing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
        </main>

        {/* Floating Dock Input Area */}
        <div 
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[700px] z-40 transition-all px-4`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
          {isDragging && (
            <div className="absolute inset-0 -top-24 bg-indigo-900/90 backdrop-blur-xl flex items-center justify-center z-50 border-2 border-dashed border-indigo-400 rounded-3xl pointer-events-auto animate-pulse shadow-2xl">
              <div className="text-indigo-200 font-bold text-lg flex flex-col items-center gap-2">
                 <AttachIcon />
                 <span>Thả file vào đây để phân tích</span>
              </div>
            </div>
          )}

          {/* Slash Menu - Floating Above Dock */}
          {showSlashMenu && filteredCommands.length > 0 && (
             <div className="absolute bottom-full mb-4 w-[90%] md:w-full left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
                <div className="p-2.5 bg-slate-950/80 border-b border-slate-700/50 text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
                   <span className="text-purple-400">⌘</span> Command Palette
                </div>
                <div className="max-h-60 overflow-y-auto custom-scrollbar p-1.5">
                    {filteredCommands.map((cmd, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSelectSlashCommand(cmd)}
                            className="w-full text-left px-3 py-2.5 hover:bg-indigo-600/20 hover:text-indigo-200 text-slate-300 flex items-center gap-3 transition-colors rounded-xl group"
                        >
                            <div className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-purple-400 group-hover:border-purple-500/50 group-hover:text-purple-300 shadow-sm">
                                <CommandIcon />
                            </div>
                            <div>
                                <div className="font-bold text-sm text-slate-200 group-hover:text-purple-300">{cmd.label}</div>
                                <div className="text-xs opacity-60 truncate font-mono">{cmd.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>
             </div>
          )}
          
          {attachedFile && (
              <div className="absolute bottom-full mb-4 bg-slate-800/90 border border-indigo-500/30 pl-2 pr-4 py-2 rounded-full text-sm text-indigo-300 shadow-xl flex items-center gap-3 w-fit animate-in slide-in-from-bottom-2 mx-auto left-0 right-0 backdrop-blur-md">
                  <div className="p-1.5 bg-indigo-500/20 rounded-full text-indigo-200"><AttachIcon /></div>
                  <span className="truncate max-w-[200px] font-medium">{attachedFile.name}</span>
                  <button onClick={() => setAttachedFile(null)} className="hover:bg-slate-700 p-1 rounded-full text-slate-400 hover:text-white transition-colors">✕</button>
              </div>
          )}

          <div className="w-full relative group">
              {/* Main Dock Container */}
              <div className="relative flex items-end gap-2 glass-dock p-2 rounded-[32px] ring-1 ring-white/10 hover:ring-cyan-500/30 transition-all duration-300">
                
                {/* Tools - Left */}
                <div className="flex gap-1 pb-1 pl-2">
                    <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-slate-400 hover:text-cyan-300 hover:bg-white/10 rounded-full transition-colors" title="Đính kèm file">
                        <AttachIcon />
                    </button>
                    <button onClick={() => setIsPromptLibraryOpen(true)} className="p-2.5 text-slate-400 hover:text-yellow-400 hover:bg-white/10 rounded-full transition-colors" title="Thư viện mẫu">
                        <LightBulbIcon />
                    </button>
                    <button onClick={() => setIsHtmlModalOpen(true)} className="p-2.5 text-slate-400 hover:text-blue-400 hover:bg-white/10 rounded-full transition-colors hidden sm:block" title="Phân tích HTML">
                        <CodeBracketIcon />
                    </button>
                    <button onClick={() => setIsFakerModalOpen(true)} className="p-2.5 text-slate-400 hover:text-purple-400 hover:bg-white/10 rounded-full transition-colors hidden sm:block" title="Dữ liệu giả">
                        <DiceIcon />
                    </button>
                </div>

                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".txt,.json,.gscript,.js,.ts,.html,.htm" />

                <textarea
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? "Đang lắng nghe..." : "Hỏi về GPM Automate..."}
                    className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none py-3.5 px-3 max-h-40 resize-none custom-scrollbar min-h-[52px]"
                    rows={1}
                />

                {/* Actions - Right */}
                <div className="flex gap-2 pb-1 pr-2">
                    <button onClick={handleVoiceInput} className={`p-2.5 rounded-full transition-all ${isListening ? 'text-rose-500 bg-rose-500/10 animate-pulse' : 'text-slate-400 hover:text-rose-400 hover:bg-white/10'}`} title="Giọng nói">
                        <MicrophoneIcon isListening={isListening} />
                    </button>
                    <button
                        onClick={handleSendMessage}
                        disabled={(!inputValue.trim() && !attachedFile) || isThinking}
                        className="p-2.5 bg-gradient-to-tr from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:from-slate-800 disabled:to-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full shadow-lg shadow-cyan-500/20 transition-all active:scale-95 flex items-center justify-center border border-white/10"
                    >
                        <SendIcon />
                    </button>
                </div>
            </div>
             <div className="text-center mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden md:block">
                <p className="text-[10px] text-slate-500 font-mono tracking-wide">Nhấn '/' để mở lệnh nhanh. </p>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}