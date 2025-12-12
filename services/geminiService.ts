import { GoogleGenAI, Modality } from "@google/genai";
import { decode, decodeAudioData } from './audioUtils';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateAffirmation = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Give me a short, gentle, and very comforting positive affirmation for someone going through a very hard time with family and legal issues. Keep it under 20 words.",
    });
    return response.text || "You are stronger than you know, and you are not alone.";
  } catch (error) {
    console.error("Affirmation Error:", error);
    return "Peace comes from within. Breathe deeply.";
  }
};

interface ChatResponse {
  text: string;
  sources: Array<{ title: string; uri: string }>;
}

export const sendMessageToCompanion = async (message: string, history: Array<{ role: string, parts: Array<{ text: string }> }>): Promise<ChatResponse> => {
  try {
    // We use gemini-2.5-flash with Google Search grounding
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a warm, empathetic, and supportive sisterly companion. You are helping a user who is dealing with CPS and foster care issues. Be gentle, non-judgmental, and clear. If the user asks about legal or factual things, use the search tool to provide accurate information but deliver it with kindness. Keep responses concise unless asked for detail."
      }
    });

    const text = response.text || "I'm here for you.";
    
    // Extract grounding sources if available
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .filter((c: any) => c.web?.uri && c.web?.title)
      .map((c: any) => ({
        title: c.web.title,
        uri: c.web.uri
      }));

    return { text, sources };

  } catch (error) {
    console.error("Chat Error:", error);
    return { text: "I'm having a little trouble connecting right now, but I'm still listening.", sources: [] };
  }
};

export const analyzeUploadedImage = async (base64Data: string, mimeType: string, prompt: string): Promise<string> => {
  try {
    // Using gemini-3-pro-preview for image analysis as requested
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          {
            text: prompt || "Describe this image gently."
          }
        ]
      }
    });
    return response.text || "I see the image, but I can't quite describe it right now.";
  } catch (error) {
    console.error("Vision Error:", error);
    return "I couldn't analyze the image just yet. Please try again.";
  }
};

export const generateSpeechFromText = async (text: string): Promise<AudioBuffer | null> => {
  try {
    // Using gemini-2.5-flash-preview-tts for speech
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Gentle female voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) return null;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      audioContext,
      24000,
      1
    );
    
    return audioBuffer;

  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};
