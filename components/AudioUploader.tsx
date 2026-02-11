
import React, { useRef } from 'react';

interface AudioUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  isProcessing: boolean;
}

const AudioUploader: React.FC<AudioUploaderProps> = ({ onFileSelect, selectedFile, isProcessing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-slate-800 rounded-2xl border-2 border-dashed border-slate-600 hover:border-blue-500 transition-colors cursor-pointer group" onClick={handleClick}>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleChange} 
        accept="audio/*" 
        className="hidden" 
        disabled={isProcessing}
      />
      
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-slate-700 rounded-full group-hover:bg-blue-900 transition-colors">
          {selectedFile ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400 group-hover:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M10 14l2 2 2-2m0 0l-2-2-2 2" />
            </svg>
          )}
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-100">
            {selectedFile ? selectedFile.name : "楽曲ファイルをアップロード"}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {isProcessing ? "処理中です..." : "MP3, WAV, M4A などのオーディオファイルをドラッグまたはクリック"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AudioUploader;
