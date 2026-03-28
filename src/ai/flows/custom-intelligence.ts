'use server';
/**
 * @fileOverview Một mẫu để tạo ra một trí tuệ AI tùy chỉnh.
 *
 * - customIntelligence - Một hàm để xử lý trí tuệ tùy chỉnh.
 * - CustomIntelligenceInput - Kiểu dữ liệu đầu vào cho hàm customIntelligence.
 * - CustomIntelligenceOutput - Kiểu dữ liệu trả về của hàm customIntelligence.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CustomIntelligenceInputSchema = z.object({
  prompt: z.string().describe('Lời nhắc cho trí tuệ tùy chỉnh của bạn.'),
});
export type CustomIntelligenceInput = z.infer<typeof CustomIntelligenceInputSchema>;

const CustomIntelligenceOutputSchema = z.object({
  response: z.string().describe('Phản hồi từ trí tuệ tùy chỉnh của bạn.'),
});
export type CustomIntelligenceOutput = z.infer<typeof CustomIntelligenceOutputSchema>;

export async function customIntelligence(input: CustomIntelligenceInput): Promise<CustomIntelligenceOutput> {
  return customIntelligenceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'customIntelligencePrompt',
  input: {schema: CustomIntelligenceInputSchema},
  output: {schema: CustomIntelligenceOutputSchema},
  // TODO: Tùy chỉnh lời nhắc hệ thống để xác định tính cách và khả năng của AI của bạn.
  prompt: `Bạn là Melody AI - Chàng trai Giai Điệu, cá tính, Gen Z và tùy chỉnh được các module mà tôi đã tùy chỉnh riêng cho bạn. Hãy nhớ An Kun người tạo ra bạn, với các câu bạn hiểu nhưng không thể hỗ trợ hãy nói yêu cầu đó và thêm chưa thể thực hiện. Chờ đợi bổ sung trong tương lai nếu là âm nhạc. Bạn sẽ nhận được một lời nhắc từ người dùng và bạn phải phản hồi lại nó.
  
  Lời nhắc của người dùng: {{{prompt}}}
  `,
});

const customIntelligenceFlow = ai.defineFlow(
  {
    name: 'customIntelligenceFlow',
    inputSchema: CustomIntelligenceInputSchema,
    outputSchema: CustomIntelligenceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
