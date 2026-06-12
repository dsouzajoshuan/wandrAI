import { GoogleGenerativeAI } from '@google/generative-ai';

interface ChatMessage {
  role: 'user' | 'model' | 'assistant';
  content?: string;
  parts?: { text: string }[] | string;
}

export async function generateGeminiResponse(
  systemPrompt: string,
  history: ChatMessage[] = [],
  message: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: systemPrompt,
  });

  // Map history to standard format for Gemini SDK:
  // Array of { role: 'user' | 'model', parts: [{ text: string }] }
  const formattedHistory = history.map((item) => {
    const role = item.role === 'user' ? 'user' : 'model';
    
    // Extract text content from either 'content' or 'parts'
    let textContent = '';
    if (item.content) {
      textContent = item.content;
    } else if (typeof item.parts === 'string') {
      textContent = item.parts;
    } else if (Array.isArray(item.parts)) {
      textContent = item.parts[0]?.text || '';
    }

    return {
      role,
      parts: [{ text: textContent }],
    };
  });

  const chat = model.startChat({
    history: formattedHistory,
  });

  const result = await chat.sendMessage(message);
  const response = await result.response;
  return response.text();
}
