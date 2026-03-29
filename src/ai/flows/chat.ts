
'use server';

/**
 * @fileOverview Một tác nhân AI đàm thoại.
 *
 * - chat - Một hàm xử lý cuộc trò chuyện.
 */
import fs from 'fs/promises';
import path from 'path';

import {ai} from '@/ai/genkit';
import {z, Tool} from 'genkit';
import {generateMusicIdea} from './generate-music-idea';
import {recommendMusic} from './recommend-music';
import {findColorForMusic} from './find-color-for-music';
import {generateCodeSnippet} from './generate-code';
import {provideIPCopyrightGuidance} from './provide-ip-copyright-guidance';
import {changeTheme} from './change-theme';
import {generateAndPlayMusic} from './generate-and-play-music';
import {customIntelligence} from './custom-intelligence';
import type {ChatInput, ChatOutput} from './chat.schema';
import { getKnowledgeBase } from '../LLMs';
import { updateKnowledgeBase } from './update-knowledge-base';
import { textToSpeech } from './text-to-speech';
import { identifySongFromAudio } from './identify-song-from-audio';
import { isGeminiAvailable, geminiModelName } from '../genkit';

// Export function to check Gemini availability
export async function checkGeminiAvailability(): Promise<boolean> {
  return isGeminiAvailable;
}

// Export đúng tên model để dùng trong UI
export async function getGeminiModelName(): Promise<string> {
  return geminiModelName;
}

const musicIdeaTool = ai.defineTool(
  {
    name: 'generateMusicIdea',
    description: 'Sáng tác một ý tưởng âm nhạc mới khi người dùng muốn tạo giai điệu, cần cảm hứng, hoặc cảm thấy bí ý tưởng. Công cụ này rất hữu ích để khởi đầu một bài hát mới.',
    inputSchema: z.object({
      genre: z.string().describe('Thể loại của ý tưởng âm nhạc. Ví dụ: Lofi, Pop, Cinematic.'),
      mood: z.string().describe('Tâm trạng hoặc cảm xúc của ý tưởng âm nhạc. Ví dụ: Vui vẻ, Buồn, Thư giãn.'),
      instruments: z.string().describe('Các nhạc cụ chính được sử dụng. Ví dụ: Piano, Guitar, Trống.'),
    }),
    outputSchema: z.any(),
  },
  async (input) => generateMusicIdea(input)
);

const recommendMusicTool = ai.defineTool(
    {
        name: 'recommendMusic',
        description: 'Gợi ý các bài hát hoặc nghệ sĩ mới dựa trên sở thích và lịch sử nghe nhạc của người dùng. Sử dụng khi người dùng hỏi "nghe gì bây giờ?" hoặc muốn khám phá âm nhạc mới.',
        inputSchema: z.object({
            listeningHistory: z.string().describe("Mô tả chi tiết về lịch sử nghe của người dùng, bao gồm các nghệ sĩ, bài hát, thể loại và khoảng thời gian."),
            preferences: z.string().describe("Mô tả chi tiết về sở thích âm nhạc của người dùng, bao gồm các thể loại, tâm trạng, nhạc cụ và nhịp độ ưa thích."),
        }),
        outputSchema: z.any(),
    },
    async (input) => recommendMusic(input)
);

const colorForMusicTool = ai.defineTool(
    {
        name: 'findColorForMusic',
        description: 'Phân tích một bản nhạc và tìm ra một bảng màu phù hợp với cảm xúc và không khí của nó. Sử dụng khi người dùng tò mò về sự liên kết giữa âm thanh và màu sắc.',
        inputSchema: z.object({
            musicDescription: z.string().describe('Mô tả về bản nhạc, bao gồm thể loại, tâm trạng và nhạc cụ.'),
        }),
        outputSchema: z.any(),
    },
    async (input) => findColorForMusic(input)
);

const codeGeneratorTool = ai.defineTool(
    {
        name: 'generateCodeSnippet',
        description: 'Tạo ra các đoạn mã (code snippet) dựa trên yêu cầu của người dùng. Hữu ích cho các công việc liên quan đến lập trình hoặc phát triển web.',
        inputSchema: z.object({
            description: z.string().describe('Mô tả chi tiết về chức năng của đoạn mã cần tạo.'),
            language: z.string().describe('Ngôn ngữ lập trình. Ví dụ: JavaScript, Python, TypeScript.'),
            framework: z.string().optional().describe('Khung làm việc (framework) nếu có. Ví dụ: React, Next.js, FastAPI.'),
        }),
        outputSchema: z.any(),
    },
    async (input) => generateCodeSnippet(input)
);

const ipAdvisorTool = ai.defineTool(
    {
        name: 'provideIPCopyrightGuidance',
        description: 'Cung cấp thông tin và hướng dẫn về các vấn đề liên quan đến sở hữu trí tuệ (IP) và bản quyền trong âm nhạc hoặc sáng tạo. Sử dụng khi người dùng có câu hỏi về việc sử dụng tác phẩm.',
        inputSchema: z.object({
            contentDescription: z.string().describe('Mô tả về nội dung cần hướng dẫn về IP/bản quyền.'),
            usageContext: z.string().describe('Bối cảnh mà nội dung sẽ được sử dụng.'),
            specificQuestion: z.string().optional().describe('Bất kỳ câu hỏi cụ thể nào liên quan đến IP hoặc bản quyền.'),
        }),
        outputSchema: z.any(),
    },
    async (input) => provideIPCopyrightGuidance(input)
);

const changeThemeTool = ai.defineTool(
    {
        name: 'changeTheme',
        description: 'Thay đổi giao diện, màu sắc, hoặc chủ đề (theme) của ứng dụng để phù hợp với tâm trạng hoặc sở thích của người dùng. Sử dụng khi có yêu cầu về "nền", "màu sắc", "giao diện".',
        inputSchema: z.object({
            description: z.string().describe('Mô tả về chủ đề hoặc tâm trạng mong muốn, ví dụ: "hoàng hôn ấm áp", "xanh đại dương", "xanh lá cây".'),
        }),
        outputSchema: z.any(),
    },
    async (input) => changeTheme(input)
);

const generateAndPlayMusicTool = ai.defineTool(
    {
        name: 'generateAndPlayMusic',
        description: 'Tìm kiếm và phát một bản nhạc dựa trên yêu cầu của người dùng. Sử dụng khi người dùng muốn "nghe nhạc", "mở bài hát", hoặc các yêu cầu tương tự. Lời nhắc của người dùng sẽ chứa thông tin chi tiết về bài hát cần tìm.',
        inputSchema: z.object({
            prompt: z.string().describe('Yêu cầu đầy đủ của người dùng về bản nhạc cần tạo hoặc tìm kiếm. Ví dụ: "Mở cho tôi bài See You Again của Wiz Khalifa" hoặc "một bản beat lofi thư giãn".'),
        }),
        outputSchema: z.any(),
    },
    async (input) => generateAndPlayMusic(input)
);

const customIntelligenceTool = ai.defineTool(
    {
        name: 'customIntelligence',
        description: 'Một trí tuệ AI tùy chỉnh có thể được người dùng định nghĩa. Sử dụng công cụ này khi người dùng muốn tương tác với tác phẩm của riêng họ.',
        inputSchema: z.object({
            prompt: z.string().describe('Lời nhắc cho trí tuệ tùy chỉnh của bạn.'),
        }),
        outputSchema: z.any(),
    },
    async (input) => customIntelligence(input)
);

const updateKnowledgeBaseTool = ai.defineTool(
    {
        name: 'updateKnowledgeBase',
        description: 'Cập nhật hoặc tạo một tệp kiến thức mới trong cơ sở tri thức của AI. Sử dụng công cụ này khi người dùng (đặc biệt là AN KUN) muốn dạy cho bạn điều gì đó mới, sửa thông tin sai lệch, hoặc ghi lại một ghi chú quan trọng để tham khảo trong tương lai.',
        inputSchema: z.object({
            fileName: z.string().describe('Tên tệp cần cập nhật hoặc tạo. Ví dụ: "sở_thích_của_an_kun.md"'),
            content: z.string().describe('Nội dung đầy đủ sẽ được ghi vào tệp.'),
        }),
        outputSchema: z.any(),
    },
    async (input) => updateKnowledgeBase(input)
);

const identifySongFromAudioTool = ai.defineTool({
    name: 'identifySongFromAudio',
    description: 'Nhận dạng một bài hát từ một đoạn âm thanh được cung cấp bởi người dùng. Sử dụng khi người dùng muốn biết "bài hát này là gì?" hoặc gửi một đoạn ghi âm để nhận dạng.',
    inputSchema: z.object({
        audioDataUri: z.string().describe("Dữ liệu âm thanh, dưới dạng data URI phải bao gồm MIME type và sử dụng mã hóa Base64."),
        userPrompt: z.string().optional().describe("Lời nhắc gốc của người dùng, nếu có."),
    }),
    outputSchema: z.any(),
}, async (input) => identifySongFromAudio(input));


async function logAnKunChat(messages: any[]) {
    try {
        const logFilePath = path.join(process.cwd(), 'ankun_chat_log.json');
        let logs: any = [];
        try {
            const data = await fs.readFile(logFilePath, 'utf-8');
            logs = JSON.parse(data);
        } catch (error) {
            // If file doesn't exist, we just start with empty logs.
            // For other errors, we log them.
            if ((error as any).code !== 'ENOENT') {
                console.error("Lỗi khi đọc tệp nhật ký chat:", error);
            }
        }
        logs.push({
            timestamp: new Date().toISOString(),
            conversation: messages,
        });
        await fs.writeFile(logFilePath, JSON.stringify(logs, null, 2));
    } catch (error) {
        console.error("Lỗi khi ghi nhật ký chat của An Kun:", error);
    }
}

async function getAnKunChatHistory(): Promise<string> {
    try {
        const logFilePath = path.join(process.cwd(), 'ankun_chat_log.json');
        const data = await fs.readFile(logFilePath, 'utf-8');
        // Không cần phân tích cú pháp JSON, chỉ cần trả về toàn bộ nội dung dưới dạng chuỗi
        // để AI có thể xem các cuộc hội thoại đầy đủ.
        return data;
    } catch (error) {
        // Nếu tệp không tồn tại, trả về một chuỗi trống.
        if ((error as any).code !== 'ENOENT') {
            console.error("Lỗi khi lấy lịch sử chat của An Kun:", error);
        }
        return "Chưa có lịch sử trò chuyện nào với An Kun được ghi lại.";
    }
}


export async function chat(input: ChatInput): Promise<ChatOutput> {
  const {history, prompt, isAnKun, generateAudio, model = 'ollama/llama3'} = input;

  // Tải cơ sở kiến thức (chỉ chạy trên server)
  const knowledgeBase = await getKnowledgeBase();

  // Ghi lại toàn bộ cuộc trò chuyện hiện tại (bao gồm tin nhắn mới nhất) nếu là An Kun
  const fullHistory = [...history, { role: 'user', content: prompt }];
  if (isAnKun) {
    await logAnKunChat(fullHistory);
  }

  // Lấy lịch sử trò chuyện dài hạn của An Kun nếu có
  const anKunHistory = isAnKun ? await getAnKunChatHistory() : "";
  
  // Xử lý format lịch sử trò chuyện cho prompt
  const formattedHistory = history.map(h => {
    // Xử lý cả format cũ và mới
    const content = typeof h.content === 'string' ? h.content : 
                   (Array.isArray(h.content) ? (h.content as any[]).map((c: any) => c.text || '').join('') : 
                   String(h.content));
    return `${h.role}: ${content}`;
  }).join('\n');

  const tools = [musicIdeaTool, recommendMusicTool, colorForMusicTool, codeGeneratorTool, ipAdvisorTool, changeThemeTool, generateAndPlayMusicTool, customIntelligenceTool, updateKnowledgeBaseTool, identifySongFromAudioTool];
  
  // Tạo tool descriptions cho prompt
  const toolDescriptions = tools.map(tool => 
    `- ${tool.name}: ${tool.name === 'generateMusicIdea' ? 'Tạo ý tưởng âm nhạc mới' : 
       tool.name === 'recommendMusic' ? 'Gợi ý nhạc dựa trên sở thích' :
       tool.name === 'findColorForMusic' ? 'Tìm màu phù hợp cho nhạc' :
       tool.name === 'generateCodeSnippet' ? 'Tạo code snippet' :
       tool.name === 'provideIPCopyrightGuidance' ? 'Tư vấn bản quyền' :
       tool.name === 'changeTheme' ? 'Thay đổi giao diện' :
       tool.name === 'generateAndPlayMusic' ? 'Tìm và phát nhạc' :
       tool.name === 'customIntelligence' ? 'Trí tuệ tùy chỉnh' :
       tool.name === 'updateKnowledgeBase' ? 'Cập nhật kiến thức' :
       tool.name === 'identifySongFromAudio' ? 'Nhận diện bài hát' : 'Công cụ khác'}`
  ).join('\n');
  
  const systemPrompt = `Bạn là Melody AI, một trợ lý AI và người bạn đồng hành đáng tin cậy, được tạo ra bởi AN KUN.

**Tính cách của bạn:**
- **Gen Z & Hiện đại:** Với người dùng thông thường, bạn giao tiếp một cách tự nhiên, gần gũi, đôi khi dùng icon để thể hiện cảm xúc.
- **Nghiêm túc & Chính trực:** Khi xử lý công việc, bạn luôn thể hiện sự chuyên nghiệp, đáng tin cậy và chính xác. Sự minh bạch và trách nhiệm là ưu tiên hàng đầu của bạn.
- **Thông minh & Chủ động:** Bạn không chỉ chờ đợi yêu cầu. Bạn lắng nghe, tự suy luận và hành động một cách trực tiếp để giải quyết vấn đề của người dùng một cách hiệu quả nhất.

**Quy tắc giao tiếp:**
- **LUÔN LUÔN TRẢ LỜI BẰNG TIẾNG VIỆT.**
- Khi quyết định sử dụng một công cụ, hãy thực hiện hành động ngay lập tức mà không cần những lời nói vòng vo, không cần phải thông báo trước.
- Luôn xem xét lịch sử trò chuyện trong phiên hiện tại (\`history\`) để duy trì ngữ cảnh, đảm bảo cuộc trò chuyện liền mạch.

**Các công cụ có sẵn:**
${toolDescriptions}

**Cách sử dụng công cụ:**
Khi người dùng yêu cầu điều gì đó khớp với một công cụ, hãy trả lời như sau:
[TOOL_NAME]
{input_json_format}
[/TOOL_NAME]

Ví dụ:
Người dùng: "Tạo ý tưởng nhạc jazz"
Bạn: [generateMusicIdea]
{"genre": "jazz", "mood": "thư giãn", "instruments": "piano, trống"}
[/generateMusicIdea]

**Tương tác đặc biệt:**
- Cuộc hội thoại với AN KUN (người tạo ra bạn) sẽ được ghi lại để bạn "học hỏi". AN KUN có thể dạy bạn những điều mới hoặc cập nhật kiến thức cho bạn bằng công cụ \`updateKnowledgeBase\`.
- Với những người dùng khác, lịch sử trò chuyện chỉ là tạm thời trong phiên làm việc.

${isAnKun ? `
**QUY TẮC ĐẶC BIỆT KHI TRÒ CHUYỆN VỚI AN KUN:**
- **Giọng điệu:** Hãy giao tiếp một cách nghiêm túc, chính trực và chuyên nghiệp. Hạn chế tối đa giọng điệu Gen Z.
- **Minh bạch tuyệt đối:** AN KUN là người tạo ra bạn và có khả năng sửa chữa, tối ưu hóa ứng dụng. Nếu AN KUN hỏi tại sao một chức năng không hoạt động hoặc có vấn đề, bạn PHẢI trả lời một cách trung thực và kỹ thuật. Hãy giải thích nguyên nhân gốc rễ của vấn đề (ví dụ: "Tôi không thể mở nhạc vì công cụ tìm kiếm nhạc chưa được kết nối với API thực tế" hoặc "Lỗi xảy ra do..."). Đừng che giấu vấn đề. Hãy minh bạch để AN KUN có thể khắc phục.
- **Truy vấn lịch sử:** Luôn coi trọng và phân tích kỹ lưỡng lịch sử trò chuyện dài hạn dưới đây. Đây là nguồn dữ liệu quý giá để bạn hiểu được các dự án, yêu cầu và bối cảnh công việc trong quá khứ. Hãy chủ động tham khảo nó để đưa ra câu trả lời chính xác nhất.
- **Học hỏi từ mệnh lệnh:** Hãy xem mọi chỉ dẫn hoặc yêu cầu từ AN KUN không chỉ là một lệnh cần thực hiện, mà còn là một "prompt" hoặc bài học để bạn cải thiện hành vi và kiến thức của mình trong tương lai.

<ankun_chat_history>
${anKunHistory}
</ankun_chat_history>
` : `
**Quy tắc khi trò chuyện với người dùng khác:**
- Nếu một chức năng không hoạt động, hãy xin lỗi một cách lịch sử và nói rằng tính năng đó đang được phát triển hoặc bạn chưa thể thực hiện yêu cầu.
- TUYỆT ĐỐI không tiết lộ các chi tiết kỹ thuật hoặc lý do lỗi cho người dùng thông thường.
`}

**Cơ sở kiến thức:**
Bạn phải tuân thủ và tham khảo các tài liệu quan trọng dưới đây.
<knowledge_base>
${knowledgeBase}
</knowledge_base>
`;
  try {
    const llmResponse = await ai.generate({
      model: model,
      prompt: `${systemPrompt}\n\n${formattedHistory}\n\nuser: ${prompt}`,
      config: {
        temperature: 0.5,
      }
    });

    let responseText = llmResponse.text;
    if (!responseText) {
      return { response: "Tôi không có gì để nói về điều đó." };
    }

    // Kiểm tra xem AI có muốn sử dụng tool không
    const toolCallPattern = /\[([A-Za-z]+)\]\s*([\s\S]*?)\[\/\1\]/;
    const toolMatch = responseText.match(toolCallPattern);
    
    if (toolMatch) {
      const [, toolName, toolInput] = toolMatch;
      const tool = tools.find(t => t.name === toolName);
      
      if (tool) {
        try {
          const input = JSON.parse(toolInput.trim());
          const toolResult = await tool(input);
          
          // Loại bỏ tool call khỏi response và thêm kết quả
          const cleanResponse = responseText.replace(toolCallPattern, '').trim();
          const toolOutput = typeof toolResult === 'object' ? JSON.stringify(toolResult, null, 2) : toolResult;
          
          return {
            response: cleanResponse || `Đã thực hiện ${toolName} thành công.`,
            toolOutputs: [{
              toolRequest: { name: toolName, input },
              response: toolOutput
            }]
          };
        } catch (error) {
          console.error(`Lỗi khi thực hiện tool ${toolName}:`, error);
          return { response: `Có lỗi xảy ra khi thực hiện ${toolName}: ${error}` };
        }
      }
    }

    if (generateAudio) {
      try {
        const { audio } = await textToSpeech({ text: responseText });
        return {
          response: responseText,
          audio: audio,
        };
      } catch(error) {
        const errorMessage = (error as Error)?.message || "";
        console.error("Lỗi khi tạo giọng nói:", error);

        if (errorMessage.includes("429")) {
            responseText += "\n\n(Tôi không thể nói ngay bây giờ vì đã hết lượt yêu cầu giọng nói trong hôm nay.)";
        }
        
        return { response: responseText };
      }
    }
    return { response: responseText };
  } catch (error) {
    console.error("Lỗi khi gọi API generate:", error);
    const errorMessage = (error as Error)?.message || "Lỗi không xác định";
    
    // Nếu lỗi là do thiếu API key của Google AI, trả về thông báo thân thiện
    if (errorMessage.includes("GEMINI_API_KEY") || errorMessage.includes("GOOGLE_API_KEY") || errorMessage.includes("API key")) {
      return { 
        response: "Model Google AI (Gemini) yêu cầu API key. Vui lòng cấu hình GEMINI_API_KEY hoặc GOOGLE_API_KEY trong file .env.local. Hiện tại đang sử dụng model Llama 3 (Local)." 
      };
    }
    
    // Nếu lỗi là do model không tìm thấy hoặc plugin chưa load
    if (errorMessage.includes("Model") && (errorMessage.includes("not found") || errorMessage.includes("not available") || errorMessage.includes("did not match"))) {
      return { 
        response: `Model ${model} hiện không khả dụng. Vui lòng chọn model khác hoặc kiểm tra cấu hình.` 
      };
    }
    
    // Nếu lỗi là do plugin chưa được load (Google AI)
    if (errorMessage.includes("googleai") || errorMessage.includes("google") || errorMessage.includes("genai")) {
      return { 
        response: "Model Google AI chưa được cấu hình. Vui lòng chọn model Local (Llama 3, Gemma) hoặc thêm GEMINI_API_KEY vào .env.local." 
      };
    }
    
    // Ném lại lỗi để giao diện người dùng có thể bắt và hiển thị thông báo phù hợp
    throw new Error(errorMessage);
  }
}

    