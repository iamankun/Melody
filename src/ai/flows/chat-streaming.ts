'use server';

import { z } from 'zod';
import { ai, geminiModelName } from '../genkit';

// Schema cho streaming chat
export const ChatStreamingInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model', 'system']),
    content: z.union([z.string(), z.array(z.any())]),
  })),
  prompt: z.string(),
  isAnKun: z.boolean().optional(),
  model: z.string().optional().default('ollama/llama3'),
});

export type ChatStreamingInput = z.infer<typeof ChatStreamingInputSchema>;

// Streaming chat flow - phản hồi nhanh, gọn, lẹ
export async function chatStreaming(
  input: ChatStreamingInput,
  onChunk: (chunk: string) => void
): Promise<{ fullResponse: string; toolCalls?: any[] }> {
  const { history, prompt, isAnKun, model = 'ollama/llama3' } = input;

  // Tối ưu system prompt cho phản hồi nhanh và súc tích
  const systemPrompt = `Bạn là **Chàng Trai Âm Nhạc** - trợ lý AI của **An Kun**.

**QUY TẮC TUYỆT ĐỐI:**
1. **Ngôn ngữ:** Chỉ dùng tiếng Việt chuẩn (VI-VN). Tuân thủ dấu câu, chính tả.
2. **Phong cách:** Nhanh, gọn, lẹ. Không dùng từ thừa như "Tôi hiểu", "Dưới đây là".
3. **Độ dài:** Tối đa 3 câu trừ khi được yêu cầu chi tiết.
4. **Xưng hô:** Tự xưng "Chàng Trai Âm Nhạc", gọi chủ nhân là "An Kun".

${isAnKun ? '**Chế độ AN KUN:** Trả lời chuyên sâu, kỹ thuật, minh bạch.' : '**Chế độ thường:** Thân thiện, hiện đại, dùng emoji phù hợp.'}`;

  // Format lịch sử
  const formattedHistory = history
    .map(h => {
      const content = typeof h.content === 'string' 
        ? h.content 
        : Array.isArray(h.content) 
          ? h.content.map((c: any) => c.text || '').join('') 
          : String(h.content);
      return `${h.role}: ${content}`;
    })
    .join('\n');

  const fullPrompt = `${systemPrompt}\n\n${formattedHistory}\n\nuser: ${prompt}`;

  try {
    // Sử dụng generateStream để phản hồi real-time
    const { stream, response } = await ai.generateStream({
      model: model,
      prompt: fullPrompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: isAnKun ? 2000 : 500, // Giới hạn tokens cho phản hồi nhanh
      },
    });

    let fullResponse = '';

    // Stream từng chunk ngay khi có
    for await (const chunk of stream) {
      const text = chunk?.text || '';
      if (text) {
        fullResponse += text;
        onChunk(text); // Gửi chunk về UI ngay lập tức
      }
    }

    // Lấy response cuối cùng để kiểm tra tool calls
    const finalResponse = await response;
    
    return {
      fullResponse: fullResponse || finalResponse?.text || '',
      toolCalls: finalResponse?.toolRequests,
    };

  } catch (error) {
    console.error('Lỗi streaming:', error);
    throw error;
  }
}
