import React, { useState, useRef, useEffect } from 'react';
import { streamChatResponse } from './services/geminiService';
import { Message, Role, ChatSession } from './types';
import { INITIAL_GREETING } from './constants';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { ChatHistorySidebar } from './components/ChatHistorySidebar';
import { HtmlAnalysisModal } from './components/HtmlAnalysisModal';

// Icons
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

const RobotIcon = () => (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
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

// Helper to sort sessions: Pinned first, then by date descending
const sortSessions = (sessions: ChatSession[]) => {
  return [...sessions].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.lastMessageAt.getTime() - a.lastMessageAt.getTime();
  });
};

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{name: string, content: string} | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHtmlModalOpen, setIsHtmlModalOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load sessions from local storage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('gpm_chat_sessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        // Convert timestamp strings back to Date objects and ensure isPinned exists
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

  // Save sessions to local storage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('gpm_chat_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [sessions, currentSessionId, isThinking]);

  const scrollToBottom = () => {
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
    
    setSessions(prev => {
        // Insert new session after pinned sessions but before other unpinned sessions
        // Or simpler: just add and resort
        return sortSessions([newSession, ...prev]);
    });
    setCurrentSessionId(newSession.id);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the session when clicking delete
    
    // Check if we are deleting the current session
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
    localStorage.setItem('gpm_chat_sessions', JSON.stringify(newSessions)); // Force update storage
    
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
                return {
                ...s,
                messages: newMessages,
                lastMessageAt: new Date()
                };
            }
            return s;
        });
        return sortSessions(updated);
    });
  };

  const updateSessionTitle = (sessionId: string, firstUserMessage: string) => {
    setSessions(prev => prev.map(s => {
      // Only auto-rename if it's the default title
      if (s.id === sessionId && s.title === 'Đoạn chat mới') {
        const title = firstUserMessage.slice(0, 30) + (firstUserMessage.length > 30 ? '...' : '');
        return { ...s, title };
      }
      return s;
    }));
  };

  // Logic xử lý đọc file
  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setAttachedFile({
        name: file.name,
        content: content
      });
    };
    reader.readAsText(file);
  };

  // Xử lý sự kiện onChange của input file
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processFile(file);
    event.target.value = '';
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only reset if leaving the container, not entering a child
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  // Core Send Logic
  const sendChatMessage = async (text: string, file: {name: string, content: string} | null) => {
    if (!currentSessionId) return;

    // 1. Add User Message
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
      // 2. Prepare Model Placeholder
      const botMsgId = (Date.now() + 1).toString();
      const messagesWithBotPlaceholder = [
        ...updatedMessages,
        { id: botMsgId, role: Role.MODEL, text: '', timestamp: new Date() }
      ];
      updateCurrentSessionMessages(messagesWithBotPlaceholder);

      // 3. Stream Response
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
                text: "Tôi gặp lỗi khi kết nối với máy chủ. Vui lòng kiểm tra API key hoặc kết nối internet.",
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

  const handleHtmlSubmit = (html: string) => {
    const analysisPrompt = `Hãy phân tích đoạn mã HTML sau và tạo bảng XPath chuẩn cho các phần tử quan trọng:\n\n\`\`\`html\n${html}\n\`\`\``;
    sendChatMessage(analysisPrompt, null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full bg-slate-900 overflow-hidden">
      {/* Html Analysis Modal */}
      <HtmlAnalysisModal 
        isOpen={isHtmlModalOpen} 
        onClose={() => setIsHtmlModalOpen(false)} 
        onAnalyze={handleHtmlSubmit}
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
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 backdrop-blur-md border-b border-slate-700/50 flex-shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg"
          >
            <MenuIcon />
          </button>
          
          <div className="flex items-center gap-3">
              <RobotIcon />
            <div className="min-w-0">
              <h1 className="text-base md:text-lg font-bold text-white tracking-tight truncate flex items-center gap-2">
                {currentSession?.title || "Trợ lý GPM"}
                {currentSession?.isPinned && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-blue-400">
                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z" clipRule="evenodd" />
                    </svg>
                )}
              </h1>
              <p className="text-[10px] md:text-xs text-slate-400 truncate">
                Chuyên gia Tự động hóa & Xử lý lỗi
              </p>
            </div>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto px-2 md:px-6 py-4 custom-scrollbar scroll-smooth">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full ${msg.role === Role.USER ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[90%] md:max-w-[80%] ${msg.role === Role.USER ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {/* Avatar */}
                  <div className="flex-shrink-0 mt-1 hidden md:block">
                    {msg.role === Role.USER ? (
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                          <span className="text-xs font-bold text-slate-300">BẠN</span>
                      </div>
                    ) : (
                      <RobotIcon />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`relative p-3 md:p-4 rounded-2xl shadow-sm overflow-hidden ${
                      msg.role === Role.USER
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                    } ${msg.isError ? 'border-red-500 bg-red-900/20 text-red-200' : ''}`}
                  >
                    <MarkdownRenderer content={msg.text} />
                    
                    {/* Timestamp */}
                    <div className={`text-[10px] mt-2 opacity-60 ${msg.role === Role.USER ? 'text-blue-200' : 'text-slate-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex justify-start w-full">
                <div className="flex gap-3">
                   <div className="hidden md:block"><RobotIcon /></div>
                  <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-700 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input Area */}
        <footer 
            className={`p-3 md:p-4 bg-slate-900 border-t border-slate-800 flex-shrink-0 z-10 transition-colors duration-200 relative ${isDragging ? 'bg-slate-800 border-blue-500' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
          {/* Overlay for Drop */}
          {isDragging && (
            <div className="absolute inset-0 bg-blue-600/10 backdrop-blur-sm flex items-center justify-center z-50 border-2 border-dashed border-blue-500 rounded-t-xl">
              <div className="text-blue-400 font-bold text-lg pointer-events-none animate-pulse">
                Thả file vào đây để đính kèm
              </div>
            </div>
          )}

          <div className="max-w-4xl mx-auto">
            {attachedFile && (
              <div className="flex items-center gap-2 mb-2 bg-slate-800 px-3 py-1.5 rounded-lg w-fit text-sm text-blue-300 border border-blue-900/50">
                  <span className="truncate max-w-[200px]">{attachedFile.name}</span>
                  <button 
                      onClick={() => setAttachedFile(null)}
                      className="hover:text-red-400 ml-1"
                  >
                      ✕
                  </button>
              </div>
            )}

            <div className="relative flex items-end gap-2 bg-slate-800 p-2 rounded-xl border border-slate-700 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
                  title="Đính kèm tệp (.gscript, .txt, .html)"
                >
                  <AttachIcon />
                </button>
                <button 
                  onClick={() => setIsHtmlModalOpen(true)}
                  className="p-2.5 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
                  title="Phân tích HTML & Tạo XPath"
                >
                  <CodeBracketIcon />
                </button>
              </div>

              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
                accept=".txt,.json,.gscript,.js,.ts,.html,.htm"
              />

              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi vấn đề, hoặc kéo thả file/HTML vào đây..."
                className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none py-3 max-h-32 resize-none custom-scrollbar min-h-[44px]"
                rows={1}
              />

              <button
                onClick={handleSendMessage}
                disabled={(!inputValue.trim() && !attachedFile) || isThinking}
                className="p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg shadow-lg transition-all active:scale-95 flex-shrink-0 h-fit self-end"
              >
                <SendIcon />
              </button>
            </div>
             <div className="text-center mt-2">
                <p className="text-[10px] text-slate-500">
                    GPM Automate Assistant có thể đưa ra thông tin không chính xác.
                </p>
              </div>
          </div>
        </footer>
      </div>
    </div>
  );
}