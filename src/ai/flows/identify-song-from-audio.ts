'use server';
/**
 * @fileOverview Một tác nhân AI giúp nhận dạng bài hát từ một đoạn âm thanh.
 *
 * - identifySongFromAudio - Một hàm xử lý quá trình nhận dạng bài hát.
 * - IdentifySongFromAudioInput - Kiểu dữ liệu đầu vào cho hàm identifySongFromAudio.
 * - IdentifySongFromAudioOutput - Kiểu dữ liệu trả về của hàm identifySongFromAudio.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifySongFromAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "Dữ liệu âm thanh, dưới dạng data URI phải bao gồm MIME type và sử dụng mã hóa Base64. Định dạng dự kiến: 'data:<mimetype>;base64,<encoded_data>'."
    ),
   userPrompt: z.string().optional().describe("Lời nhắc gốc của người dùng, nếu có."),
});
export type IdentifySongFromAudioInput = z.infer<typeof IdentifySongFromAudioInputSchema>;

const IdentifySongFromAudioOutputSchema = z.object({
  title: z.string().describe("Tên bài hát được nhận dạng."),
  artist: z.string().describe("Tên nghệ sĩ của bài hát được nhận dạng."),
  artwork: z.string().describe("URL đến ảnh bìa album."),
  url: z.string().describe('URL của bản nhạc được tìm thấy để phát.'),
});
export type IdentifySongFromAudioOutput = z.infer<typeof IdentifySongFromAudioOutputSchema>;


const identifySongFlow = ai.defineFlow(
    {
        name: 'identifySongFlow',
        inputSchema: IdentifySongFromAudioInputSchema,
        outputSchema: IdentifySongFromAudioOutputSchema,
    },
    async (input) => {
        const prompt = `Bạn là một chuyên gia nhận dạng âm nhạc. Dựa vào đoạn âm thanh được cung cấp, hãy xác định tên bài hát và nghệ sĩ.
        Âm thanh: {{media url=${input.audioDataUri}}}
        ${input.userPrompt ? `Gợi ý từ người dùng: ${input.userPrompt}`: ''}
        
        Sau khi xác định xong, hãy tạo ra một tên bài hát và tên nghệ sĩ phù hợp. Trả lời dưới dạng JSON với các key "title" và "artist".`;

        const { output } = await ai.generate({
            prompt: prompt,
            output: {
                schema: z.object({
                    title: z.string(),
                    artist: z.string(),
                })
            }
        });

        if (!output) {
            throw new Error("Không thể nhận dạng bài hát từ âm thanh được cung cấp.");
        }

        return {
            title: output.title,
            artist: output.artist,
            artwork: 'https://picsum.photos/200/200',
            // URL nhạc giả. Thay thế bằng URL thật từ API của bạn trong tương lai.
            url: 'https://storage.googleapis.com/studiopa-prod-assets/sound.mp3',
        };
    }
);


export async function identifySongFromAudio(input: IdentifySongFromAudioInput): Promise<IdentifySongFromAudioOutput> {
  return identifySongFlow(input);
}
