# 03 — AI Log & Reflection

## Bối cảnh sử dụng AI

AI được dùng như thought-partner để phân tích yêu cầu, đọc README/worksheet, thiết kế backend FastAPI, tạo data contract cho property, import dữ liệu XLSX/CSV và kiểm tra API. Quyền quyết định cuối cùng vẫn thuộc về người phát triển; AI không được xem là nguồn sự thật cho giá, trạng thái hoặc pháp lý bất động sản.

## Nhật ký chính

| Bước | AI hỗ trợ | Cách tôi kiểm tra |
|---|---|---|
| 1. Đọc đề bài | Tóm tắt Part 5 và chỉ ra 5 deliverables | Đối chiếu trực tiếp với README và rubric autograder. |
| 2. Thiết kế data | Gợi ý schema cho `property_id`, location, price, images, source và timestamps | So sánh với header XLSX/CSV và giữ tên field theo data contract. |
| 3. Import | Viết logic normalize Excel/CSV, ghép ảnh theo `property_id` | Kiểm tra số dòng, số ID, số URL, unmatched IDs và gọi API listing. |
| 4. Chatbot | Đề xuất retrieval + LLM + conversation storage | Test fallback không có API key, history theo session và giới hạn dữ liệu trong prompt. |
| 5. Deliverables | Gợi ý scan, deep-dive, flow và reflection | Chỉnh lại để phù hợp use case Vinhomes Hanoi, không sao chép ví dụ Xanh SM. |

## Một số lỗi/hallucination cần kiểm soát

1. **Không được suy ra giá hiện tại:** AI có thể viết câu trả lời nghe hợp lý dù database không có giá mới. Khắc phục bằng retrieval-only context, bắt buộc trả `property_id`/source và câu “chưa xác minh” khi thiếu dữ liệu.
2. **Không được biến ảnh thành bằng chứng pháp lý:** URL ảnh chỉ là media của listing; không dùng ảnh để kết luận chất lượng, quyền sở hữu, pháp lý hay tình trạng nội thất ngoài field đã lưu.
3. **Không được coi dữ liệu snapshot là tồn kho live:** `status`, `updated_at` và `verified_at` phải được hiển thị/kiểm tra. Nếu quá hạn freshness thì chuyển nhân viên.
4. **Không được tự động gửi hoặc đặt chỗ:** LLM chỉ tạo draft. HITL bắt buộc trước khi gửi khách hoặc thực hiện hành động thương mại.

## Prompt boundary đã áp dụng

- “Chỉ sử dụng listing nằm trong context được cung cấp.”
- “Không bịa giá, tình trạng, địa chỉ, pháp lý, tiện ích hoặc URL ảnh.”
- “Nếu không đủ dữ liệu, nói rõ không thể xác minh và đề nghị nhân viên hỗ trợ.”
- “Output là draft; không tự gửi tin, không đặt chỗ, không xác nhận giao dịch.”

## Phản ánh cá nhân

Điểm hữu ích nhất của AI là giúp chuyển yêu cầu tự nhiên thành một quy trình có boundary, schema và test cụ thể. Điểm rủi ro nhất là câu trả lời trôi chảy có thể tạo cảm giác chắc chắn hơn dữ liệu thực tế. Vì vậy tôi ưu tiên kiểm tra bằng database/API, không dùng sự tự tin của văn bản làm tiêu chí đúng. Bước tiếp theo là bổ sung test set gồm câu hỏi thiếu ngân sách, khu vực không tồn tại, yêu cầu pháp lý và listing đã cũ.
