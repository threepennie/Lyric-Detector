
export interface TranscriptionResult {
  srtContent: string;
  status: 'idle' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
}

export interface AudioFile {
  file: File;
  previewUrl: string;
}
