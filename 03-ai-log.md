# 03 — AI Log & Reflection

**Bài toán:** Trợ lý ảo AI tư vấn mua bán BĐS Vinhomes (Riêng cho siêu quần thể Ocean Park 1, 2, 3)
**Công cụ AI dùng làm thought-partner:** Gemini 3.1 Pro 

---

## 1. AI đã giúp gì?

- **Thu hẹp phạm vi và tạo kịch bản thực tế:** Ban đầu ý tưởng của nhóm hơi chung chung về "Chatbot BĐS". AI đã gợi ý tập trung thẳng vào nỗi đau "ngợp thông tin" của dự án Ocean City (OP1, OP2, OP3) và tạo ra bộ câu hỏi chốt sale/tư vấn cực kỳ sát với thực tế của môi giới Vinhomes.
- **Xây dựng Problem Statement chuẩn xác:** Thay vì tự diễn đạt, AI giúp cấu trúc các luồng ý tưởng thành chuẩn 6-field của Vin Smart Future một cách logic, mạch lạc.
- **Xác định ranh giới (Operational Boundaries):** AI giúp vạch ra ranh giới rất sắc bén, ví dụ: "Được tra cứu thông tin nhưng CẤM tư vấn tài chính chi tiết hay cam kết lợi nhuận". Điều này giúp dự án khả thi và tránh rủi ro pháp lý.
- **Thiết kế Luồng hội thoại thông minh:** Gợi ý cách dùng Follow-up questions để Chatbot có thể dẫn dắt khách hàng đi từ bước Khám phá nhu cầu đến việc chốt lịch hẹn đi xem sa bàn.

## 2. AI đã sai/chưa chính xác ở đâu — và mình đã sửa gì?

- **Hơi rườm rà trong kịch bản Chatbot (Ban đầu):** Ở những prompt đầu tiên, AI tạo ra các câu trả lời và câu hỏi follow-up quá dài, mang tính văn bản hơn là chat (too much). Mình đã phải tinh chỉnh prompt (yêu cầu "chỉ câu hỏi thôi", "chân thật hơn", "ngắn gọn") để ép AI trả về những câu hỏi siêu ngắn gọn giống y hệt cách người thật nhắn tin qua Zalo.
- **Xu hướng lấn sân sang tư vấn tài chính:** Dù ranh giới là hạn chế tư vấn tài chính phức tạp, thỉnh thoảng AI vẫn gợi ý những câu hỏi sâu về mức thu nhập. Mình đã phát hiện và điều chỉnh lại để chatbot chỉ đóng vai trò "Phễu lọc sơ bộ", nhường việc tư vấn vay vốn khó nhằn cho Sales con người.
- **Số liệu giả lập:** Các mốc thời gian chốt deal hay tỉ lệ rơi rụng (drop-off) mà AI đưa ra chỉ là ước tính logic. Khi mang vào báo cáo thực tế cho Chủ đầu tư, mình cần thay thế bằng số liệu trích xuất từ hệ thống CRM nội bộ.

## 3. Bài học rút ra

- **Prompt Engineering là một quá trình lặp (Iterative process):** Không thể mong đợi AI ra kết quả hoàn hảo ngay lần đầu. Việc liên tục feedback ("ngắn gọn hơn", "thực tế hơn", "giống Sales hơn") là chìa khóa để có output chất lượng cao.
- **Giữ vững ranh giới an toàn (Guardrails):** Với các sản phẩm giá trị cao như Bất động sản, thà để AI từ chối trả lời (Fallback) và chuyển cho người thật (Human-in-the-loop), còn hơn để AI tự bịa ra một mức giá hay chính sách ưu đãi không tồn tại.
- **Công cụ tuyệt vời để Role-play:** Sử dụng AI đóng vai khách hàng khó tính hoặc đóng vai một chuyên viên môi giới xuất sắc giúp nhóm nhanh chóng hoàn thiện được tư duy sản phẩm.

