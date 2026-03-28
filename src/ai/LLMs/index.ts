
/**
 * @fileOverview Tải và kết hợp tất cả các tài liệu kiến thức từ thư mục LLMs.
 */
import fs from 'fs';
import path from 'path';

function loadKnowledgeBase(): string {
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

    return knowledge;
  } catch (error) {
    console.error('Lỗi khi tải cơ sở kiến thức:', error);
    return '';
  }
}

export const knowledgeBase = loadKnowledgeBase();
