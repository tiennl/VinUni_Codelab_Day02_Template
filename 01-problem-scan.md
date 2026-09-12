# 01 — Problem Scan & Quick Assessment

## Bối cảnh

Tôi chọn mảng Vinhomes, tập trung vào hoạt động tư vấn mua căn hộ/nhà tại Hà Nội. Backend prototype hiện đã có dữ liệu bất động sản, bộ lọc theo khu vực/giá/phòng ngủ và ảnh listing. Mục tiêu của bài scan là tìm đúng điểm nghẽn vận hành trước khi mở rộng AI.

## Phase 1 — SCAN

| # | Công ty thành viên | Lens | Bài toán thực tế |
|---|---|---|---|
| 1 | Vinhomes | Tốn thời gian | Nhân viên phải tìm thủ công căn phù hợp từ nhiều dự án, khu vực, mức giá và loại căn trước khi trả lời khách. |
| 2 | Vinhomes | AI-upgrade | Câu hỏi của khách về vị trí, tiện ích, bàn giao, hướng và hình ảnh được trả lời rời rạc, thiếu ngữ cảnh hội thoại. |
| 3 | Vinhomes | Lặp lại | Nhân viên nhập lại thông tin căn hộ vào tin nhắn, CRM và bảng theo dõi; dễ nhầm giá, diện tích hoặc mã căn. |
| 4 | Vinhomes | Pain từ stakeholder | Khách phải gửi lại nhu cầu khi đổi phiên tư vấn hoặc khi nhân viên khác tiếp quản, làm mất mạch hội thoại. |
| 5 | Vinhomes | Tốn thời gian | Kiểm tra tình trạng listing, thời điểm cập nhật, nguồn và ảnh mới nhất trước khi gửi khách vẫn cần thao tác thủ công. |
| 6 | VinFast | Lặp lại | Điều phối viên phải phân loại yêu cầu hỗ trợ sạc và tra cứu hướng dẫn theo mẫu trong nhiều kênh khác nhau. |
| 7 | Vinmec | Tốn thời gian | Nhân viên hành chính tổng hợp câu hỏi lặp lại về lịch khám, khoa và thủ tục từ nhiều kênh. |

## Phase 2 — QUICK-ASSESS

### Card #1 — Trợ lý tìm listing Vinhomes Hà Nội

- **Bài toán:** Nhân viên mất thời gian lọc và tổng hợp listing theo nhu cầu tự nhiên của khách.
- **Công ty:** Vinhomes.
- **Actor:** Nhân viên tư vấn bán hàng và khách mua nhà.
- **Workflow hiện tại:** Nhận tin nhắn → hỏi lại khu vực/ngân sách/phòng ngủ → tìm trong bảng hoặc hệ thống → mở từng listing kiểm tra → soạn câu trả lời và gửi ảnh.
- **Điểm tốn thời gian/lỗi:** Lọc và đối chiếu nhiều trường dữ liệu, khoảng 8–15 phút/lượt.
- **AI hỗ trợ:** Trích xuất nhu cầu, gọi bộ lọc database, xếp hạng kết quả và tạo bản nháp có citation từ listing.
- **Metric:** P95 phản hồi dưới 10 giây; ít nhất 90% câu trả lời có listing phù hợp; giảm thời gian tổng hợp từ 10 xuống dưới 2 phút.
- **Quick architecture:** Rule/filter + LLM feature; chưa dùng agent tự trị.

### Card #2 — Hội thoại liên tục theo phiên

- **Bài toán:** Khi khách quay lại hoặc đổi nhân viên, lịch sử và tiêu chí tìm nhà bị mất.
- **Công ty:** Vinhomes.
- **Actor:** Khách hàng, tư vấn viên và trưởng nhóm CSKH.
- **Workflow hiện tại:** Khách gửi câu hỏi → nhân viên trả lời → đổi thiết bị/nhân viên → hỏi lại thông tin cũ → tư vấn lại từ đầu.
- **Điểm tốn thời gian/lỗi:** Thu thập lại nhu cầu, khoảng 5–10 phút/lượt chuyển phiên.
- **AI hỗ trợ:** Lưu `conversation_id`, history và tóm tắt tiêu chí đã xác nhận; cho phép tiếp tục đúng session.
- **Metric:** 95% phiên tiếp tục đúng context; giảm câu hỏi lặp lại xuống dưới 1 lần/phiên.
- **Quick architecture:** State storage + LLM feature.

### Card #3 — Kiểm soát thông tin listing trước khi tư vấn

- **Bài toán:** Chatbot có thể dùng listing cũ, thiếu ảnh hoặc trả lời giá không còn đúng.
- **Công ty:** Vinhomes.
- **Actor:** Nhân viên tư vấn, data steward và khách hàng.
- **Workflow hiện tại:** Nhân viên xem source → kiểm tra `updated_at`/`verified_at` → đối chiếu trạng thái → mới gửi thông tin cho khách.
- **Điểm tốn thời gian/lỗi:** Xác minh dữ liệu ở nhiều nguồn, khoảng 3–5 phút/lượt; giá hoặc trạng thái sai gây mất niềm tin.
- **AI hỗ trợ:** Retrieval chỉ lấy dữ liệu hiện có, hiển thị nguồn/thời điểm cập nhật, từ chối nếu thiếu dữ liệu và chuyển HITL.
- **Metric:** 100% listing trả về có `property_id` và nguồn; 0 câu trả lời tự bịa giá/ảnh; 95% listing có freshness trong SLA.
- **Quick architecture:** Rule-based validation + retrieval + LLM explanation.

## Lựa chọn để deep-dive

Chọn **Card #1: Trợ lý tìm listing Vinhomes Hà Nội** vì có dữ liệu prototype sẵn, metric đo được và có thể giới hạn AI ở việc tìm kiếm + tạo bản nháp. Card #2 là capability nền tảng; Card #3 là lớp kiểm soát bắt buộc của cùng giải pháp.
