'use server';

/**
 * @fileOverview Tác nhân AI tạo ý tưởng âm nhạc.
 *
 * - generateMusicIdea - Một hàm xử lý quá trình tạo ý tưởng âm nhạc.
 * - GenerateMusicIdeaInput - Kiểu dữ liệu đầu vào cho hàm generateMusicIdea.
 * - GenerateMusicIdeaOutput - Kiểu dữ liệu trả về của hàm generateMusicIdea.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMusicIdeaInputSchema = z.object({
  genre: z.string().describe('Thể loại của ý tưởng âm nhạc.'),
  mood: z.string().describe('Tâm trạng của ý tưởng âm nhạc.'),
  instruments: z.string().describe('Các nhạc cụ liên quan đến ý tưởng âm nhạc.'),
});
export type GenerateMusicIdeaInput = z.infer<typeof GenerateMusicIdeaInputSchema>;

const GenerateMusicIdeaOutputSchema = z.object({
  chordProgression: z.string().describe('Chuỗi hợp âm được đề xuất.'),
  melody: z.string().describe('Giai điệu cho ý tưởng âm nhạc.'),
  rhythm: z.string().describe('Nhịp điệu cho ý tưởng âm nhạc.'),
  additionalNotes: z.string().describe('Các lưu ý khác cho ý tưởng âm nhạc.'),
});
export type GenerateMusicIdeaOutput = z.infer<typeof GenerateMusicIdeaOutputSchema>;

export async function generateMusicIdea(input: GenerateMusicIdeaInput): Promise<GenerateMusicIdeaOutput> {
  return generateMusicIdeaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMusicIdeaPrompt',
  input: {schema: GenerateMusicIdeaInputSchema},
  output: {schema: GenerateMusicIdeaOutputSchema},
  prompt: `Bạn là một nhà soạn nhạc đẳng cấp thế giới. Tạo một ý tưởng âm nhạc dựa trên các thông tin sau:\n\nThể loại: {{{genre}}}\nTâm trạng: {{{mood}}}\nNhạc cụ: {{{instruments}}}\n\nHãy xem xét các chuỗi hợp âm, giai điệu, nhịp điệu khác nhau và bất kỳ yếu tố âm nhạc nào khác góp phần tạo nên những bài hát độc đáo và thú vị. Trả về kết quả theo định dạng được chỉ định bởi schema.`,
});

const generateMusicIdeaFlow = ai.defineFlow(
  {
    name: 'generateMusicIdeaFlow',
    inputSchema: GenerateMusicIdeaInputSchema,
    outputSchema: GenerateMusicIdeaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
