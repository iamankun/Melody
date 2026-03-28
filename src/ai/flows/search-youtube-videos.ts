
'use server';
/**
 * @fileOverview Một tác nhân AI tìm kiếm video trên YouTube bằng API Dữ liệu YouTube thực.
 *
 * - searchYoutubeVideos - Một hàm xử lý việc tìm kiếm video.
 * - SearchYoutubeVideosInput - Kiểu đầu vào cho hàm searchYoutubeVideos.
 * - SearchYoutubeVideosOutput - Kiểu trả về của hàm searchYoutubeVideos.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const VideoSchema = z.object({
    videoId: z.string().describe("ID của video trên YouTube."),
    title: z.string().describe("Tiêu đề của video."),
    description: z.string().describe("Mô tả ngắn gọn về video."),
    thumbnailUrl: z.string().url().describe("URL đến ảnh bìa của video."),
});

const SearchYoutubeVideosInputSchema = z.object({
  query: z.string().describe('Truy vấn tìm kiếm của người dùng.'),
});
export type SearchYoutubeVideosInput = z.infer<typeof SearchYoutubeVideosInputSchema>;

const SearchYoutubeVideosOutputSchema = z.object({
  videos: z.array(VideoSchema).describe("Danh sách các video tìm thấy."),
});
export type SearchYoutubeVideosOutput = z.infer<typeof SearchYoutubeVideosOutputSchema>;


const searchYoutubeVideosFlow = ai.defineFlow(
    {
        name: 'searchYoutubeVideosFlow',
        inputSchema: SearchYoutubeVideosInputSchema,
        outputSchema: SearchYoutubeVideosOutputSchema,
    },
    async (input) => {
        const apiKey = process.env.YOUTUBE_API_KEY;

        if (!apiKey) {
            throw new Error("Khóa API YouTube chưa được định cấu hình. Vui lòng thêm YOUTUBE_API_KEY vào tệp .env của bạn.");
        }

        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(input.query)}&key=${apiKey}&type=video&maxResults=12`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Lỗi API YouTube:", errorData);
                throw new Error(`Lỗi API YouTube: ${response.statusText}`);
            }

            const data = await response.json();

            const videos = data.items.map((item: any) => ({
                videoId: item.id.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
            }));

            return { videos };

        } catch (error) {
            console.error("Lỗi khi tìm kiếm video trên YouTube:", error);
            if (error instanceof Error && error.message.includes('quota')) {
                 throw new Error("Đã vượt quá hạn ngạch API YouTube. Vui lòng thử lại sau hoặc kiểm tra hạn ngạch của bạn trong Google Cloud Console.");
            }
            throw new Error("Không thể tìm kiếm video trên YouTube. Vui lòng thử lại.");
        }
    }
);


export async function searchYoutubeVideos(input: SearchYoutubeVideosInput): Promise<SearchYoutubeVideosOutput> {
  return searchYoutubeVideosFlow(input);
}
