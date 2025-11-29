
import React, { useState } from 'react';

interface MarkdownRendererProps {
  content: string;
}

// Icons
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-green-400">
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

// Shared Copy Logic
const copyToClipboard = async (text: string): Promise<boolean> => {
  const copyFallback = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  };

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      throw new Error("Clipboard API unavailable");
    }
  } catch (err) {
    return copyFallback(text);
  }
};

// --- Sub-Components ---

// 1. CopyableText: For Table Cells or Inline items
const CopyableText: React.FC<{ text: string, className?: string }> = ({ text, className }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // Remove backticks if present for cleaner copy
    const cleanText = text.replace(/^`|`$/g, '');
    const success = await copyToClipboard(cleanText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      onClick={handleCopy}
      className={`group cursor-pointer flex items-center gap-2 py-1 px-2 rounded hover:bg-slate-700/50 transition-colors ${className}`}
      title="Nhấn để sao chép"
    >
      <code className="font-mono text-xs md:text-sm text-sky-300 break-all">{text.replace(/^`|`$/g, '')}</code>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        {copied ? <CheckIcon /> : <CopyIcon />}
      </div>
      {copied && <span className="text-[10px] text-green-400 font-medium animate-in fade-in">Đã chép!</span>}
    </div>
  );
};

// 2. TableBlock: Renders Markdown Tables
const TableBlock: React.FC<{ rows: string[] }> = ({ rows }) => {
  // Simple parser: assumes rows start/end with | and splits by |
  // Row 0: Header, Row 1: Divider, Row 2+: Data
  if (rows.length < 2) return null;

  const parseRow = (row: string) => {
    return row.split('|').map(c => c.trim()).filter((c, i, arr) => i !== 0 && i !== arr.length - 1);
  };

  const headers = parseRow(rows[0]);
  // Detect "XPath" column index
  const xpathColIndex = headers.findIndex(h => h.toLowerCase().includes('xpath'));
  
  const dataRows = rows.slice(2).map(r => parseRow(r));

  return (
    <div className="my-4 w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-sm">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-800/80">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900/50">
            {dataRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-800/30 transition-colors">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-4 py-3 text-sm text-slate-300 whitespace-nowrap md:whitespace-normal">
                    {/* If this is the XPath column, use CopyableText */}
                    {cIdx === xpathColIndex ? (
                      <CopyableText text={cell} />
                    ) : (
                      // Render cell content (handle inline code if present)
                      cell.includes('`') ? <code className="text-xs bg-slate-800 px-1 py-0.5 rounded text-yellow-500 font-mono">{cell.replace(/`/g, '')}</code> : cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 3. CodeBlock: Original component with collapse
interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
        alert('Không thể sao chép tự động.');
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
            e.stopPropagation();
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

// --- Main Renderer ---

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // 1. Split by Code Blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-sm md:text-base leading-relaxed break-words">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          // --- CODE BLOCK ---
          const lines = part.split('\n');
          const language = lines[0].replace('```', '').trim();
          const code = lines.slice(1, -1).join('\n');
          return <CodeBlock key={index} language={language} code={code} />;
        } else {
          // --- TEXT & TABLE PARSING ---
          
          // Split regular text part by newlines to detect tables
          const lines = part.split('\n');
          const renderedElements: React.ReactNode[] = [];
          
          let tableBuffer: string[] = [];
          let isTableMode = false;

          const flushTable = (idx: number) => {
             if (tableBuffer.length > 0) {
                 renderedElements.push(<TableBlock key={`table-${idx}`} rows={tableBuffer} />);
                 tableBuffer = [];
             }
          };

          lines.forEach((line, lineIdx) => {
             const trimmed = line.trim();
             // Simple detection: line starts with | (and probably ends with |)
             // and isn't just a single pipe char
             if (trimmed.startsWith('|') && trimmed.length > 1) {
                 isTableMode = true;
                 tableBuffer.push(trimmed);
             } else {
                 if (isTableMode) {
                     // End of table
                     flushTable(lineIdx);
                     isTableMode = false;
                 }
                 
                 // Skip empty lines if they were just separating content, 
                 // but keep meaningful breaks (logic can be refined)
                 if (line === '' && tableBuffer.length === 0) return;

                 // Render Regular Text Line
                 const boldParts = line.split(/(\*\*.*?\*\*)/g);
                 renderedElements.push(
                    <p key={`p-${lineIdx}`} className="min-h-[1.5em] mb-1">
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
             }
          });
          // Flush any remaining table at the end
          flushTable(lines.length);

          return <div key={index}>{renderedElements}</div>;
        }
      })}
    </div>
  );
};
