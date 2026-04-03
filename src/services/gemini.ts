import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export async function chatWithGemini(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: [
      ...history.map(h => ({ role: h.role, parts: h.parts })),
      { role: 'user', parts: [{ text: message }] }
    ],
    config: {
      systemInstruction: "Sei un assistente motivazionale esperto in 'fioretti' (piccoli sacrifici o obiettivi quotidiani). Aiuta l'utente a definire i suoi obiettivi, a rimanere motivato e a suggerire nuovi fioretti basati sulle sue esigenze. Parla in modo incoraggiante e amichevole, come un caro amico. Rispondi in italiano.",
    }
  });

  return response.text;
}

export async function analyzeProgressImage(base64Image: string, mimeType: string) {
  const model = "gemini-3.1-pro-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: "Analizza questa immagine che rappresenta il progresso o un momento legato a un 'fioretto' (sacrificio/obiettivo). Fornisci un commento motivazionale e incoraggiante basato su ciò che vedi. Rispondi in italiano." }
      ]
    }
  });

  return response.text;
}
