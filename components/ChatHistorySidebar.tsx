
import React, { useState, useEffect, useRef } from 'react';
import { ChatSession } from '../types';

interface ChatHistorySidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onTogglePinSession: (id: string, e: React.MouseEvent) => void;
  isOpen: boolean;
  onClose: () => void;
}

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const ChatBubbleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
  </svg>
);

const PinIcon = ({ filled }: { filled: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-green-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CancelIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-red-400">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onRenameSession,
  onTogglePinSession,
  isOpen,
  onClose
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
        inputRef.current.focus();
    }
  }, [editingId]);

  const startEditing = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const saveEditing = (id: string) => {
      if (editTitle.trim()) {
          onRenameSession(id, editTitle.trim());
      }
      setEditingId(null);
  };

  const cancelEditing = () => {
      setEditingId(null);
      setEditTitle('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
      if (e.key === 'Enter') {
          saveEditing(id);
      } else if (e.key === 'Escape') {
          cancelEditing();
      }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-30
        w-80 bg-slate-950/90 border-r border-slate-800/50 backdrop-blur-xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col shadow-2xl
      `}>
        {/* Header */}
        <div className="p-5 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">History</h2>
            </div>
            <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white transition-colors">
                <CloseIcon />
            </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={() => {
              onCreateSession();
              if (window.innerWidth < 768) onClose();
            }}
            className="group w-full flex items-center gap-3 justify-center bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-4 py-3.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-900/30 active:scale-[0.98] border border-indigo-500/50"
          >
            <PlusIcon />
            <span className="text-sm font-semibold tracking-wide">Cuộc hội thoại mới</span>
          </button>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar space-y-1">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-500 space-y-2 opacity-60">
              <ChatBubbleIcon />
              <p className="text-xs text-center">Chưa có lịch sử chat.</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => {
                    if (editingId !== session.id) {
                        onSelectSession(session.id);
                        if (window.innerWidth < 768) onClose();
                    }
                }}
                className={`
                  group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 text-sm relative border
                  ${currentSessionId === session.id 
                    ? 'bg-slate-800/60 border-slate-700 text-indigo-300 font-medium shadow-sm' 
                    : 'text-slate-400 border-transparent hover:bg-slate-800/40 hover:text-slate-200'}
                `}
              >
                {/* Editing Mode */}
                {editingId === session.id ? (
                    <div className="flex items-center w-full gap-2 animate-in fade-in duration-200">
                        <input
                            ref={inputRef}
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, session.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 bg-slate-900 text-slate-200 px-2 py-1.5 rounded-lg text-xs border border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button onClick={(e) => { e.stopPropagation(); saveEditing(session.id); }} className="p-1.5 hover:bg-indigo-500/20 text-indigo-400 rounded-md transition-colors"><CheckIcon /></button>
                        <button onClick={(e) => { e.stopPropagation(); cancelEditing(); }} className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-md transition-colors"><CancelIcon /></button>
                    </div>
                ) : (
                    <>
                        <div className={`flex-shrink-0 transition-colors ${currentSessionId === session.id ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-500'}`}>
                             {session.isPinned ? <PinIcon filled={true} /> : <ChatBubbleIcon />}
                        </div>
                        
                        <div className="flex-1 truncate relative">
                           {session.title || "Cuộc trò chuyện mới"}
                        </div>

                        {/* Action Buttons (Visible on Hover or Active) */}
                        <div className={`flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200 absolute right-2 bg-slate-900/90 shadow-sm rounded-lg backdrop-blur-sm border border-slate-800 ${currentSessionId === session.id ? '' : 'translate-x-2 group-hover:translate-x-0'}`}>
                            <button
                                onClick={(e) => onTogglePinSession(session.id, e)}
                                className="p-1.5 rounded-md text-slate-500 hover:text-yellow-400 hover:bg-slate-800"
                                title={session.isPinned ? "Bỏ ghim" : "Ghim"}
                            >
                                <PinIcon filled={!!session.isPinned} />
                            </button>
                            <button
                                onClick={(e) => startEditing(session.id, session.title, e)}
                                className="p-1.5 rounded-md text-slate-500 hover:text-blue-400 hover:bg-slate-800"
                                title="Đổi tên"
                            >
                                <PencilIcon />
                            </button>
                            <button
                                onClick={(e) => onDeleteSession(session.id, e)}
                                className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-slate-800"
                                title="Xóa"
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    </>
                )}
              </div>
            ))
          )}
        </div>
        
        {/* Footer info */}
        <div className="p-4 border-t border-slate-800/50 text-[10px] text-slate-600 text-center bg-slate-900/30 backdrop-blur-sm">
            <span className="opacity-50">GPM Automate Assistant AI</span>
        </div>
      </div>
    </>
  );
};
