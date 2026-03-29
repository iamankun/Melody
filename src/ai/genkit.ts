// Trong file src/ai/genkit.ts hoặc nơi bạn cấu hình Genkit
import { genkit } from 'genkit';
import { ollama } from 'genkitx-ollama';
import { googleAI } from '@genkit-ai/google-genai';

// Debug: Kiểm tra tất cả env variables
console.log('=== ENV DEBUG ===');
console.log('process.env keys:', Object.keys(process.env).filter(k => k.includes('GEMINI') || k.includes('GOOGLE') || k.includes('API')));
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('GOOGLE_API_KEY exists:', !!process.env.GOOGLE_API_KEY);

// Lấy API key từ env - Next.js tự động load từ .env.local
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY ||'';

// Debug: Log để kiểm tra (chỉ log có/không, không log giá trị)
if (typeof window === 'undefined') {
  console.log('Google AI API Key:', GEMINI_API_KEY ? 'ĐÃ CẤU HÌNH ✓' : 'CHƯA CẤU HÌNH ✗');
  console.log('=================');
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
if (GEMINI_API_KEY) {
  plugins.push(
    googleAI({
      apiKey: GEMINI_API_KEY,
    })
  );
}

export const ai = genkit({
  plugins: plugins,
});

// Export model name đúng chuẩn để dùng trong chat
export const geminiModelName = 'googleai/gemini-1.5-flash-latest';

// Export flag để kiểm tra Gemini có khả dụng không
export const isGeminiAvailable = !!GEMINI_API_KEY;