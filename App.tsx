
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
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-yellow-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-1.94c.413-.002.827-.006 1.241-.012.352-.005.696-.01 1.037-.015a6.45 6.45 0 10-4.556 0c.34.005.685.01 1.037.015.414.006.828.01 1.241.012V18zm0 0a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zM12 9a3.75 3.75 0 00-3.75 3.75c0 .605.156 1.17.433 1.666.234.417.46.903.46 1.498v.487a.75.75 0 01-1.5 0v-.487c0-.986-.345-1.764-.704-2.404A5.25 5.25 0 1115.704 15.8c-.36.64-.704 1.418-.704 2.404v.487a.75.75 0 01-1.5 0v-.487c0-.595.226-1.08.46-1.498A3.75 3.75 0 0012 9z" />
  </svg>
);

const MicrophoneIcon = ({ isListening }: { isListening: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill={isListening ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${isListening ? 'text-red-500 animate-pulse' : ''}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const RobotIcon = () => (
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 border border-white/10">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
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
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-purple-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
  </svg>
);

// --- Constants & Configs ---
const NODE_COMMANDS = [
  { label: '/click', desc: 'Click vào phần tử', value: 'Hướng dẫn sử dụng Node Click trong GPM' },
  { label: '/type', desc: 'Nhập văn bản (Type Text)', value: 'Cách dùng Node Type Text' },
  { label: '/open', desc: 'Mở trình duyệt (Open Browser)', value: 'Cấu hình Node Open Browser' },
  { label: '/http', desc: 'Gửi HTTP Request', value: 'Hướng dẫn Node HTTP Request' },
  { label: '/readexcel', desc: 'Đọc file Excel', value: 'Cách đọc dữ liệu từ Excel (Read Excel File)' },
  { label: '/writeexcel', desc: 'Ghi file Excel', value: 'Cách ghi dữ liệu vào Excel (Write Excel File)' },
  { label: '/wait', desc: 'Chờ đợi (Wait/Delay)', value: 'Sử dụng Node Wait/Delay' },
  { label: '/if', desc: 'Điều kiện (If Block)', value: 'Cấu hình IfBlockNode' },
  { label: '/loop', desc: 'Vòng lặp (For Loop)', value: 'Cách dùng ForBlockNode' },
  { label: '/script', desc: 'Chạy Javascript', value: 'Hướng dẫn Node Javascript Execute' },
  { label: '/scroll', desc: 'Cuộn trang', value: 'Cách dùng Node Scroll' },
  { label: '/gettext', desc: 'Lấy nội dung (Get Text)', value: 'Hướng dẫn Node Get Text' },
  { label: '/split', desc: 'Tách chuỗi (Split Text)', value: 'Cách dùng Split Text' },
  { label: '/count', desc: 'Đếm phần tử (Count)', value: 'Hướng dẫn Node Count' },
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
            desc: "Tạo XPath chuẩn từ mã HTML",
            action: () => onAction('', 'html')
        },
        {
            icon: <DiceIcon />,
            title: "Tạo dữ liệu giả",
            desc: "Random tên, email, sđt...",
            action: () => onAction('', 'faker')
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-400"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            title: "Debug lỗi",
            desc: "Giải thích tại sao kịch bản dừng",
            action: () => onAction("Kịch bản của tôi đang bị lỗi dừng đột ngột, hãy hướng dẫn tôi cách debug (tìm lỗi) chi tiết.")
        },
        {
            icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-400"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
            title: "Viết kịch bản",
            desc: "Login, Đọc Excel, Xử lý data",
            action: () => onAction("Hãy hướng dẫn tôi viết kịch bản đăng nhập vào một trang web và đọc dữ liệu từ file Excel.")
        }
    ];

    return (
        <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto px-4 animate-fade-in-up pb-20">
            <div className="mb-8 relative">
                 <div className="absolute -inset-4 bg-indigo-500/20 blur-xl rounded-full animate-pulse-slow"></div>
                 <RobotIcon />
            </div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-3 text-center tracking-tight">
                Trợ lý GPM Automate
            </h2>
            <p className="text-slate-400 text-center mb-10 max-w-lg leading-relaxed">
                Tôi có thể giúp bạn thiết kế luồng tự động hóa, tạo XPath chuẩn, phân tích lỗi và tạo dữ liệu giả lập.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {cards.map((card, idx) => (
                    <button 
                        key={idx}
                        onClick={card.action}
                        className="group flex items-start gap-4 p-4 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 hover:border-indigo-500/50 transition-all text-left shadow-lg hover:shadow-indigo-500/10"
                    >
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 group-hover:border-indigo-500/50 group-hover:bg-indigo-500/10 transition-colors">
                            {card.icon}
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-200 group-hover:text-white text-sm mb-1">{card.title}</h3>
                            <p className="text-xs text-slate-500 group-hover:text-slate-400">{card.desc}</p>
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

      const historyContext = updatedMessages.slice(-10);
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
       setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
             const newMsgs = [...s.messages, { 
                id: Date.now().toString(), 
                role: Role.MODEL, 
                text: "Tôi gặp lỗi khi kết nối với máy chủ. Vui lòng kiểm tra API Key hoặc mạng.",
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
        setSessions(prev => prev.map(s => {
            if (s.id === currentSessionId) {
                const newMsgs = [...s.messages, { 
                    id: Date.now().toString(), 
                    role: Role.MODEL, 
                    text: "Lỗi khi tạo lại câu trả lời.", 
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
        prompt = `Sơ đồ Mermaid sau đây bị lỗi render. Hãy sửa lại cú pháp (chú ý escaping, dấu ngoặc kép, và ID không chứa ký tự lạ). Trả về code đã sửa:\n\n\`\`\`mermaid\n${content}\n\`\`\``;
    } else {
        prompt = `Nội dung hướng dẫn sau đây bị lỗi định dạng (thường do thiếu dòng trống trước/sau block ':::'). Hãy định dạng lại Markdown chuẩn xác để hiển thị đúng các khối Collapsible:\n\n${content}`;
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
          // Optional: Auto send
          // sendChatMessage(text, null);
      }
  };

  const filteredCommands = NODE_COMMANDS.filter(c => 
    c.label.toLowerCase().includes(slashQuery.toLowerCase()) || 
    c.desc.toLowerCase().includes(slashQuery.toLowerCase())
  );

  const isEmptyChat = messages.length <= 1;

  return (
    <div className="flex h-full bg-slate-950 overflow-hidden text-slate-100 font-sans">
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
        {/* Header - Glassmorphic */}
        <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 md:px-6 md:py-4 bg-slate-900/50 backdrop-blur-md border-b border-white/5 transition-all">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg transition-colors">
              <MenuIcon />
            </button>
            <div className="flex items-center gap-3">
              <div className="md:hidden"><RobotIcon /></div>
              <div className="min-w-0">
                <h1 className="text-base md:text-lg font-bold text-white tracking-tight truncate flex items-center gap-2">
                  {currentSession?.title || "Trợ lý GPM"}
                  {currentSession?.isPinned && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-indigo-400">
                      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z" clipRule="evenodd" />
                    </svg>
                  )}
                </h1>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
                onClick={handleExportChat}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Xuất nội dung chat"
            >
                <DownloadIcon />
            </button>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto px-2 md:px-0 pt-20 pb-40 custom-scrollbar scroll-smooth">
          {isEmptyChat ? (
             <WelcomeHero onAction={handleWelcomeAction} />
          ) : (
            <div className="max-w-4xl mx-auto space-y-8 px-4">
                {messages.slice(1).map((msg) => ( // Skip initial greeting in rendered list to look cleaner if desired, or keep it. Let's keep it but styling differs.
                <div key={msg.id} className={`flex w-full ${msg.role === Role.USER ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`flex gap-4 max-w-[95%] md:max-w-[85%] ${msg.role === Role.USER ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* Avatar */}
                    <div className="flex-shrink-0 mt-1 hidden md:block">
                        {msg.role === Role.USER ? (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="text-[10px] font-bold text-white">YOU</span>
                        </div>
                        ) : <RobotIcon />}
                    </div>

                    {/* Message Content Bubble */}
                    <div className={`relative p-4 md:p-5 rounded-2xl shadow-sm overflow-hidden group/msg transition-all w-full
                        ${msg.role === Role.USER 
                            ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-tr-sm shadow-indigo-500/10' 
                            : 'bg-slate-800/60 text-slate-200 rounded-tl-sm border border-slate-700/50 backdrop-blur-sm'} 
                        ${msg.isError ? 'border-red-500/50 bg-red-900/10 text-red-200' : ''}
                    `}>
                        
                        {/* Editing Mode */}
                        {editingMessageId === msg.id ? (
                        <div className="flex flex-col gap-3 w-full min-w-[300px]">
                            <textarea
                            value={editedMessageContent}
                            onChange={(e) => setEditedMessageContent(e.target.value)}
                            className="w-full bg-slate-900/80 text-white p-3 rounded-lg border border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-400 text-sm resize-y min-h-[100px]"
                            autoFocus
                            />
                            <div className="flex justify-end gap-2">
                            <button 
                                onClick={cancelEditingMessage}
                                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-md text-xs font-medium transition-colors flex items-center gap-1"
                                >
                                <XMarkIcon /> Hủy
                                </button>
                                <button 
                                onClick={() => handleSaveEdit(msg.id)}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-md text-xs font-medium transition-colors flex items-center gap-1 shadow-lg shadow-green-900/20"
                                >
                                <CheckIcon /> Lưu & Hỏi lại
                                </button>
                            </div>
                        </div>
                        ) : (
                        <>
                            <div className="prose prose-invert max-w-none">
                                <MarkdownRenderer 
                                    content={msg.text} 
                                    onFixContent={handleFixContent}
                                />
                            </div>
                            
                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                                <div className={`text-[10px] opacity-50 font-mono ${msg.role === Role.USER ? 'text-indigo-100' : 'text-slate-400'}`}>
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
              <div className="max-w-4xl mx-auto px-4 mt-6 animate-pulse">
                <div className="flex gap-4">
                   <div className="hidden md:block"><RobotIcon /></div>
                   <div className="bg-slate-800/50 p-4 rounded-2xl rounded-tl-none border border-slate-700/50 flex items-center gap-2 w-fit">
                    <div className="text-xs text-indigo-300 font-mono">Đang phân tích...</div>
                    <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
        </main>

        {/* Input Dock - Floating Design */}
        <div 
            className={`absolute bottom-0 left-0 right-0 p-4 md:p-6 z-30 pointer-events-none flex flex-col items-center justify-end transition-all`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
          {isDragging && (
            <div className="absolute inset-0 bg-indigo-500/10 backdrop-blur-sm flex items-center justify-center z-50 border-2 border-dashed border-indigo-500 rounded-t-xl pointer-events-auto">
              <div className="text-indigo-300 font-bold text-lg pointer-events-none animate-pulse flex flex-col items-center gap-2">
                 <AttachIcon />
                 <span>Thả file vào đây để phân tích</span>
              </div>
            </div>
          )}

          {/* Slash Menu */}
          {showSlashMenu && filteredCommands.length > 0 && (
             <div className="pointer-events-auto mb-2 w-full max-w-2xl bg-slate-800/90 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
                <div className="p-2 bg-slate-900/50 border-b border-slate-700 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Gợi ý lệnh (Dùng phím mũi tên)
                </div>
                <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                    {filteredCommands.map((cmd, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSelectSlashCommand(cmd)}
                            className="w-full text-left px-3 py-2 hover:bg-indigo-600/20 hover:text-indigo-200 text-slate-300 flex items-center gap-3 transition-colors rounded-lg group"
                        >
                            <div className="p-1.5 bg-slate-900 border border-slate-700 rounded text-purple-400 group-hover:border-purple-500/50">
                                <CommandIcon />
                            </div>
                            <div>
                                <div className="font-bold text-sm text-slate-200 group-hover:text-purple-300">{cmd.label}</div>
                                <div className="text-xs opacity-60 truncate">{cmd.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>
             </div>
          )}
          
          {attachedFile && (
              <div className="pointer-events-auto mb-2 bg-slate-800/90 border border-indigo-500/30 px-4 py-2 rounded-lg text-sm text-indigo-300 shadow-lg flex items-center gap-3 w-fit max-w-2xl animate-in slide-in-from-bottom-2">
                  <div className="p-1 bg-indigo-500/20 rounded"><AttachIcon /></div>
                  <span className="truncate max-w-[200px] font-medium">{attachedFile.name}</span>
                  <button onClick={() => setAttachedFile(null)} className="hover:bg-slate-700 p-1 rounded-full text-slate-400 hover:text-white transition-colors">✕</button>
              </div>
          )}

          <div className="pointer-events-auto w-full max-w-4xl relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
              
              <div className="relative flex items-end gap-2 bg-slate-900/90 backdrop-blur-xl p-2 rounded-2xl border border-slate-700/50 shadow-2xl">
                
                {/* Tools - Left */}
                <div className="flex gap-1 pb-1 pl-1">
                    <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-xl transition-colors" title="Đính kèm">
                        <AttachIcon />
                    </button>
                    <button onClick={() => setIsPromptLibraryOpen(true)} className="p-2.5 text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-xl transition-colors" title="Thư viện mẫu">
                        <LightBulbIcon />
                    </button>
                    <button onClick={() => setIsHtmlModalOpen(true)} className="p-2.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-colors hidden md:block" title="Phân tích HTML">
                        <CodeBracketIcon />
                    </button>
                    <button onClick={() => setIsFakerModalOpen(true)} className="p-2.5 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-xl transition-colors hidden md:block" title="Dữ liệu giả">
                        <DiceIcon />
                    </button>
                </div>

                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".txt,.json,.gscript,.js,.ts,.html,.htm" />

                <textarea
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? "Đang lắng nghe..." : "Gõ '/' để dùng lệnh, hoặc nhập câu hỏi..."}
                    className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none py-3.5 px-2 max-h-40 resize-none custom-scrollbar min-h-[52px]"
                    rows={1}
                />

                {/* Actions - Right */}
                <div className="flex gap-2 pb-1 pr-1">
                    <button onClick={handleVoiceInput} className={`p-2.5 rounded-xl transition-all ${isListening ? 'text-red-500 bg-red-500/10 animate-pulse' : 'text-slate-400 hover:text-red-400 hover:bg-slate-800'}`} title="Giọng nói">
                        <MicrophoneIcon isListening={isListening} />
                    </button>
                    <button
                        onClick={handleSendMessage}
                        disabled={(!inputValue.trim() && !attachedFile) || isThinking}
                        className="p-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-700 disabled:to-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
                    >
                        <SendIcon />
                    </button>
                </div>
            </div>
             <div className="text-center mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <p className="text-[10px] text-slate-500 font-mono tracking-wide">AI có thể mắc lỗi. Hãy kiểm tra lại thông tin quan trọng.</p>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
