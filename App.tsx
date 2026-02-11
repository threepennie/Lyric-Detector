
import React, { useState, useCallback, useEffect } from 'react';
import AudioUploader from './components/AudioUploader';
import SrtPreview from './components/SrtPreview';
import { transcribeAudioToSRT } from './services/geminiService';
import { TranscriptionResult } from './types';

// Augment the existing global AIStudio interface instead of redeclaring the window property.
// This prevents conflicts with existing environmental declarations.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [result, setResult] = useState<TranscriptionResult>({
    srtContent: '',
    status: 'idle'
  });

  // Check for API Key on mount
  useEffect(() => {
    const checkKey = async () => {
      // The window.aistudio property is already defined in the environment as type AIStudio
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(hasKey);
    };
    checkKey();
  }, []);

  const handleOpenKeyDialog = async () => {
    await window.aistudio.openSelectKey();
    // Assume selection was successful as per instructions to avoid race conditions
    setHasApiKey(true);
  };

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setResult({ srtContent: '', status: 'idle' });
  }, []);

  const handleTranscribe = async () => {
    if (!selectedFile) return;

    // Check key again before starting
    const stillHasKey = await window.aistudio.hasSelectedApiKey();
    if (!stillHasKey) {
      setResult({
        srtContent: '',
        status: 'error',
        errorMessage: 'APIキーが設定されていません。右上の「APIキー設定」から設定してください。'
      });
      setHasApiKey(false);
      return;
    }

    setResult({ srtContent: '', status: 'processing' });
    try {
      const srt = await transcribeAudioToSRT(selectedFile);
      setResult({
        srtContent: srt,
        status: 'completed'
      });
    } catch (error: any) {
      setResult({
        srtContent: '',
        status: 'error',
        errorMessage: error.message || '予期せぬエラーが発生しました。'
      });
    }
  };

  const handleDownload = () => {
    if (!result.srtContent) return;
    
    const blob = new Blob([result.srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = selectedFile ? `${selectedFile.name.split('.')[0]}.srt` : 'lyrics.srt';
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col p-4 md:p-8">
      {/* Top Bar / Settings */}
      <div className="w-full max-w-6xl mx-auto flex justify-end mb-4">
        <button 
          onClick={handleOpenKeyDialog}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all ${
            hasApiKey 
              ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800' 
              : 'bg-amber-900/20 border-amber-500/50 text-amber-400 hover:bg-amber-900/40 animate-pulse'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          <span className="text-sm font-medium">{hasApiKey ? 'APIキー設定済み' : 'APIキーを構成してください'}</span>
        </button>
      </div>

      {/* Header */}
      <header className="w-full max-w-6xl mx-auto mb-12 text-center">
        <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-blue-400 uppercase bg-blue-900/30 rounded-full border border-blue-800">
          User-Owned API Ready
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
          Lyric Detector
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          楽曲ファイルをアップロードして、自分自身のGemini APIキーで<br className="hidden md:block" />
          高精度なSRT字幕ファイルを生成しましょう。
        </p>
        <div className="mt-4 text-xs text-slate-500">
          ※利用には<a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-400 transition-colors">有料プロジェクトのGemini APIキー</a>が必要です。
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-6xl mx-auto flex-grow space-y-8">
        {!hasApiKey && (
          <div className="max-w-2xl mx-auto p-6 bg-amber-900/10 border border-amber-500/30 rounded-2xl text-center space-y-4 shadow-2xl">
            <div className="inline-flex items-center justify-center p-3 bg-amber-500/20 rounded-full text-amber-400 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-amber-200">APIキーの選択が必要です</h2>
            <p className="text-slate-400">
              このアプリを使用するには、ご自身のGoogle CloudプロジェクトのAPIキーを選択してください。<br />
              選択されたキーを使用して処理が行われ、コストはお客様のプロジェクトに課金されます。
            </p>
            <button 
              onClick={handleOpenKeyDialog}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg"
            >
              APIキーを選択する
            </button>
          </div>
        )}

        <div className={!hasApiKey ? 'opacity-50 pointer-events-none grayscale' : ''}>
          <AudioUploader 
            onFileSelect={handleFileSelect} 
            selectedFile={selectedFile} 
            isProcessing={result.status === 'processing'}
          />

          <div className="flex justify-center mt-8">
            <button
              onClick={handleTranscribe}
              disabled={!selectedFile || result.status === 'processing' || !hasApiKey}
              className={`
                px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl
                flex items-center space-x-3
                ${!selectedFile || result.status === 'processing' || !hasApiKey
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-blue-600 hover:bg-blue-500 text-white transform hover:-translate-y-1 hover:shadow-blue-900/40 active:translate-y-0'}
              `}
            >
              {result.status === 'processing' ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>AIが歌詞を解析中...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>SRTファイルを生成する</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error State */}
        {result.status === 'error' && (
          <div className="max-w-2xl mx-auto p-4 bg-red-900/20 border border-red-500/50 rounded-xl flex items-center space-x-3 text-red-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{result.errorMessage}</p>
          </div>
        )}

        {/* Processing Indicator Description */}
        {result.status === 'processing' && (
          <div className="text-center space-y-4 max-w-md mx-auto animate-pulse">
            <p className="text-slate-400 text-sm italic">
              AIが楽曲のメロディと歌詞を1秒ごとに聞き取っています。<br />
              完了まで数秒〜数十秒かかる場合があります。
            </p>
          </div>
        )}

        {/* Result Display */}
        {result.status === 'completed' && (
          <SrtPreview content={result.srtContent} onDownload={handleDownload} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 text-center text-slate-500 text-sm pb-8 border-t border-slate-900 pt-8">
        <p>Built with Gemini AI Engine. All operations are powered by your provided API key.</p>
      </footer>
    </div>
  );
};

export default App;
