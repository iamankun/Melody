'use server';
/**
 * @fileOverview Đề xuất nhạc mới cho người dùng dựa trên lịch sử nghe và sở thích của họ.
 *
 * - recommendMusic - Một hàm xử lý quá trình đề xuất nhạc.
 * - RecommendMusicInput - Kiểu dữ liệu đầu vào cho hàm recommendMusic.
 * - RecommendMusicOutput - Kiểu dữ liệu trả về của hàm recommendMusic.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendMusicInputSchema = z.object({
  listeningHistory: z
    .string()
    .describe(
      'Mô tả chi tiết về lịch sử nghe của người dùng, bao gồm các nghệ sĩ, bài hát, thể loại và khoảng thời gian.'
    ),
  preferences: z
    .string()
    .describe(
      'Mô tả chi tiết về sở thích âm nhạc của người dùng, bao gồm các thể loại, tâm trạng, nhạc cụ và nhịp độ ưa thích.'
    ),
});
export type RecommendMusicInput = z.infer<typeof RecommendMusicInputSchema>;

const RecommendMusicOutputSchema = z.object({
  recommendations: z
    .string()
    .describe(
      'Danh sách các nghệ sĩ và bài hát được đề xuất dựa trên lịch sử nghe và sở thích của người dùng.'
    ),
  explanation: z
    .string()
    .describe(
      'Giải thích lý do tại sao các nghệ sĩ và bài hát được đề xuất lại được chọn.'
    ),
});
export type RecommendMusicOutput = z.infer<typeof RecommendMusicOutputSchema>;

export async function recommendMusic(input: RecommendMusicInput): Promise<RecommendMusicOutput> {
  return recommendMusicFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendMusicPrompt',
  input: {schema: RecommendMusicInputSchema},
  output: {schema: RecommendMusicOutputSchema},
  prompt: `Bạn là một chuyên gia âm nhạc chuyên đề xuất nhạc cho người dùng dựa trên lịch sử nghe và sở thích của họ.

Bạn sẽ sử dụng lịch sử nghe và sở thích được cung cấp để đề xuất các nghệ sĩ và bài hát cho người dùng.

Lịch sử nghe: {{{listeningHistory}}}
Sở thích: {{{preferences}}}

Dựa trên thông tin này, hãy đề xuất một số bản nhạc mới cho người dùng. Cung cấp cả danh sách các đề xuất và giải thích lý do tại sao mỗi đề xuất được đưa ra.

Định dạng phản hồi của bạn dưới dạng một đối tượng JSON với các trường "recommendations" và "explanation".
`, config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const recommendMusicFlow = ai.defineFlow(
  {
    name: 'recommendMusicFlow',
    inputSchema: RecommendMusicInputSchema,
    outputSchema: RecommendMusicOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
