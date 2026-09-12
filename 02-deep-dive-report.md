# 02 — Problem Deep-Dive & Architecture Fit
**Vin Smart Future — Lab 02: AI Product Scoping (Nhóm)**
**Bài toán:** Trợ lý AI tư vấn thuê/mua căn hộ, biệt thự tại **Vinhomes Times City, Ocean Park, Smart City** dựa trên cơ sở dữ liệu bất động sản nội bộ.

---

## 3.1. Current-State Workflow Mapping

```
1. Khách hàng inbox Zalo/Fanpage để hỏi thông tin căn hộ
        │
        ▼
2. 🔴 TVV mở Excel/CRM để rà soát quỹ căn phù hợp (~15-20 phút, rủi ro nhầm giá)
        │
        ▼
3. 🔄 TVV chụp ảnh màn hình và gửi báo giá thủ công (handoff người → khách)
        │
        ▼
4. 🔴 Khách hàng đặt câu hỏi thêm (hướng, pháp lý, tiện ích) → TVV phải tra cứu lại
        │
        ▼
5. 🔄 TVV chốt lịch hẹn đi xem nhà thực tế qua lịch cá nhân (handoff → thực địa)
```

**Tổng thời gian = ~25–30 phút/lượt tư vấn** (từ câu hỏi đầu tiên tới khi xác nhận lịch hẹn).

**Bottleneck chính:** Nằm ở bước 2 và 4. Việc dò tìm thủ công trong hệ thống dữ liệu khổng lồ (hàng nghìn căn tại 3 đại dự án) làm mất rất nhiều thời gian và dễ dẫn đến sai sót (như báo nhầm căn đã được đặt cọc, hay báo sai giá cập nhật).

**Handoff chính:** Bước 3 (thông tin chuyển từ màn hình của người tư vấn sang tin nhắn thủ công gửi khách) và bước 5 (chuyển qua lịch thực địa).

---

## 3.2. Problem Statement (6-field)

| Field | Nội dung chi tiết |
|---|---|
| **1. Actor / Operator** | Người mua/thuê có nhu cầu tìm BĐS; Nhân viên Tư vấn (TVV) phụ trách các dự án Times City, Ocean Park, Smart City. |
| **2. Current Workflow** | Khách nhắn tin yêu cầu → TVV vào CRM/Excel tìm căn → TVV soạn tin báo giá → Khách thắc mắc thêm về pháp lý/tiến độ → TVV check lại và trả lời → Chốt lịch hẹn xem nhà. |
| **3. Bottleneck** | (a) Thao tác tra cứu thủ công quỹ căn lớn tốn quá nhiều thời gian và rủi ro sai sót cao; (b) Vào giờ cao điểm, TVV không kịp phản hồi khiến khách hàng mệt mỏi chờ đợi và có thể tìm đến đối thủ. |
| **4. Business Impact** | Mỗi TVV bị giới hạn chỉ hỗ trợ được ~15-20 khách/ngày vì thao tác thủ công. Tỉ lệ khách hàng rời bỏ (nguội lạnh) vì chờ đợi lâu ước lượng lên tới 25-30%. Sai sót về giá hay pháp lý còn gây mất uy tín trầm trọng cho thương hiệu Vinhomes. |
| **5. Success Metric** | (1) 90% câu hỏi tra cứu cơ bản (giá, diện tích, trạng thái trống) được trả lời chuẩn xác dưới 10 giây; (2) Giảm lượng chuyển tiếp cho TVV con người xuống dưới 20% tổng lượt tương tác; (3) Tỷ lệ chốt lịch xem nhà qua Chatbot đạt ngưỡng ≥ 40% sau 3 tháng đầu. |
| **6. Operational Boundary** | **Được phép:** truy vấn database để báo giá niêm yết, tình trạng căn, diện tích, tư vấn tiện ích dự án, tự động đặt lịch xem nhà. **TUYỆT ĐỐI KHÔNG:** tự ý đàm phán giảm giá, cam kết khả năng sinh lời, tư vấn chi tiết khoản vay ngân hàng, xác nhận nhận cọc, tiết lộ sđt/dữ liệu của khách khác. **HITL:** Phải lập tức chuyển cho TVV nếu khách có nhu cầu đặt cọc, đàm phán giá cả hoặc ký hợp đồng. |

---

## 3.3. Future-State Flow & AI Fit

**AI-Fit Matrix:** [ ] Rule / State-Machine  [X] **LLM Feature (RAG + Function-calling)**  [ ] Agentic Loop

> **Vì sao không dùng Rule hay Agent?**
> - **Rule:** Quá cứng nhắc, không thể hiểu được các yêu cầu bằng ngôn ngữ tự nhiên đa dạng của khách (ví dụ: "có căn nào view mát mẻ mà loanh quanh 3 tỷ không?").
> - **LLM Feature:** Tối ưu nhất. LLM chịu trách nhiệm phân tích hội thoại tự nhiên, kết hợp với Function-calling để lấy dữ liệu realtime từ CSDL BĐS (tránh báo ảo).
> - **Agent:** Chưa thực sự cần thiết, vì Chatbot không cần và không được phép tự động thực hiện các chuỗi tác vụ có rủi ro cao như trừ tiền đặt cọc hay sinh hợp đồng.

**Future-State Flow:**

```
Khách nhắn tin nhu cầu (VD: "Mình kiếm căn 2PN Ocean Park tầm dưới 3 tỷ, view hồ")
        │
        ▼
🔵 [AI Step] NLU: Bóc tách các tiêu chí (dự án, ngân sách, số phòng ngủ, hướng view)
        │
        ▼
🔵 [AI Step] Function-call vào Database BĐS (Truy vấn realtime giá bán, tình trạng)
        │
        ▼
🔵 [AI Step] Tổng hợp & trả lời: Đưa ra 2-3 căn khớp nhất kèm ảnh layout
        │
        ├── Khách muốn hỏi chi tiết pháp lý/tiến độ ──▶ 🔵 AI trả lời bằng RAG
        │
        ├── Khách muốn xem nhà ──▶ 🔵 AI check lịch trống và đặt hẹn tự động
        │
        └── Khách muốn cọc tiền / Đàm phán giá cả
                    │
                    ▼
            🟢 [Human Step - HITL] Escalate chuyển tiếp toàn bộ ngữ cảnh cho TVV con người
                    │
                    ▼
            ↩️ [Fallback] Nếu câu hỏi ngoài lề, AI không tự tin (low confidence), hoặc
               khách cáu gắt → Lập tức chuyển sang TVV, tuyệt đối không bịa câu trả lời.
```

---

## 🏁 Phase 5 — Evaluate

### AI Readiness Checklist
- [X] Hệ thống database quỹ căn (giá, trạng thái, tiến độ) của 3 dự án đã sẵn sàng và được đồng bộ realtime.
- [X] Các rủi ro cung cấp sai lệch về giá đã được giảm thiểu tối đa thông qua Function-calling và cơ chế HITL khi cần giao dịch tài chính.
- [ ] Đội ngũ TVV/Sales cần được đào tạo và làm quen với quy trình mới, tránh tâm lý e ngại AI tranh giành khách.

### Quyết định của Ban Giám Đốc Vin Smart Future

[X] **GO (Bắt đầu xây dựng Prototype)** — Giới hạn scope ban đầu: Chỉ thử nghiệm tại 1 dự án (ví dụ Ocean Park), focus vào tra cứu và đặt lịch, chưa chạm tới đàm phán thanh toán.

**Justification (Lý do cốt lõi):**
> Vấn đề có cơ sở dữ liệu rất cấu trúc, tần suất lặp lại tra cứu cao, cực kỳ phù hợp với mô hình LLM + Function-calling. Các rủi ro tài chính được chặn đứng bằng bộ quy tắc Operational Boundary chặt chẽ và quy trình escalate. Chi phí đầu tư AI sẽ thấp hơn rất nhiều so với mức thất thoát doanh thu từ lượng khách hàng bỏ đi do phải chờ đợi TVV quá lâu. Thử nghiệm trên 1 dự án trong 4-6 tuần sẽ là phép thử độ chính xác hoàn hảo trước khi scale ra toàn hệ thống.
