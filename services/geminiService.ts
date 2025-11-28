
import { GoogleGenAI, Content, Part } from "@google/genai";
import { GPM_SYSTEM_INSTRUCTION } from "../constants";
import { Message, Role } from "../types";

// Initialize Gemini Client
// CRITICAL: process.env.API_KEY is assumed to be available in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const streamChatResponse = async (
  history: Message[],
  newMessage: string,
  fileContent?: string
): Promise<AsyncIterable<string>> => {
  
  const model = "gemini-2.5-flash";

  // Convert internal Message type to Gemini Content type
  const historyContent: Content[] = history.map((msg) => ({
    role: msg.role === Role.USER ? "user" : "model",
    parts: [{ text: msg.text }] as Part[],
  }));

  // Construct the current user message
  const parts: Part[] = [{ text: newMessage }];
  
  // If a file is uploaded, append its content as context to the message
  if (fileContent) {
    parts.push({ 
      text: `\n\n[CONTEXT FROM UPLOADED FILE]:\n${fileContent}\n\nNHIỆM VỤ: Nếu nội dung trên là HTML, hãy phân tích và tạo bảng XPath chuẩn cho các input, button, link theo quy tắc hệ thống. Nếu là Log/Script, hãy giải thích và sửa lỗi.` 
    });
  }

  const chat = ai.chats.create({
    model: model,
    config: {
      systemInstruction: GPM_SYSTEM_INSTRUCTION,
      temperature: 0.4, // Keep it relatively precise for technical docs
      // Enable Google Search Grounding to allow the model to look up docs.gpmautomate.com
      tools: [{ googleSearch: {} }],
    },
    history: historyContent,
  });

  try {
    const result = await chat.sendMessageStream({
      message: parts
    });

    // Return an async iterable that yields text chunks
    return (async function* () {
      for await (const chunk of result) {
        const text = chunk.text;
        if (text) {
          yield text;
        }
      }
    })();

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Không thể kết nối với Trợ lý GPM. Vui lòng kiểm tra API Key hoặc mạng.");
  }
};
