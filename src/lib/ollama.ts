interface ChatMessage {
  role: 'user' | 'model' | 'assistant';
  content?: string;
  parts?: { text: string }[] | string;
}

export async function generateOllamaResponse(
  systemPrompt: string,
  history: ChatMessage[] = [],
  message: string
): Promise<string> {
  const ollamaHost = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
  const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2';

  // Map history to Ollama message format
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map((item) => {
      let textContent = '';
      if (item.content) {
        textContent = item.content;
      } else if (typeof item.parts === 'string') {
        textContent = item.parts;
      } else if (Array.isArray(item.parts)) {
        textContent = item.parts[0]?.text || '';
      }

      const role = item.role === 'model' || item.role === 'assistant' ? 'assistant' : 'user';
      return {
        role,
        content: textContent,
      };
    }),
    { role: 'user', content: message }
  ];

  const response = await fetch(`${ollamaHost}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: ollamaModel,
      messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.message?.content || '';
}
