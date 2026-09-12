# 01 — Problem Scan & Quick Problem Cards

**Học viên:** Phùng Trọng Chiến  
**Bối cảnh:** AI Product Engineer tại Vin Smart Future  
**Ý tưởng được nhóm chọn:** Trợ lý AI Bán hàng Vinhomes

> Các số liệu trong phần này là mục tiêu ban đầu để thiết kế pilot, chưa phải kết quả đã được Vinhomes xác nhận.

**Cách thực hiện:** Tôi dùng AI để gợi ý các vấn đề trong hệ sinh thái Vin Smart Future, sau đó kiểm tra lại nguồn và hỏi xem giải pháp tương tự đã tồn tại chưa. Các thành viên tiếp tục chia sẻ, debate pain point của nhau và biểu quyết chọn bài. Sau khi nhóm chốt Trợ lý AI Bán hàng Vinhomes, tôi tiếp tục dùng AI để phân tích sâu.

---

# 🔍 Phase 1 — SCAN

## Bảng quét cơ hội

| # | Subsidiary | Lens | Mô tả ngắn bài toán |
|---:|---|---|---|
| 1 | Vinhomes | Tốn thời gian / AI-upgrade | Khách hàng phải mở nhiều trang để so sánh giá, vị trí, loại căn, tiện ích và chính sách vay trước khi tìm được căn phù hợp. |
| 2 | Vinhomes | Lặp lại | Nhân viên kinh doanh phải hỏi lại các câu giống nhau về ngân sách, vị trí, số phòng ngủ, mục đích mua và nhu cầu vay. |
| 3 | Vinhomes | Pain từ người khác | Giá, tình trạng căn và chính sách bán hàng có thể thay đổi; tư vấn từ dữ liệu cũ làm khách mất niềm tin. |
| 4 | Vinhomes | Tốn thời gian | Nhân viên phải đọc hội thoại và nhập lại thông tin khách hàng tiềm năng vào CRM trước khi chuyển cho người phụ trách. |
| 5 | Vinhomes | AI-upgrade | Khách mô tả nhu cầu bằng câu tự nhiên như “vừa túi tiền, gần trường học”, nhưng bộ lọc thông thường không hiểu được ý này. |
| 6 | Vinhomes | Lặp lại / Pain từ người khác | Khách phải chờ nhân viên tính và giải thích sơ bộ nhiều phương án vay cho từng căn. |

## Top 3 được chọn để đánh giá nhanh

1. Trợ lý tìm căn hộ phù hợp từ nhu cầu viết bằng ngôn ngữ tự nhiên.
2. Tóm tắt hội thoại và tạo hồ sơ khách hàng tiềm năng cho nhân viên kinh doanh.
3. Kiểm tra dữ liệu giá, tình trạng căn và chính sách trước khi tư vấn.

---

# 🃏 Phase 2 — QUICK-ASSESS

## Quick Problem Card #1 — Trợ lý tìm căn hộ phù hợp

| Field | Nội dung |
|---|---|
| **Bài toán** | Khách hàng mất nhiều thời gian đọc và so sánh sản phẩm trước khi tìm được căn phù hợp với nhu cầu và khả năng tài chính. |
| **Công ty thành viên** | **Vinhomes** |
| **Actor** | Khách hàng đang tìm mua căn hộ và nhân viên kinh doanh tiếp nhận nhu cầu ban đầu. |
| **Current Workflow** | 1. Khách tự xem nhiều nguồn.<br>2. Khách liên hệ nhân viên.<br>3. Nhân viên hỏi lại nhu cầu.<br>4. Nhân viên lọc và gửi một số căn.<br>5. Hai bên tiếp tục chỉnh tiêu chí. |
| **Bottleneck** | Bước 3–4: chuyển mô tả tự nhiên của khách thành tiêu chí rõ rồi đối chiếu với dữ liệu sản phẩm. Thời gian hiện tại cần đo trong pilot. |
| **AI Step** | LLM trích xuất nhu cầu; Rule lọc các căn đáp ứng điều kiện bắt buộc; LLM giải thích tối đa 3 lựa chọn. |
| **Success Metric** | Giảm 30% thời gian tìm căn; tăng 20% tỷ lệ khách tìm được căn phù hợp; độ chính xác đề xuất trên 90%. |
| **Quick Architecture** | [ ] No AI · [x] Rule + LLM Feature · [ ] Agentic Loop |

**Rủi ro cần kiểm chứng:** Chưa phỏng vấn sâu các nhân viên để nắm bắt được rõ phạm  vi của vấn đề , biết họ có pain point nhưng chưa xác định được scope của pain ponit này .

---

## Quick Problem Card #2 — Tóm tắt hội thoại và tạo hồ sơ khách hàng

| Field | Nội dung |
|---|---|
| **Bài toán** | Nhân viên kinh doanh phải đọc lại hội thoại và nhập thủ công thông tin khách vào CRM trước khi tiếp tục tư vấn. |
| **Công ty thành viên** | **Vinhomes** |
| **Actor** | Nhân viên kinh doanh và quản lý đội bán hàng. |
| **Current Workflow** | 1. Nhận tin nhắn/cuộc gọi.<br>2. Ghi chú nhu cầu.<br>3. Đọc lại hội thoại.<br>4. Nhập các trường vào CRM.<br>5. Chuyển khách cho người phụ trách. |
| **Bottleneck** | Bước 3–4: thông tin nằm rải rác trong hội thoại, dễ thiếu ngân sách, vị trí hoặc nhu cầu vay. |
| **AI Step** | LLM tạo bản tóm tắt có cấu trúc; nhân viên kiểm tra rồi mới lưu vào CRM. |
| **Success Metric** | Giảm ít nhất 50% thời gian nhập hồ sơ; ít nhất 95% trường bắt buộc được điền đúng; 0 hồ sơ tự ghi vào CRM khi chưa duyệt. |
| **Quick Architecture** | [ ] No AI · [x] LLM Feature · [ ] Agentic Loop |

**Rủi ro cần kiểm chứng:** Hội thoại có dữ liệu cá nhân; phải có quyền truy cập, che thông tin nhạy cảm và lưu vết người duyệt.

---

## Quick Problem Card #3 — Kiểm tra dữ liệu trước khi tư vấn

| Field | Nội dung |
|---|---|
| **Bài toán** | Nhân viên có thể tư vấn sai nếu giá, tình trạng căn hoặc chính sách trong tài liệu không còn mới. |
| **Công ty thành viên** | **Vinhomes** |
| **Actor** | Nhân viên kinh doanh, quản lý giỏ hàng và khách hàng. |
| **Current Workflow** | 1. Nhân viên nhận nhu cầu.<br>2. Mở nhiều bảng/tài liệu.<br>3. So ngày cập nhật.<br>4. Hỏi bộ phận quản lý nếu có mâu thuẫn.<br>5. Mới gửi thông tin cho khách. |
| **Bottleneck** | Bước 2–4: xác định nguồn nào mới nhất và căn nào còn hiệu lực. |
| **AI Step** | Rule kiểm tra phiên bản và thời gian cập nhật; hệ thống gắn cờ dữ liệu mâu thuẫn; LLM chỉ giải thích, không tự chọn nguồn đúng. |
| **Success Metric** | 100% đề xuất có mã căn và thời điểm cập nhật; 0 căn đã đánh dấu hết hiệu lực được đề xuất; ít nhất 95% xung đột dữ liệu được phát hiện trong bộ test. |
| **Quick Architecture** | [ ] No AI · [x] Rule · [x] LLM Feature · [ ] Agentic Loop |

**Rủi ro cần kiểm chứng:** Nếu hệ thống nguồn không đồng bộ thì AI không thể tự biết đâu là dữ liệu đúng; cần người quản lý xác nhận.

---

# 🗳️ Quyết định lựa chọn của nhóm

Nhóm chọn **Quick Problem Card #1 — Trợ lý AI Bán hàng Vinhomes**.

## Vì sao chọn

- Bài toán gần với hành trình mua nhà và có giá trị cho cả khách hàng lẫn nhân viên kinh doanh.
- Giúp khách hàng tiếp cận với việc mua nhà hơn từ viên giúp họ  được tư vấn về  nhu cầu và tài chính đáp ứng . 
- Điểm nghẽn cụ thể: hiểu nhu cầu rồi lọc giỏ hàng phù hợp.
- Có thể kết hợp Rule và LLM trong phạm vi nhỏ, chưa cần Agent tự hành động.
- Các metric chính đã có mục tiêu rõ để thiết kế pilot.

## Vì sao chưa chọn hai card còn lại

- **Card #2:** hữu ích cho nội bộ nhưng cần quyền truy cập hội thoại và CRM ngay từ đầu.
- **Card #3:** rất quan trọng nhưng chủ yếu là bài toán quản trị dữ liệu; Rule và quy trình cập nhật nguồn có thể phù hợp hơn AI.

## Giả định cần kiểm chứng trước khi xây

- Vinhomes có nguồn dữ liệu chính thức về mã căn, giá, vị trí, diện tích, số phòng ngủ, trạng thái và chính sách.
- Khách hàng chấp nhận trả lời một số câu ngắn trước khi nhận đề xuất.
- Nhân viên kinh doanh đồng ý kiểm tra kết quả trước khi liên hệ hoặc đặt lịch.
