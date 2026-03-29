import { genkit } from 'genkit';
import { ollama } from 'genkitx-ollama';
// SỬA Ở ĐÂY: Đổi sang gói googleai để khớp với tên model "googleai/gemini-1.5-flash-latest"
import { googleAI } from '@genkit-ai/googleai'; 

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const plugins: any[] = [
  ollama({
    models: [
      { name: 'llama3' }, 
      { name: 'gemma:7b' },
      { name: 'sorc/qwen3.5-claude-4.6-opus'}
    ],
    serverAddress: 'http://127.0.0.1:11434', 
  }),
];

if (GEMINI_API_KEY) {
  plugins.push(googleAI({ apiKey: GEMINI_API_KEY }));
}

export const ai = genkit({
  plugins: plugins,
  // SỬA Ở ĐÂY: Bắt buộc phải có model mặc định, nếu không custom-intelligence sẽ báo lỗi
  model: GEMINI_API_KEY ? 'googleai/gemini-1.5-flash-latest' : 'ollama/llama3',
});

export const geminiModelName = 'googleai/gemini-1.5-flash-latest';
export const isGeminiAvailable = !!GEMINI_API_KEY;