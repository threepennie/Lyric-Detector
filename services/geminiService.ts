
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export const transcribeAudioToSRT = async (audioFile: File): Promise<string> => {
  // Create a new instance right before making the call to ensure it uses the most up-to-date API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Convert File to Base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(audioFile);
  });

  const prompt = `
    この楽曲ファイルを分析して、歌詞を文字起こししてください。
    出力は必ず有効なSRT形式（SubRip Subtitle）で行ってください。
    
    制約事項:
    1. タイムスタンプはオーディオと正確に一致させてください。
    2. SRT形式の構造を厳守してください（番号、開始時刻 --> 終了時刻、テキスト）。
    3. 歌詞以外の解説、挨拶、前書きなどは一切含めないでください。
    4. 歌詞が聞き取れない部分は [Instrumental] や [音楽] と表記しても構いません。
    5. 出力はSRTテキストのみを直接返してください。
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: audioFile.type,
              data: base64Data,
            },
          },
          { text: prompt },
        ],
      },
    });

    const text = response.text || "";
    return text.replace(/```srt/g, '').replace(/```/g, '').trim();
  } catch (error: any) {
    console.error("Transcription error:", error);
    
    // Check for "Requested entity was not found" which usually means invalid API key project
    if (error.message?.includes("Requested entity was not found")) {
      throw new Error("APIキーが無効であるか、適切な権限がありません。APIキー設定から正しいキー（有料プロジェクト）を選択し直してください。");
    }
    
    throw new Error("AIによる文字起こし処理に失敗しました。ファイルサイズや形式、APIキーの状態を確認してください。");
  }
};
