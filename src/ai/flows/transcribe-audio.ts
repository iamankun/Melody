
'use server';
/**
 * @fileOverview Một tác nhân AI phiên âm âm thanh thành văn bản.
 *
 * - transcribeAudio - Một hàm xử lý việc phiên âm âm thanh.
 * - TranscribeAudioInput - Kiểu đầu vào cho hàm transcribeAudio.
 * - TranscribeAudioOutput - Kiểu trả về của hàm transcribeAudio.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranscribeAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "Dữ liệu âm thanh, dưới dạng data URI phải bao gồm MIME type và sử dụng mã hóa Base64. Định dạng dự kiến: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type TranscribeAudioInput = z.infer<typeof TranscribeAudioInputSchema>;

const TranscribeAudioOutputSchema = z.object({
  transcript: z.string().describe('Văn bản đã được phiên âm từ âm thanh.'),
});
export type TranscribeAudioOutput = z.infer<typeof TranscribeAudioOutputSchema>;

export async function transcribeAudio(input: TranscribeAudioInput): Promise<TranscribeAudioOutput> {
  return transcribeAudioFlow(input);
}

const prompt = ai.definePrompt({
  name: 'transcribeAudioPrompt',
  input: {schema: TranscribeAudioInputSchema},
  output: {schema: TranscribeAudioOutputSchema},
  prompt: `Vui lòng phiên âm âm thanh được cung cấp. Chỉ trả về văn bản đã phiên âm.

Âm thanh: {{media url=audioDataUri}}`,
});

const transcribeAudioFlow = ai.defineFlow(
  {
    name: 'transcribeAudioFlow',
    inputSchema: TranscribeAudioInputSchema,
    outputSchema: TranscribeAudioOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
