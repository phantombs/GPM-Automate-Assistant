
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
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
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
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-30
        w-72 bg-slate-900 border-r border-slate-800
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Lịch sử chat</h2>
            <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
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
            className="w-full flex items-center gap-2 justify-center bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20"
          >
            <PlusIcon />
            <span>Đoạn chat mới</span>
          </button>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto px-2 custom-scrollbar space-y-1">
          {sessions.length === 0 ? (
            <div className="text-center text-slate-500 py-8 text-sm px-4">
              Chưa có lịch sử chat.<br/>Hãy bắt đầu cuộc trò chuyện mới!
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
                  group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors text-sm relative
                  ${currentSessionId === session.id 
                    ? 'bg-slate-800 text-blue-400 font-medium border border-slate-700' 
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white border border-transparent'}
                `}
              >
                {/* Editing Mode */}
                {editingId === session.id ? (
                    <div className="flex items-center w-full gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, session.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 bg-slate-950 text-white px-2 py-1 rounded text-xs border border-blue-500 focus:outline-none"
                        />
                        <button onClick={(e) => { e.stopPropagation(); saveEditing(session.id); }} className="p-1 hover:bg-slate-700 rounded"><CheckIcon /></button>
                        <button onClick={(e) => { e.stopPropagation(); cancelEditing(); }} className="p-1 hover:bg-slate-700 rounded"><CancelIcon /></button>
                    </div>
                ) : (
                    <>
                        <div className="flex-shrink-0">
                             {session.isPinned ? <PinIcon filled={true} /> : <ChatIcon />}
                        </div>
                        
                        <div className="flex-1 truncate relative">
                           {session.title || "Cuộc trò chuyện mới"}
                        </div>

                        {/* Action Buttons (Visible on Hover or Active) */}
                        <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${currentSessionId === session.id ? 'opacity-100' : ''}`}>
                            <button
                                onClick={(e) => onTogglePinSession(session.id, e)}
                                className="p-1.5 rounded-md text-slate-500 hover:text-yellow-400 hover:bg-slate-700/50"
                                title={session.isPinned ? "Bỏ ghim" : "Ghim"}
                            >
                                <PinIcon filled={!!session.isPinned} />
                            </button>
                            <button
                                onClick={(e) => startEditing(session.id, session.title, e)}
                                className="p-1.5 rounded-md text-slate-500 hover:text-blue-400 hover:bg-slate-700/50"
                                title="Đổi tên"
                            >
                                <PencilIcon />
                            </button>
                            <button
                                onClick={(e) => onDeleteSession(session.id, e)}
                                className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-slate-700/50"
                                title="Xóa đoạn chat này"
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
        <div className="p-4 border-t border-slate-800 text-[10px] text-slate-600 text-center">
            GPM Automate Assistant v1.1
        </div>
      </div>
    </>
  );
};
