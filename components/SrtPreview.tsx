
import React from 'react';

interface SrtPreviewProps {
  content: string;
  onDownload: () => void;
}

const SrtPreview: React.FC<SrtPreviewProps> = ({ content, onDownload }) => {
  if (!content) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-blue-400">生成されたSRT字幕</h2>
        <button 
          onClick={onDownload}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          SRTファイルを保存
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
        <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400">output.srt</span>
          <span className="text-xs text-slate-500">SubRip Subtitle Format</span>
        </div>
        <pre className="p-6 text-sm font-mono text-slate-300 overflow-y-auto max-h-[500px] leading-relaxed scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {content}
        </pre>
      </div>
    </div>
  );
};

export default SrtPreview;
