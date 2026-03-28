'use server';
/**
 * @fileOverview Một tác nhân AI giúp thay đổi chủ đề của ứng dụng.
 *
 * - changeTheme - Một hàm xử lý quá trình thay đổi chủ đề.
 * - ChangeThemeInput - Kiểu dữ liệu đầu vào cho hàm changeTheme.
 * - ChangeThemeOutput - Kiểu dữ liệu trả về của hàm changeTheme.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChangeThemeInputSchema = z.object({
  description: z
    .string()
    .describe('Mô tả về chủ đề hoặc tâm trạng mong muốn, ví dụ: "hoàng hôn ấm áp", "xanh đại dương", "xanh lá cây".'),
});
export type ChangeThemeInput = z.infer<typeof ChangeThemeInputSchema>;

const ChangeThemeOutputSchema = z.object({
  primary: z.string().describe('Màu chính ở định dạng HSL, ví dụ: "262.1 83.3% 57.8%"'),
  accent: z.string().describe('Màu nhấn ở định dạng HSL, ví dụ: "34.9 98.6% 51%"'),
});
export type ChangeThemeOutput = z.infer<typeof ChangeThemeOutputSchema>;

export async function changeTheme(input: ChangeThemeInput): Promise<ChangeThemeOutput> {
  return changeThemeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'changeThemePrompt',
  input: {schema: ChangeThemeInputSchema},
  output: {schema: ChangeThemeOutputSchema},
  prompt: `Bạn là một nhà thiết kế giao diện người dùng tài năng. Dựa trên mô tả của người dùng, hãy tạo ra một màu chính và một màu nhấn ở định dạng HSL cho chủ đề của một ứng dụng web.

  Mô tả: {{{description}}}
  
  Chỉ trả lời bằng các giá trị HSL theo định dạng đã chỉ định.`,
});

const changeThemeFlow = ai.defineFlow(
  {
    name: 'changeThemeFlow',
    inputSchema: ChangeThemeInputSchema,
    outputSchema: ChangeThemeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
