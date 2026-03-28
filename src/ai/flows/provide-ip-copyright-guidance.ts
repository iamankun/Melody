'use server';
/**
 * @fileOverview Cung cấp hướng dẫn về sở hữu trí tuệ và bản quyền.
 *
 * - provideIPCopyrightGuidance - Một hàm cung cấp hướng dẫn về IP và bản quyền.
 * - ProvideIPCopyrightGuidanceInput - Kiểu dữ liệu đầu vào cho hàm provideIPCopyrightGuidance.
 * - ProvideIPCopyrightGuidanceOutput - Kiểu dữ liệu trả về của hàm provideIPCopyrightGuidance.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideIPCopyrightGuidanceInputSchema = z.object({
  contentDescription: z
    .string()
    .describe('Mô tả về nội dung cần hướng dẫn về IP/bản quyền.'),
  usageContext: z
    .string()
    .describe('Bối cảnh mà nội dung sẽ được sử dụng.'),
  specificQuestion: z
    .string()
    .optional()
    .describe('Bất kỳ câu hỏi cụ thể nào liên quan đến IP hoặc bản quyền.'),
});
export type ProvideIPCopyrightGuidanceInput = z.infer<
  typeof ProvideIPCopyrightGuidanceInputSchema
>;

const ProvideIPCopyrightGuidanceOutputSchema = z.object({
  guidance: z.string().describe('Hướng dẫn ngắn gọn về IP và bản quyền.'),
  fairUseConsiderations: z
    .string()
    .describe('Các hướng dẫn sử dụng hợp pháp liên quan đến nội dung và cách sử dụng.'),
  licensingOptions: z.string().describe('Các tùy chọn cấp phép cho nội dung.'),
  legalAdviceRecommendation: z
    .boolean()
    .describe(
      'Liệu có nên tìm kiếm tư vấn pháp lý chính thức hay không dựa trên các chi tiết.'
    ),
  reasonForRecommendation: z
    .string()
    .optional()
    .describe('Lý do đề xuất hoặc không đề xuất tư vấn pháp lý.'),
});
export type ProvideIPCopyrightGuidanceOutput = z.infer<
  typeof ProvideIPCopyrightGuidanceOutputSchema
>;

export async function provideIPCopyrightGuidance(
  input: ProvideIPCopyrightGuidanceInput
): Promise<ProvideIPCopyrightGuidanceOutput> {
  return provideIPCopyrightGuidanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideIPCopyrightGuidancePrompt',
  input: {schema: ProvideIPCopyrightGuidanceInputSchema},
  output: {schema: ProvideIPCopyrightGuidanceOutputSchema},
  prompt: `Bạn là một trợ lý AI cung cấp hướng dẫn về các vấn đề sở hữu trí tuệ (IP) và bản quyền.

  Dựa trên mô tả về nội dung, bối cảnh sử dụng và bất kỳ câu hỏi cụ thể nào, hãy cung cấp hướng dẫn ngắn gọn về IP và bản quyền.
  Bao gồm các hướng dẫn sử dụng hợp pháp liên quan đến nội dung và cách sử dụng, và liệt kê các tùy chọn cấp phép.

  Đánh giá xem liệu có nên tìm kiếm tư vấn pháp lý chính thức hay không và giải thích lý do cho đề xuất đó.

  Mô tả nội dung: {{{contentDescription}}}
  Bối cảnh sử dụng: {{{usageContext}}}
  Câu hỏi cụ thể: {{{specificQuestion}}}
  \n`,
});

const provideIPCopyrightGuidanceFlow = ai.defineFlow(
  {
    name: 'provideIPCopyrightGuidanceFlow',
    inputSchema: ProvideIPCopyrightGuidanceInputSchema,
    outputSchema: ProvideIPCopyrightGuidanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
