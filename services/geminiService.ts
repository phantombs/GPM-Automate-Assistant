
import { GoogleGenAI, Content, Part } from "@google/genai";
import { GPM_SYSTEM_INSTRUCTION } from "../constants";
import { Message, Role } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

/**
 * Giới hạn kích thước văn bản để tránh lỗi Token Limit
 */
const MAX_CHARS_PER_PART = 1500000; 

const truncateContent = (content: string) => {
  if (content.length > MAX_CHARS_PER_PART) {
    return content.substring(0, MAX_CHARS_PER_PART) + "\n...[Dữ liệu quá lớn, đã lược bớt]...";
  }
  return content;
};

export const streamChatResponse = async (
  history: Message[],
  newMessage: string,
  fileContent?: string,
  imageData?: { data: string; mimeType: string }
): Promise<AsyncIterable<string>> => {
  
  const model = "gemini-3-flash-preview";

  // Chuyển đổi lịch sử tin nhắn bao gồm cả Text, File và Hình ảnh
  const historyContent: Content[] = history
    .filter(msg => (msg.text && msg.text.trim() !== '') || msg.attachedFile || msg.attachedImage)
    .map((msg) => {
      const parts: Part[] = [];
      
      if (msg.text) {
        parts.push({ text: msg.text });
      }
      
      if (msg.attachedFile?.content) {
        parts.push({ 
          text: `\n\n[DỮ LIỆU ĐÍNH KÈM TRONG QUÁ KHỨ (${msg.attachedFile.name})]:\n${truncateContent(msg.attachedFile.content)}` 
        });
      }

      if (msg.attachedImage) {
        parts.push({
          inlineData: {
            data: msg.attachedImage.data,
            mimeType: msg.attachedImage.mimeType
          }
        });
      }

      return {
        role: msg.role === Role.USER ? "user" : "model",
        parts,
      };
    });

  // Tạo phần nội dung tin nhắn hiện tại
  const currentParts: Part[] = [{ text: newMessage }];
  
  // Xử lý File đính kèm hiện tại
  if (fileContent) {
    currentParts.push({ 
      text: `\n\n[DỮ LIỆU ĐÍNH KÈM HIỆN TẠI]:\n${truncateContent(fileContent)}\n\nNHIỆM VỤ: Phân tích nội dung trên và hỗ trợ người dùng theo các quy tắc GPM Automate.` 
    });
  }

  // Xử lý Hình ảnh hiện tại (Multimodal)
  if (imageData) {
    currentParts.push({
      inlineData: {
        data: imageData.data,
        mimeType: imageData.mimeType
      }
    });
  }

  const chat = ai.chats.create({
    model: model,
    config: {
      systemInstruction: GPM_SYSTEM_INSTRUCTION,
      temperature: 0.5,
      tools: [{ googleSearch: {} }],
    },
    history: historyContent,
  });

  try {
    const result = await chat.sendMessageStream({
      message: currentParts
    });

    return (async function* () {
      for await (const chunk of result) {
        const text = chunk.text;
        if (text) {
          yield text;
        }
      }
    })();

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const errorMessage = error?.message || "";
    if (errorMessage.includes("API_KEY_INVALID")) {
        throw new Error("API Key không hợp lệ. Vui lòng kiểm tra lại cấu hình.");
    }
    throw new Error(`Không thể kết nối với AI: ${error.message || "Lỗi không xác định"}`);
  }
};
