import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { jsPDF } from 'jspdf';

interface MarkdownRendererProps {
  content: string;
  onFixContent?: (content: string) => void;
}

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'Inter, sans-serif',
  flowchart: { 
    htmlLabels: false, // CRITICAL FIX: Disable HTML labels to prevent <foreignObject> usage which taints canvas
    curve: 'basis'
  },
});

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

const ArrowsPointingOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
  </svg>
);

const XMarkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const ArrowPathIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-3.5 h-3.5 ${className || ''}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-amber-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
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

// 1. MermaidBlock: Renders Mermaid Diagrams
const MermaidBlock: React.FC<{ code: string; onRegenerate?: (code: string) => void }> = ({ code, onRegenerate }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderChart = async () => {
      try {
        const uniqueId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        // Clean up code to avoid parsing errors
        const cleanCode = code.replace(/\\"/g, '"');
        const { svg } = await mermaid.render(uniqueId, cleanCode);
        setSvg(svg);
        setError(false);
      } catch (err) {
        console.error("Mermaid parsing error:", err);
        setError(true);
      }
    };

    if (code) {
      renderChart();
    }
  }, [code]);

  const downloadAsPDF = () => {
    if (!containerRef.current) return;
    
    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return;

    const viewBox = svgElement.getAttribute('viewBox');
    let width, height;

    if (viewBox) {
        const [x, y, w, h] = viewBox.split(' ').map(Number);
        width = w;
        height = h;
    } else {
        const bbox = svgElement.getBoundingClientRect();
        width = bbox.width;
        height = bbox.height;
    }

    const scale = 3;
    const finalWidth = width * scale;
    const finalHeight = height * scale;

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgElement);

    source = source.replace(/<svg([^>]*)>/, (match, attrs) => {
        let newAttrs = attrs.replace(/\s+width="[^"]*"/gi, '').replace(/\s+height="[^"]*"/gi, '');
        return `<svg${newAttrs} width="${finalWidth}" height="${finalHeight}">`;
    });

    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = finalWidth;
      canvas.height = finalHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        return;
      }

      ctx.fillStyle = '#1e293b'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
      
      try {
        const imgData = canvas.toDataURL('image/png');
        
        const margin = 20;
        const pdfWidth = (finalWidth / scale) + (margin * 2); 
        const pdfHeight = (finalHeight / scale) + (margin * 2);

        const pdf = new jsPDF({
          orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
          unit: 'px',
          format: [pdfWidth, pdfHeight]
        });
        
        pdf.addImage(imgData, 'PNG', margin, margin, (finalWidth / scale), (finalHeight / scale));
        
        pdf.save(`GPM_Flowchart_${Date.now()}.pdf`);
        
      } catch (e) {
        console.error("PDF Export failed:", e);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `GPM_Flowchart_${Date.now()}.svg`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
       console.error("Failed to load SVG image for PDF export");
       URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  if (error) {
    return (
      <div className="flex flex-col gap-2 my-4">
         <div className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-200 text-xs md:text-sm gap-2">
             <div className="flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-500">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                 </svg>
                 <span className="font-medium">Sơ đồ bị lỗi hiển thị.</span>
             </div>
             {onRegenerate && (
                 <button 
                   onClick={() => onRegenerate(code)}
                   className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-all shadow-md group whitespace-nowrap"
                   title="Yêu cầu AI sửa lại cú pháp Mermaid"
                 >
                    <ArrowPathIcon className="group-hover:animate-spin" />
                    <span className="font-bold">Fix (Sửa lỗi)</span>
                 </button>
             )}
         </div>
         <CodeBlock language="mermaid" code={code} />
      </div>
    );
  }

  return (
    <>
      <div className="my-4 w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-900/50 shadow-sm flex flex-col">
          <div className="flex justify-between items-center px-4 py-2 border-b border-slate-700/50 bg-slate-800/30">
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                </svg>
                Quy trình xử lý
              </span>
              <div className="flex items-center gap-1">
                {onRegenerate && (
                  <button 
                    onClick={() => onRegenerate(code)}
                    className="text-slate-400 hover:text-indigo-400 transition-colors p-1.5 rounded hover:bg-slate-700 group"
                    title="Tạo lại/Sửa sơ đồ (Fix)"
                  >
                    <ArrowPathIcon className="group-hover:animate-spin" />
                  </button>
                )}
                <button
                  onClick={downloadAsPDF}
                  className="text-slate-400 hover:text-white transition-colors p-1.5 rounded hover:bg-slate-700"
                  title="Tải sơ đồ (PDF)"
                >
                  <DownloadIcon />
                </button>
                <button 
                  onClick={() => setIsFullscreen(true)}
                  className="text-slate-400 hover:text-white transition-colors p-1.5 rounded hover:bg-slate-700"
                  title="Phóng to sơ đồ"
                >
                  <ArrowsPointingOutIcon />
                </button>
              </div>
          </div>
          
          <div 
            ref={containerRef}
            className="flex justify-center overflow-auto custom-scrollbar p-4 bg-slate-900/80 max-h-[350px]" 
            dangerouslySetInnerHTML={{ __html: svg }} 
          />
          
          <div className="text-[10px] text-center text-slate-500 py-1 bg-slate-800/20">
             Nhấn biểu tượng phóng to ↗ để xem chi tiết hoặc tải file PDF
          </div>
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-sm flex flex-col animate-in fade-in duration-200">
           <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900 shadow-md flex-shrink-0">
              <h3 className="text-lg font-bold text-white">Sơ đồ luồng chi tiết</h3>
              <div className="flex items-center gap-3">
                 <button
                    onClick={() => { downloadAsPDF(); }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm transition-colors"
                  >
                    <DownloadIcon /> Tải PDF
                  </button>
                  <button 
                    onClick={() => setIsFullscreen(false)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition-colors"
                  >
                    <XMarkIcon />
                  </button>
              </div>
           </div>
           
           <div className="flex-1 overflow-auto p-8 flex items-start justify-center cursor-move custom-scrollbar">
              <div 
                className="bg-slate-900 p-8 rounded-xl shadow-2xl border border-slate-800 min-w-[50%]"
                dangerouslySetInnerHTML={{ __html: svg }}
                style={{ transform: 'scale(1.1)', transformOrigin: 'top center' }} 
              />
           </div>
           
           <div className="p-2 text-center text-slate-500 text-xs border-t border-slate-800 bg-slate-900">
             Nhấn ESC hoặc nút đóng để quay lại chat
           </div>
        </div>
      )}
    </>
  );
};

// 2. CopyableText: For Table Cells or Inline items
const CopyableText: React.FC<{ text: string, className?: string }> = ({ text, className }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
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

// 3. TableBlock: Renders Markdown Tables
const TableBlock: React.FC<{ rows: string[] }> = ({ rows }) => {
  if (rows.length < 2) return null;

  const parseRow = (row: string) => {
    return row.split('|').map(c => c.trim()).filter((c, i, arr) => i !== 0 && i !== arr.length - 1);
  };

  const headers = parseRow(rows[0]);
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
                    {cIdx === xpathColIndex ? (
                      <CopyableText text={cell} />
                    ) : (
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

// 4. CodeBlock: Original component with collapse
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

// 5. CollapsibleSection: Renders a collapsible block for detailed instructions
const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="my-3 border border-slate-700/80 rounded-lg overflow-hidden bg-slate-900/40 shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/40 hover:bg-slate-800/80 transition-all text-left group"
      >
        <span className="font-semibold text-blue-300 text-sm group-hover:text-blue-200 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500 group-hover:text-blue-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            {title}
        </span>
        <span className={`text-slate-500 group-hover:text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDownIcon />
        </span>
      </button>
      {isOpen && (
        <div className="px-4 py-4 border-t border-slate-700/50 animate-in slide-in-from-top-1 fade-in duration-200">
          <div className="space-y-2 text-sm md:text-base leading-relaxed">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

// 6. TextRenderer: Handles standard text/markdown logic (paragraphs, tables, lists)
const TextRenderer: React.FC<{ content: string }> = ({ content }) => {
    if (!content.trim()) return null;

    const lines = content.split('\n');
    const renderedElements: React.ReactNode[] = [];
    
    let tableBuffer: string[] = [];
    let isTableMode = false;
    
    let listBuffer: React.ReactNode[] = [];
    let isListMode = false;

    const flushTable = (idx: number) => {
        if (tableBuffer.length > 0) {
            renderedElements.push(<TableBlock key={`table-${idx}`} rows={tableBuffer} />);
            tableBuffer = [];
        }
    };

    const flushList = (idx: number) => {
        if (listBuffer.length > 0) {
            renderedElements.push(
            <ul key={`list-${idx}`} className="list-disc list-outside ml-5 mb-2 space-y-1">
                {listBuffer}
            </ul>
            );
            listBuffer = [];
        }
    };

    lines.forEach((line, lineIdx) => {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('|') && trimmed.length > 1) {
            if (isListMode) { flushList(lineIdx); isListMode = false; }
            isTableMode = true;
            tableBuffer.push(trimmed);
            return;
        } else if (isTableMode) {
            flushTable(lineIdx);
            isTableMode = false;
        }

        const isListItem = trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed);
        
        if (isListItem) {
            if (!isListMode) { isListMode = true; listBuffer = []; }
            
            const cleanText = trimmed.replace(/^(-\s|\*\s|\d+\.\s)/, '');
            
            const boldParts = cleanText.split(/(\*\*.*?\*\*)/g);
            const renderedContent = (
            <span key={lineIdx}>
                {boldParts.map((subPart, subIdx) => {
                    if (subPart.startsWith('**') && subPart.endsWith('**')) {
                    return <strong key={subIdx} className="font-bold text-white">{subPart.slice(2, -2)}</strong>;
                    }
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
            </span>
            );
            
            listBuffer.push(<li key={`li-${lineIdx}`} className="text-slate-300">{renderedContent}</li>);
            return;
        } else {
            if (isListMode) {
                flushList(lineIdx);
                isListMode = false;
            }
            
            if (line === '' && tableBuffer.length === 0) return;

            const boldParts = line.split(/(\*\*.*?\*\*)/g);
            renderedElements.push(
            <p key={`p-${lineIdx}`} className="min-h-[1.5em] mb-2">
                {boldParts.map((subPart, subIdx) => {
                    if (subPart.startsWith('**') && subPart.endsWith('**')) {
                    return <strong key={subIdx} className="font-bold text-white">{subPart.slice(2, -2)}</strong>;
                    }
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
    flushTable(lines.length);
    flushList(lines.length);

    return <>{renderedElements}</>;
};

// --- Main Renderer ---

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, onFixContent }) => {
  const codeSplit = content.split(/(```[\s\S]*?```)/g);
  
  const tokens: { type: string, content: string, language?: string, title?: string }[] = [];
  
  codeSplit.forEach(part => {
     if (part.startsWith('```')) {
        const lines = part.split('\n');
        const language = lines[0].replace('```', '').trim();
        const code = lines.slice(1, -1).join('\n');
        tokens.push({ type: 'code', content: code, language });
     } else {
        const parts = part.split(/(?:^|\n)(:::.*)(?:\n|$)/g);
        
        parts.forEach(subPart => {
           if (subPart.startsWith(':::')) {
              const markerContent = subPart.substring(3).trim();
              if (markerContent === '') {
                 tokens.push({ type: 'collapse-end', content: '' });
              } else {
                 tokens.push({ type: 'collapse-start', title: markerContent, content: '' });
              }
           } else {
              if (subPart) { 
                  tokens.push({ type: 'text', content: subPart });
              }
           }
        });
     }
  });
  
  const rootChildren: React.ReactNode[] = [];
  const stack: { children: React.ReactNode[], title: string }[] = [];
  
  tokens.forEach((token, index) => {
     const key = `token-${index}`;
     const currentContainer = stack.length > 0 ? stack[stack.length - 1].children : rootChildren;
     
     if (token.type === 'collapse-start') {
         const newSection = { children: [], title: token.title || 'Chi tiết' };
         stack.push(newSection);
     } else if (token.type === 'collapse-end') {
         if (stack.length > 0) {
             const finishedSection = stack.pop()!;
             const parentContainer = stack.length > 0 ? stack[stack.length - 1].children : rootChildren;
             parentContainer.push(
                 <CollapsibleSection key={key} title={finishedSection.title}>
                     {finishedSection.children}
                 </CollapsibleSection>
             );
         }
     } else if (token.type === 'code') {
         if (token.language?.toLowerCase() === 'mermaid') {
             currentContainer.push(
                <MermaidBlock 
                    key={key} 
                    code={token.content} 
                    onRegenerate={onFixContent}
                />
             );
         } else {
             currentContainer.push(<CodeBlock key={key} language={token.language || ''} code={token.content} />);
         }
     } else if (token.type === 'text') {
         currentContainer.push(<TextRenderer key={key} content={token.content} />);
     }
  });

  while (stack.length > 0) {
      const finishedSection = stack.pop()!;
      const parentContainer = stack.length > 0 ? stack[stack.length - 1].children : rootChildren;
      parentContainer.push(
          <CollapsibleSection key={`unclosed-${stack.length}`} title={finishedSection.title}>
              {finishedSection.children}
          </CollapsibleSection>
      );
  }

  // Relaxed detection: if we see ':::' in a text token, it's likely a malformed collapsible marker
  // that regex failed to parse (e.g. missing newline)
  const hasMalformedCollapsible = tokens.some(t => t.type === 'text' && t.content.includes(':::'));

  return (
    <div className="space-y-2 text-sm md:text-base leading-relaxed break-words">
      {hasMalformedCollapsible && onFixContent && (
        <div className="flex items-center justify-between p-2 mb-3 bg-amber-900/20 border border-amber-800/50 rounded-lg animate-in fade-in">
            <div className="flex items-center gap-2 text-xs text-amber-200">
                <WarningIcon />
                <span>Phát hiện lỗi định dạng hướng dẫn.</span>
            </div>
            <button
                onClick={() => onFixContent(content)}
                className="flex items-center gap-1 px-3 py-1 bg-amber-700 hover:bg-amber-600 text-white text-xs rounded transition-colors shadow-sm"
            >
                <ArrowPathIcon />
                <span className="font-bold">Fix</span>
            </button>
        </div>
      )}
      {rootChildren}
    </div>
  );
};