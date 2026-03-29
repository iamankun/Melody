
/**
 * @fileOverview Tải và kết hợp tất cả các tài liệu kiến thức từ thư mục LLMs.
 * Lưu ý: Chỉ gọi hàm này trong Server Components hoặc Server Actions.
 */
import fs from 'fs';
import path from 'path';

// Cache để tránh đọc file nhiều lần
let knowledgeCache: string | null = null;

/**
 * Tải cơ sở kiến thức từ các file markdown.
 * Hàm này chỉ chạy trên server - KHÔNG import vào client components.
 */
export async function loadKnowledgeBase(): Promise<string> {
  // Trả về cache nếu đã có
  if (knowledgeCache) {
    return knowledgeCache;
  }

  const directoryPath = path.join(process.cwd(), 'src', 'ai', 'LLMs');
  try {
    const files = fs.readdirSync(directoryPath);
    const markdownFiles = files.filter(
      (file) => path.extname(file) === '.md'
    );

    const knowledge = markdownFiles
      .map((fileName) => {
        const filePath = path.join(directoryPath, fileName);
        const content = fs.readFileSync(filePath, 'utf-8');
        return `
        <document source="${fileName}">
        ${content}
        </document>
        `;
      })
      .join('');

    // Lưu vào cache
    knowledgeCache = knowledge;
    return knowledge;
  } catch (error) {
    console.error('Lỗi khi tải cơ sở kiến thức:', error);
    return '';
  }
}

/**
 * @deprecated Sử dụng loadKnowledgeBase() thay thế. Giữ lại để tương thích ngược.
 */
export const knowledgeBase = ''; // Placeholder để tránh lỗi import cũ
