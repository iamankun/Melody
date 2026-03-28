/**
 * @fileOverview Các schema và kiểu dữ liệu cho luồng trò chuyện.
 *
 * - ChatInputSchema - Schema Zod cho đầu vào của hàm trò chuyện.
 * - ChatInput - Kiểu TypeScript cho đầu vào của hàm trò chuyện.
 * - ChatOutputSchema - Schema Zod cho đầu ra của hàm trò chuyện.
 * - ChatOutput - Kiểu TypeScript cho đầu ra của hàm trò chuyện.
 */

import {z} from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

export const ChatInputSchema = z.object({
  history: z.array(MessageSchema),
  prompt: z.string(),
  isAnKun: z.boolean().optional(),
  generateAudio: z.boolean().optional().default(false).describe('Liệu có nên tạo âm thanh cho phản hồi hay không.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export const ChatOutputSchema = z.object({
  response: z.string(),
  audio: z.string().optional().describe('URL data URI của âm thanh phản hồi, ở định dạng WAV.'),
  toolOutputs: z.optional(z.array(z.any())),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;
