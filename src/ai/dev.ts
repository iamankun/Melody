import { config } from 'dotenv';
config();

import '@/ai/LLMs'; // Mở đầu hướng dẫn cơ bản
import '@/ai/flows/generate-music-idea.ts'; // Tạo ý tưởng âm nhạc
import '@/ai/flows/recommend-music.ts'; // Đề xuất âm nhạc
import '@/ai/flows/find-color-for-music.ts'; // Tìm màu sắc trong âm nhạc
import '@/ai/flows/provide-ip-copyright-guidance.ts'; // Tư vấn về bản quyền
import '@/ai/flows/generate-code.ts'; // Tạo code
import '@/ai/flows/chat.ts'; // Chat
import '@/ai/flows/chat.schema.ts'; // Định nghĩa kiểu dữ liệu cho chat
import '@/ai/flows/change-theme.ts'; // Thay đổi nền
import '@/ai/flows/generate-and-play-music.ts'; // Tạo và phát nhạc
import '@/ai/flows/custom-intelligence.ts'; // Tùy chỉnh thủ công
import '@/ai/flows/update-knowledge-base.ts'; // Cập nhật cơ sở kiến thức
import '@/ai/flows/transcribe-audio.ts'; // Chuyển đổi giọng nói thành văn bản
import '@/ai/flows/text-to-speech.ts'; // Chuyển đổi văn bản thành giọng nói
import '@/ai/flows/search-youtube-videos.ts'; // Tìm kiếm video trên YouTube
