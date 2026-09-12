# 02 — Deep-Dive Report: Vinhomes Hanoi Property Assistant

## Phạm vi và giả định

Prototype phục vụ tư vấn mua căn hộ/nhà tại Hà Nội. Database hiện tại là snapshot thử nghiệm gồm 94 property records, trong đó 82 listing bán hàng được nhập từ nguồn dữ liệu dự án và có 471 URL ảnh được gắn theo `property_id`. Đây là dữ liệu thử nghiệm, không phải cam kết tồn kho hoặc giá giao dịch trực tiếp.

## 3.1 Current-State Workflow

1. Khách gửi nhu cầu bằng ngôn ngữ tự nhiên.
2. Nhân viên hỏi lại khu vực, dự án, ngân sách, số phòng ngủ và thời điểm nhận nhà.
3. Nhân viên mở bảng/CRM và lọc từng trường.
4. Nhân viên mở từng listing để kiểm tra trạng thái, giá, ảnh và nguồn.
5. Nhân viên soạn câu trả lời, đính kèm ảnh và gửi cho khách.
6. Khi đổi nhân viên, người tiếp nhận phải hỏi lại từ đầu.

**Tổng thời gian ước tính:** 8–15 phút cho một yêu cầu có nhiều tiêu chí.

**Handoff:** Khách → nhân viên tư vấn; nhân viên → data/CRM; nhân viên cũ → nhân viên mới.

**Bottleneck:** Bước 3–5: lọc thủ công, kiểm tra freshness và tổng hợp nhiều ảnh/nguồn.

## 3.2 Problem Statement — 6 fields

| Field | Nội dung |
|---|---|
| Actor / Operator | Nhân viên tư vấn Vinhomes; khách là người cung cấp nhu cầu và xác nhận lựa chọn. |
| Current Workflow | Nhân viên đọc tin nhắn, hỏi lại tiêu chí, lọc database/CRM, kiểm tra listing và viết câu trả lời thủ công. |
| Bottleneck | Nhu cầu không có cấu trúc và dữ liệu nằm ở nhiều trường; việc ghép đúng khu vực–giá–phòng ngủ–ảnh dễ chậm hoặc sai. |
| Business Impact | Tăng thời gian phản hồi, tăng câu hỏi lặp lại và làm giảm số khách được tư vấn trong cùng một ca. Giá, trạng thái hoặc ảnh sai có thể làm mất niềm tin. |
| Success Metric | P95 truy vấn listing dưới 10 giây; giảm thời gian tổng hợp xuống dưới 2 phút; 100% kết quả có `property_id`, nguồn và ảnh nếu database có ảnh; 0 thông tin giá/trạng thái được bịa. |
| Operational Boundary | AI chỉ truy xuất database hiện có, giải thích dữ liệu và tạo draft. AI không được tự xác nhận còn hàng, giữ chỗ, cam kết giá/ pháp lý, gửi tin ra ngoài hoặc bịa listing. Trường hợp thiếu dữ liệu, xung đột nguồn, giá trị thấp tin cậy hoặc khách yêu cầu giao dịch phải chuyển nhân viên duyệt. |

## 3.3 Future-State Flow & AI Fit

1. **Input:** Chat nhận `message` và `conversation_id`.
2. **Rule step:** Chuẩn hóa tiêu chí; kiểm tra giới hạn giá, số phòng, location và loại bất động sản.
3. **Retrieval step:** Truy vấn SQLite, chỉ lấy listing trong storage; giữ `property_id`, giá, địa chỉ, ảnh, source và timestamp.
4. **AI step (LLM Feature):** LLM diễn giải kết quả thành câu trả lời ngắn, không được thêm dữ kiện ngoài context.
5. **Human step (HITL):** Nhân viên duyệt draft trước khi gửi khách hoặc trước mọi hành động thương mại.
6. **Fallback:** Nếu OpenAI lỗi, hết thời gian, thiếu key, context không đủ hoặc không có listing, trả về template an toàn: nói rõ không tìm thấy/không thể xác minh và mời nhân viên tiếp nhận.

**AI-Fit:** LLM Feature kết hợp Rule/State-Machine. Không dùng agent tự trị vì hành động đặt chỗ, xác nhận giá và tư vấn pháp lý cần quyền kiểm soát của con người.

## Safety and data contract

- Mỗi listing phải có `property_id`; câu trả lời phải lấy giá/địa chỉ/ảnh từ API response.
- `images` là danh sách URL đã lưu; `source_url`, `updated_at` và `verified_at` giúp frontend hiển thị nguồn và freshness.
- `conversation_id` giữ một session liên tục; history được lưu trong `chat_messages`.
- API key OpenAI được đọc từ server environment hoặc header tùy chọn; frontend không hard-code key vào source.
- Không đưa thông tin cá nhân nhạy cảm vào prompt hoặc log.

## 3.4 Evaluate

| Checklist | Đánh giá | Bằng chứng / việc cần làm |
|---|---|---|
| Có dữ liệu mẫu/log sạch để test? | Có, nhưng là snapshot | 94 property records và image URLs đã import; cần bổ sung feed cập nhật và bộ test ẩn danh trước production. |
| Rủi ro AI sai có kiểm soát? | Có trong prototype | Retrieval-only context, schema, fallback, source display và HITL; cần thêm monitoring hallucination/latency. |
| Stakeholder sẵn sàng đổi quy trình? | Chưa xác nhận đầy đủ | Pilot với một nhóm tư vấn, đo baseline 1–2 tuần và lấy feedback trước rollout. |

### Quyết định: GO — Prototype có kiểm soát

Bắt đầu prototype với scope hẹp: tìm listing Hà Nội và tạo draft tư vấn. Không bật tự động gửi, đặt chỗ hoặc xác nhận giá. Quyết định GO dựa trên việc đã có data contract, endpoint retrieval, session storage và fallback; chi phí/rủi ro được giới hạn bởi quyền HITL. Sau pilot mới quyết định mở rộng sang các quận/dự án và nguồn dữ liệu live.
