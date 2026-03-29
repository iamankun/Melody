// Trong file src/ai/genkit.ts hoặc nơi bạn cấu hình Genkit
import { genkit } from 'genkit';
import { ollama } from 'genkitx-ollama';
import { googleAI } from '@genkit-ai/google-genai';

// Lấy API key từ env - Next.js tự động load từ .env.local
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

// Debug: Log để kiểm tra (chỉ log có/không, không log giá trị)
if (typeof window === 'undefined') {
  console.log('Google AI API Key:', geminiApiKey ? 'ĐÃ CẤU HÌNH ✓' : 'CHƯA CẤU HÌNH ✗');
}

// Tạo plugins array - chỉ thêm Google AI nếu có API key
const plugins: any[] = [
  ollama({
    models: [
      { name: 'llama3' }, 
      { name: 'gemma:7b' },
      { name: 'sorc/qwen3.5-claude-4.6-opus'}
    ],
    // Địa chỉ mặc định của máy chủ Ollama khi chạy trên máy
    serverAddress: 'http://127.0.0.1:11434', 
  }),
];

// Chỉ thêm Google AI plugin nếu có API key
if (geminiApiKey) {
  plugins.push(
    googleAI({
      apiKey: geminiApiKey,
    })
  );
}

export const ai = genkit({
  plugins: plugins,
});