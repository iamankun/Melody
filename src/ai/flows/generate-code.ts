'use server';

/**
 * @fileOverview Tác nhân AI tạo đoạn mã.
 *
 * - generateCodeSnippet - Một hàm tạo các đoạn mã dựa trên mô tả.
 * - GenerateCodeSnippetInput - Kiểu dữ liệu đầu vào cho hàm generateCodeSnippet.
 * - GenerateCodeSnippetOutput - Kiểu dữ liệu trả về của hàm generateCodeSnippet.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCodeSnippetInputSchema = z.object({
  description: z.string().describe('Mô tả về đoạn mã cần tạo.'),
  language: z.string().describe('Ngôn ngữ lập trình cho đoạn mã.'),
  framework: z.string().optional().describe('Framework sẽ sử dụng cho đoạn mã, nếu có.'),
});
export type GenerateCodeSnippetInput = z.infer<typeof GenerateCodeSnippetInputSchema>;

const GenerateCodeSnippetOutputSchema = z.object({
  code: z.string().describe('Đoạn mã được tạo ra.'),
});
export type GenerateCodeSnippetOutput = z.infer<typeof GenerateCodeSnippetOutputSchema>;

export async function generateCodeSnippet(input: GenerateCodeSnippetInput): Promise<GenerateCodeSnippetOutput> {
  return generateCodeSnippetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodeSnippetPrompt',
  input: {schema: GenerateCodeSnippetInputSchema},
  output: {schema: GenerateCodeSnippetOutputSchema},
  prompt: `Bạn là một kỹ sư phần mềm chuyên nghiệp có khả năng tạo mã bằng nhiều ngôn ngữ lập trình và khung làm việc khác nhau.

  Tạo một đoạn mã dựa trên mô tả sau:
  {{description}}

  Ngôn ngữ: {{language}}
  Framework: {{framework}}

  Hãy đảm bảo mã có thể thực thi được và tuân thủ các phương pháp hay nhất cho ngôn ngữ và khung làm việc đã chỉ định.
  Chỉ trả về đoạn mã, không có bất kỳ giải thích hay bình luận bổ sung nào.
  `,
});

const generateCodeSnippetFlow = ai.defineFlow(
  {
    name: 'generateCodeSnippetFlow',
    inputSchema: GenerateCodeSnippetInputSchema,
    outputSchema: GenerateCodeSnippetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
