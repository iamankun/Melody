'use server';

/**
 * @fileOverview Một tác nhân AI tìm kiếm màu sắc phù hợp với một bản nhạc.
 *
 * - findColorForMusic - Một hàm xử lý quá trình tìm kiếm màu sắc cho âm nhạc.
 * - FindColorForMusicInput - Kiểu dữ liệu đầu vào cho hàm findColorForMusic.
 * - FindColorForMusicOutput - Kiểu dữ liệu trả về của hàm findColorForMusic.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindColorForMusicInputSchema = z.object({
  musicDescription: z
    .string()
    .describe('Mô tả về bản nhạc, bao gồm thể loại, tâm trạng và nhạc cụ.'),
});
export type FindColorForMusicInput = z.infer<typeof FindColorForMusicInputSchema>;

const FindColorForMusicOutputSchema = z.object({
  colorPalette: z
    .string()
    .describe('Một bảng màu phù hợp với âm nhạc, được mô tả bằng ngôn ngữ tự nhiên.'),
  reasoning: z
    .string()
    .describe('Lý do đằng sau việc lựa chọn bảng màu.'),
});
export type FindColorForMusicOutput = z.infer<typeof FindColorForMusicOutputSchema>;

export async function findColorForMusic(input: FindColorForMusicInput): Promise<FindColorForMusicOutput> {
  return findColorForMusicFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findColorForMusicPrompt',
  input: {schema: FindColorForMusicInputSchema},
  output: {schema: FindColorForMusicOutputSchema},
  prompt: `Bạn là một chuyên gia về cảm thụ âm nhạc, có khả năng cảm nhận màu sắc khi nghe nhạc.

Bạn sẽ được cung cấp một mô tả về một bản nhạc, và bạn sẽ phản hồi bằng một bảng màu phù hợp với âm nhạc đó, được mô tả bằng ngôn ngữ tự nhiên.
Đồng thời giải thích lý do lựa chọn bảng màu đó.

Mô tả âm nhạc: {{{musicDescription}}}`,
});

const findColorForMusicFlow = ai.defineFlow(
  {
    name: 'findColorForMusicFlow',
    inputSchema: FindColorForMusicInputSchema,
    outputSchema: FindColorForMusicOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
