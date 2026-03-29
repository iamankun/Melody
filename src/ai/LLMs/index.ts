import fs from 'fs';
import path from 'path';

// Trực tiếp export hàm async
export async function getKnowledgeBase(): Promise<string> {
  const directoryPath = path.join(process.cwd(), 'src', 'ai', 'LLMs');
  try {
    const files = fs.readdirSync(directoryPath);
    const markdownFiles = files.filter((file) => path.extname(file) === '.md');

    const knowledge = markdownFiles.map((fileName) => {
        const filePath = path.join(directoryPath, fileName);
        const content = fs.readFileSync(filePath, 'utf-8');
        return `<document source="${fileName}">\n${content}\n</document>`;
      }).join('\n');

    return knowledge;
  } catch (error) {
    console.error('Lỗi khi tải cơ sở kiến thức:', error);
    return '';
  }
}