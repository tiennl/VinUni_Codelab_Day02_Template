# 02 — Deep-Dive Report
**Vin Smart Future — Lab 02: AI Product Scoping (Nhóm)**
**Bài toán:** Chatbot AI tư vấn thuê/mua căn hộ, biệt thự, shophouse tại **Vinhomes Times City, Ocean Park, Smart City**, dựa trên database bất động sản đã có sẵn.

---

## 3.1. Current-State Workflow Mapping

*(Xem chi tiết sơ đồ trực quan tại `04-workflow-diagram.png`)*

```
1. Khách nhắn Zalo/Hotline hỏi căn hộ
        │
        ▼
2. 🔴 TVV tra Excel/CRM nội bộ tìm căn phù hợp  (~15-20 phút, dễ báo sai giá)
        │
        ▼
3. 🔄 TVV chụp ảnh/bảng giá gửi thủ công qua Zalo  (handoff người → khách)
        │
        ▼
4. 🔴 Khách hỏi thêm (pháp lý, tiến độ, lịch xem nhà) → TVV tra cứu lại
        │
        ▼
5. 🔄 TVV chốt lịch xem nhà thủ công qua lịch cá nhân  (handoff → thực địa)
```

**Tổng cộng = ~25–35 phút/lượt tư vấn** (từ lúc khách hỏi đến khi có lịch xem nhà xác nhận).

**Bottleneck chính:** Bước 2 và bước 4 — tra cứu thủ công trong database lớn (hàng nghìn căn/3 dự án), tốn thời gian, dễ trả sai thông tin (căn đã bán, giá đã cập nhật).

**Handoff chính:** Bước 3 (người → khách, qua tin nhắn thủ công) và bước 5 (người → lịch thực địa).

---

## 3.2. Problem Statement (6-field)

| Field | Nội dung chi tiết |
|---|---|
| **1. Actor / Operator** | Khách hàng đang tìm thuê/mua BĐS (qua Zalo OA, Hotline, Website Vinhomes); Tư vấn viên (TVV) tại các sàn giao dịch Times City, Ocean Park, Smart City. |
| **2. Current Workflow** | Khách nhắn tin/gọi hotline → TVV mở CRM/Excel nội bộ tra cứu căn hộ theo yêu cầu (diện tích, ngân sách, hướng, tầng) → TVV soạn tin nhắn/bảng giá gửi thủ công → Khách hỏi thêm chi tiết pháp lý/tiến độ bàn giao → TVV tra cứu lại và trả lời → Nếu khách quan tâm, TVV gọi điện chốt lịch xem nhà thủ công qua lịch cá nhân. |
| **3. Bottleneck** | (a) Tra cứu thủ công trong database lớn (hàng nghìn căn/3 dự án) tốn thời gian và dễ trả sai thông tin (căn đã bán, giá đã cập nhật); (b) TVV phải xử lý cùng lúc nhiều khách vào giờ cao điểm (tối, cuối tuần) dẫn đến phản hồi chậm, khách bỏ đi sang đối thủ (Ecopark, Sun Group...). |
| **4. Business Impact** | Ước tính mỗi TVV xử lý được ~15-20 lượt tư vấn/ngày do giới hạn thời gian tra cứu thủ công; tỉ lệ khách "nguội" (rời đi vì chờ lâu) ước tính 25-30%; chi phí nhân sự CSKH/telesales cho 3 dự án lớn có thể lên tới hàng tỷ đồng/năm; phản hồi sai thông tin giá/pháp lý gây rủi ro khiếu nại và mất uy tín thương hiệu. |
| **5. Success Metric** | (1) 90% câu hỏi tra cứu thông tin căn hộ (giá, diện tích, tình trạng, tiến độ) được chatbot trả lời chính xác trong dưới 10 giây; (2) Giảm số lượt escalation lên TVV con người xuống dưới 20% tổng lượt chat; (3) Tăng tỉ lệ đặt lịch xem nhà thành công qua chatbot lên ≥ 40% trong 3 tháng đầu triển khai. |
| **6. Operational Boundary** | **Được phép:** truy vấn database BĐS có sẵn (căn còn trống, giá niêm yết, diện tích, pháp lý, tiến độ), gợi ý căn phù hợp theo nhu cầu, đặt lịch hẹn xem nhà, trả lời câu hỏi chung về dự án/tiện ích. **TUYỆT ĐỐI KHÔNG được:** tự ý đàm phán/giảm giá, cam kết lợi nhuận đầu tư/tăng giá trong tương lai, tư vấn tài chính/vay ngân hàng cụ thể, xác nhận giao dịch/đặt cọc, tiết lộ thông tin cá nhân của khách hàng khác. **Cần duyệt (HITL):** mọi trường hợp khách muốn đặt cọc, ký hợp đồng, hoặc thương lượng giá phải chuyển cho TVV con người xử lý. |

---

## 3.3. Future-State Flow & AI Fit

**AI-Fit Matrix:** [ ] Rule / State-Machine  [X] **LLM Feature (RAG + Function-calling)**  [ ] Agentic Loop

> **So sánh Rule vs LLM vs Agent:**
> - **Rule/State-Machine:** Không đủ linh hoạt vì nhu cầu khách hàng diễn đạt tự nhiên, đa dạng (ngân sách, hướng, view...), rule cứng sẽ miss nhiều case.
> - **LLM Feature (được chọn):** Phù hợp nhất — bài toán chủ yếu là truy vấn dữ liệu có cấu trúc (database BĐS) + hội thoại tự nhiên. LLM + function-calling vào database giải quyết tốt mà không cần hành động đa bước tự trị.
> - **Agentic Loop:** Chưa cần thiết ở giai đoạn này vì chatbot không cần tự ra quyết định nhiều bước (đặt cọc, ký hợp đồng) — những việc này bị cấm và luôn chuyển cho người. Cân nhắc nâng cấp lên Agent trong tương lai nếu mở rộng sang tự động hóa quy trình sau khi khách đặt lịch (nhắc lịch, thu thập feedback...).

**Future-State Flow:**

```
Khách nhắn tin nhu cầu (VD: "căn 2PN Ocean Park dưới 3 tỷ, view hồ")
        │
        ▼
🔵 [AI Step] NLU: Trích xuất tiêu chí (dự án, loại căn, ngân sách, hướng/view)
        │
        ▼
🔵 [AI Step] Function-call vào Database BĐS (query realtime: tồn kho, giá, tình trạng)
        │
        ▼
🔵 [AI Step] Tổng hợp & trả lời: liệt kê 2-3 căn phù hợp nhất kèm hình ảnh/mặt bằng
        │
        ├── Khách hỏi thêm chi tiết (pháp lý, tiến độ) ──▶ 🔵 AI trả lời tiếp (RAG)
        │
        ├── Khách muốn xem nhà ──▶ 🔵 AI đặt lịch hẹn tự động (check lịch TVV rảnh)
        │
        └── Khách muốn đặt cọc / thương lượng giá / khiếu nại
                    │
                    ▼
            🟢 [Human Step - HITL] Chuyển tiếp toàn bộ context sang TVV con người
                    │
                    ▼
            ↩️ [Fallback] Nếu AI không chắc chắn (confidence thấp, câu hỏi ngoài
               phạm vi database, hoặc khách có dấu hiệu bực bội) → tự động
               escalate kèm tóm tắt hội thoại cho TVV, không đoán mò trả lời.
```

---

## 🏁 Phase 5 — Evaluate

### AI Readiness Checklist
- [X] Có sẵn database BĐS sạch (tồn kho, giá, pháp lý, tiến độ) của 3 dự án — cần đảm bảo đồng bộ realtime với CRM nội bộ.
- [X] Rủi ro khi AI sai (báo sai giá/tình trạng căn) nằm trong tầm kiểm soát nhờ Fallback + HITL cho các quyết định tài chính/pháp lý.
- [ ] Stakeholders (đội Sales/TVV) cần thời gian làm quen quy trình mới, có thể có tâm lý lo ngại "AI thay thế công việc" → cần đào tạo + truyền thông nội bộ.

### Quyết định cuối cùng của Ban Giám Đốc Vin Smart Future

[X] **GO (Bắt đầu xây dựng Prototype)** — với scope hẹp: chỉ triển khai thí điểm tại 1 dự án (VD: Ocean Park) trước, giới hạn chức năng ở tra cứu + đặt lịch xem nhà, chưa mở rộng đàm phán/thanh toán.

**Justification (Lý giải quyết định dựa trên bằng chứng kỹ thuật và chi phí):**

> Bài toán có database có cấu trúc sẵn, nhu cầu tra cứu lặp lại rất cao (phù hợp LLM + function-calling), rủi ro được giới hạn tốt nhờ Operational Boundary rõ ràng và cơ chế escalate sang người khi chạm các quyết định tài chính/pháp lý. Chi phí xây dựng thấp hơn nhiều so với tổn thất hiện tại từ tỉ lệ khách rời bỏ vì chờ lâu (~25-30%). Tuy nhiên, cần thí điểm ở quy mô nhỏ (1 dự án, 4-6 tuần) để đo lường độ chính xác truy vấn dữ liệu thực tế và mức độ tin tưởng của khách hàng trước khi nhân rộng sang Times City và Smart City.