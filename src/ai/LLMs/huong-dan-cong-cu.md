# Hướng dẫn sử dụng công cụ

## Các công cụ chính của Melody AI

### 1. generateMusicIdea
- **Mục đích**: Tạo ý tưởng âm nhạc mới
- **Input**: genre (thể loại), mood (tâm trạng), instruments (nhạc cụ)
- **Ví dụ**: genre: "Lofi", mood: "Thư giãn", instruments: "Piano, Guitar"

### 2. recommendMusic
- **Mục đích**: Gợi ý nhạc dựa trên sở thích
- **Input**: listeningHistory (lịch sử nghe), preferences (sở thích)
- **Ví dụ**: listeningHistory: "Vừa nghe các bài Lofi", preferences: "Thích nhạc thư giãn"

### 3. findColorForMusic
- **Mục đích**: Tìm màu phù hợp với bản nhạc
- **Input**: musicDescription (mô tả nhạc)
- **Ví dụ**: musicDescription: "Bản nhạc Lofi thư giãn với piano"

### 4. generateCodeSnippet
- **Mục đích**: Tạo code cho lập trình
- **Input**: description (mô tả), language (ngôn ngữ), framework (khung làm việc)
- **Ví dụ**: description: "Tạo nút bấm", language: "JavaScript", framework: "React"

### 5. provideIPCopyrightGuidance
- **Mục đích**: Tư vấn về bản quyền
- **Input**: contentDescription (nội dung), usageContext (bối cảnh), specificQuestion (câu hỏi)
- **Ví dụ**: contentDescription: "Bài hát sáng tác", usageContext: "Sử dụng trên YouTube"

### 6. changeTheme
- **Mục đích**: Thay đổi giao diện ứng dụng
- **Input**: description (mô tả chủ đề)
- **Ví dụ**: description: "Chủ đề hoàng hôn ấm áp"

### 7. generateAndPlayMusic
- **Mục đích**: Tìm và phát nhạc
- **Input**: prompt (yêu cầu)
- **Ví dụ**: prompt: "Mở bài See You Again của Wiz Khalifa"

### 8. customIntelligence
- **Mục đích**: Trí tuệ tùy chỉnh của người dùng
- **Input**: prompt (lời nhắc)
- **Ví dụ**: prompt: "Phân tích dữ liệu này"

### 9. updateKnowledgeBase
- **Mục đích**: Cập nhật kiến thức cho AI
- **Input**: fileName (tên file), content (nội dung)
- **Ví dụ**: fileName: "thong_tin_moi.md", content: "Thông tin mới..."

### 10. identifySongFromAudio
- **Mục đích**: Nhận diện bài hát từ âm thanh
- **Input**: audioDataUri (dữ liệu âm thanh), userPrompt (yêu cầu)
- **Ví dụ**: audioDataUri: "data:audio/wav;base64,...", userPrompt: "Bài hát này là gì?"

## Quy tắc sử dụng
- Luôn kiểm tra input trước khi gọi tool
- Xử lý lỗi một cách lịch sự
- Cung cấp kết quả rõ ràng, dễ hiểu
