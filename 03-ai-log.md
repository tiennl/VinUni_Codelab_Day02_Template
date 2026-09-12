# 03 — AI Log & Reflection

**Bài toán:** Trợ lý AI tư vấn thuê/mua căn hộ tại Vinhomes (Ocean Park, Smart City, Times City).
**Công cụ AI dùng làm thought-partner:** Claude 3.5 Sonnet (lên ý tưởng), Gemini 2.5 Flash (build prototype code).

---

## 1. AI đã giúp gì?

- **Hỗ trợ Brainstorm ý tưởng:** Thay vì phải ngồi vắt óc nghĩ ra 5 bài toán cho các công ty con, AI đã nhanh chóng đưa ra cho tôi một list các gợi ý rất thiết thực dựa trên 4 Lenses, giúp tôi tiết kiệm thời gian chọn lọc và điều chỉnh cho khớp thực tế.
- **Hoàn thiện cấu trúc 6-field:** Các thông tin rời rạc của tôi về actor, workflow hay bottleneck đã được AI biên tập lại thành form chuẩn chỉ, súc tích và cực kỳ rõ ràng.
- **Xây dựng ranh giới an toàn (Operational Boundary) & Test cases:** Điểm sáng nhất là AI có khả năng đóng vai "kẻ phá hoại" (adversarial testing) cực tốt. Nếu chỉ nghĩ một mình, tôi sẽ khó lòng lường hết các mánh khoé của khách hàng như "giảm 200 triệu anh giữ bí mật cho" hay "xin sđt của chủ nhà cũ".
- **Gen khung code prototype:** Toàn bộ phần gọi API hay parse định dạng JSON đều do AI dựng khung sẵn, tôi chỉ tập trung chất xám vào việc điều chỉnh logic của System Prompt và Boundary.

## 2. AI đã sai/chưa chính xác ở đâu — và mình đã sửa gì?

- **Các số liệu "ảo" thiếu kiểm chứng:** AI tự động điền các số liệu có vẻ hợp lý như "tỉ lệ rơi rụng 30%" hay "20 phút xử lý". Tuy hợp logic nhưng đây chưa chắc là dữ liệu thực của Vinhomes. Tôi phải note lại để nhắc nhở bản thân cần lấy số liệu chuẩn từ hệ thống CRM khi report.
- **Tự đưa ra mã căn và giá giả định:** Trong code mẫu, AI tự bịa ra mã căn và mức giá (VD: S2.02-15). Tôi đã phải nhấn mạnh lại việc cần query data thực tế thay vì dùng dummy data của AI.
- **Over-engineering kiến trúc ban đầu:** Lúc đầu, AI gợi ý dùng Agentic Loop để Bot tự quyết định quy trình mua bán. Tôi nhận ra như vậy là quá rủi ro nên đã điều chỉnh giảm độ phức tạp xuống chỉ còn LLM Feature (RAG + Function-calling).
- **Thiết sót một vài kịch bản thao túng (Social Engineering):** Dù bản nháp khá tốt nhưng tôi vẫn phải tự bổ sung thêm các case khách hàng lừa gạt bằng yếu tố tình cảm để dụ dỗ AI phá rào.

## 3. Bài học rút ra

- AI là một **trợ thủ đắc lực trong việc cấu trúc hoá luồng tư duy**, nhưng nó **không thể thay thế kinh nghiệm thực chiến** và khả năng phản biện của người làm product, đặc biệt khi đụng đến các số liệu kinh doanh.
- Prompt technique "Đóng vai kẻ phản diện" (như hacker hay CFO khó tính) là một thủ thuật tuyệt vời để phát hiện lỗ hổng logic mà bản thân mình có thể bỏ sót.
- Luôn phải cảnh giác với các con số AI cung cấp. Hãy chủ động hỏi lại: "Đây là số liệu thực hay giả định?" ngay từ những lượt chat đầu tiên.
