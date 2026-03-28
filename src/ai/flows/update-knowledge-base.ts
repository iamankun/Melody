'use server';
/**
 * @fileOverview Một công cụ để Melody AI sửa đổi cơ sở kiến thức của chính mình.
 *
 * - updateKnowledgeBase - Một hàm cho phép ghi vào một tệp trong thư mục LLMs.
 * - UpdateKnowledgeBaseInput - Kiểu đầu vào cho hàm updateKnowledgeBase.
 * - UpdateKnowledgeBaseOutput - Kiểu trả về cho hàm updateKnowledgeBase.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import fs from 'fs/promises';
import path from 'path';

const UpdateKnowledgeBaseInputSchema = z.object({
  fileName: z.string().describe('Tên tệp sẽ được tạo hoặc cập nhật trong thư mục `src/ai/LLMs`. Ví dụ: "sở_thích_của_an_kun.md"'),
  content: z.string().describe('Nội dung đầy đủ sẽ được ghi vào tệp.'),
});
export type UpdateKnowledgeBaseInput = z.infer<typeof UpdateKnowledgeBaseInputSchema>;

const UpdateKnowledgeBaseOutputSchema = z.object({
  status: z.string().describe('Trạng thái của thao tác, ví dụ: "Tệp đã được cập nhật thành công."'),
});
export type UpdateKnowledgeBaseOutput = z.infer<typeof UpdateKnowledgeBaseOutputSchema>;

export async function updateKnowledgeBase(input: UpdateKnowledgeBaseInput): Promise<UpdateKnowledgeBaseOutput> {
  return updateKnowledgeBaseFlow(input);
}

const updateKnowledgeBaseFlow = ai.defineFlow(
  {
    name: 'updateKnowledgeBaseFlow',
    inputSchema: UpdateKnowledgeBaseInputSchema,
    outputSchema: UpdateKnowledgeBaseOutputSchema,
  },
  async ({ fileName, content }) => {
    try {
      // Ngăn chặn việc truy cập thư mục khác
      const safeFileName = path.basename(fileName);
      if (safeFileName !== fileName || fileName.includes('..')) {
        throw new Error('Tên tệp không hợp lệ.');
      }
      
      // Chỉ cho phép các tệp .md để đảm bảo an toàn
      if (!safeFileName.endsWith('.md')) {
        throw new Error('Chỉ cho phép các tệp có phần mở rộng .md.');
      }

      const llmsDir = path.join(process.cwd(), 'src', 'ai', 'LLMs');
      const filePath = path.join(llmsDir, safeFileName);
      
      // Đảm bảo thư mục tồn tại
      await fs.mkdir(llmsDir, { recursive: true });

      await fs.writeFile(filePath, content, 'utf-8');
      
      return {
        status: `Tệp '${safeFileName}' đã được cập nhật thành công.`,
      };
    } catch (error) {
        console.error("Lỗi khi cập nhật cơ sở kiến thức:", error);
        throw new Error(`Không thể cập nhật tệp: ${(error as Error).message}`);
    }
  }
);
