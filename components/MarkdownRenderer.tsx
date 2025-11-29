import React, { useState } from 'react';

interface MarkdownRendererProps {
  content: string;
}

// Icons
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-green-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

interface CodeBlockProps {
  language: string;
  code: string;
}

// Component CodeBlock riêng biệt để quản lý trạng thái Copy và Collapse
const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  return (
    <div className="my-3 rounded-md overflow-hidden bg-slate-950 border border-slate-700 shadow-sm relative group transition-all duration-200">
      <div 
        className="flex items-center justify-between bg-slate-800 px-4 py-1.5 border-b border-slate-700 cursor-pointer select-none hover:bg-slate-700/80 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "Mở rộng mã nguồn" : "Thu gọn mã nguồn"}
      >
        <div className="flex items-center gap-2">
          <span className="text-slate-400 transition-transform duration-200">
             {isCollapsed ? <ChevronRightIcon /> : <ChevronDownIcon />}
          </span>
          <span className="text-xs text-slate-400 font-mono uppercase">
            {language || 'code'}
          </span>
          {isCollapsed && (
             <span className="text-xs text-slate-500 italic ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
               (Đã thu gọn)
             </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Ngăn chặn việc toggle collapse khi bấm copy
            handleCopy();
          }}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-700 p-1 rounded"
          title="Sao chép mã"
        >
          {copied ? (
            <>
              <CheckIcon />
              <span className="text-green-400">Đã chép</span>
            </>
          ) : (
            <>
              <CopyIcon />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      
      {!isCollapsed && (
        <pre className="p-4 overflow-x-auto text-slate-300 font-mono text-xs md:text-sm custom-scrollbar animate-in fade-in slide-in-from-top-1 duration-200">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Split by code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-sm md:text-base leading-relaxed break-words">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          // Code block handling
          const lines = part.split('\n');
          const language = lines[0].replace('```', '').trim();
          // Remove first line (lang) and last line (```)
          const code = lines.slice(1, -1).join('\n');
          return <CodeBlock key={index} language={language} code={code} />;
        } else {
          // Regular text with simple formatting
          return (
            <div key={index} className="whitespace-pre-wrap">
              {part.split('\n').map((line, lineIdx) => {
                // Handle bolding **text**
                const boldParts = line.split(/(\*\*.*?\*\*)/g);
                return (
                  <p key={lineIdx} className="mb-1">
                    {boldParts.map((subPart, subIdx) => {
                      if (subPart.startsWith('**') && subPart.endsWith('**')) {
                        return <strong key={subIdx} className="font-bold text-white">{subPart.slice(2, -2)}</strong>;
                      }
                      // Handle `inline code`
                      const codeParts = subPart.split(/(`.*?`)/g);
                      return (
                        <span key={subIdx}>
                          {codeParts.map((cp, cpIdx) => {
                            if (cp.startsWith('`') && cp.endsWith('`')) {
                              return <code key={cpIdx} className="bg-slate-700/50 px-1 py-0.5 rounded text-sky-300 font-mono text-xs">{cp.slice(1, -1)}</code>
                            }
                            return cp;
                          })}
                        </span>
                      );
                    })}
                  </p>
                );
              })}
            </div>
          );
        }
      })}
    </div>
  );
};