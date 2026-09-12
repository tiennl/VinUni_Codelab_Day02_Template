# 02 — Problem Deep-Dive Report

**Vin Smart Future — Lab 02: AI Product Scoping (Nhóm)**
**Bài toán:** Trợ lý ảo AI (VinHome Advisor) chuyên tư vấn mua bán bất động sản tại siêu quần thể **Ocean City (Vinhomes Ocean Park 1, 2, 3 - Gia Lâm & Hưng Yên)**.

---

## 3.1. Current-State Workflow Mapping

*(Bản đồ quy trình tư vấn thủ công hiện tại)*

```
1. Khách hàng để lại thông tin trên Ads/Web hoặc chat qua Fanpage
        │
        ▼
2. 🔴 Sales tiếp nhận, gọi điện khai thác nhu cầu (thường mất thời gian vì khách bận)
        │
        ▼
3. 🔴 Sales check giỏ hàng nội bộ của OP1, OP2, OP3 để tìm căn khớp ngân sách
        │
        ▼
4. 🔄 Gửi thủ công báo giá, layout, tiến độ thanh toán cho khách qua Zalo
        │
        ▼
5. 🔴 Khách hỏi thêm về tiện ích (trường học, bãi đỗ xe) hoặc so sánh OP1 vs OP2
        │
        ▼
6. 🔄 Sales chốt lịch hẹn đưa đón khách xuống xem sa bàn/thực địa
```

**Tổng cộng = ~45–60 phút/lượt tư vấn sâu** (từ lúc có lead đến khi khách đồng ý xem nhà).

**Bottleneck chính:** 
- Bước 3 và Bước 5: Phân tích và so sánh giữa 3 đại dự án cực lớn (Ocean Park 1, 2, 3) tốn rất nhiều thời gian. Khách hàng thường xuyên bị "ngợp" thông tin.
- Lead online đổ về buổi tối/cuối tuần bị rớt mạng do thời gian chờ Sales phản hồi quá lâu.

---

## 3.2. Problem Statement (6-field)

| Field | Nội dung chi tiết |
|---|---|
| **1. Actor / Operator** | Khách hàng mua nhà/nhà đầu tư BĐS; Chuyên viên Kinh doanh (Sales) phân phối dự án Ocean City. |
| **2. Current Workflow** | Lead đổ về → Sales tiếp cận → Khai thác nhu cầu → Tra cứu giỏ hàng chéo giữa 3 dự án OP1, 2, 3 → Gửi thông tin (giá, mặt bằng, CSBH) → Xử lý câu hỏi thắc mắc về vị trí/tiện ích → Chốt lịch hẹn xem thực địa. Toàn bộ quy trình thủ công 100%. |
| **3. Bottleneck** | (a) Lượng dữ liệu quá khổng lồ (hàng nghìn căn, hàng chục phân khu, CSBH thay đổi liên tục) khiến Sales mất nhiều thời gian tra cứu; (b) Khách hàng online phải chờ đợi lâu ngoài giờ hành chính, dẫn đến tỷ lệ drop-off cao. |
| **4. Business Impact** | Lãng phí 60% thời gian của Sales vào các khâu tư vấn lặp lại (thông tin dự án, giá, tiện ích). Tỉ lệ rớt lead online lên tới 35-40% do tốc độ phản hồi chậm. Việc Sales báo nhầm chính sách/giá cũng gây ảnh hưởng uy tín nghiêm trọng. |
| **5. Success Metric** | (1) Chatbot trả lời thông tin giỏ hàng, giá niêm yết trong vòng dưới 5 giây phục vụ 24/7; (2) Tỉ lệ Lead chuyển đổi thành lịch hẹn xem nhà tăng 25%; (3) Độ chính xác khi cung cấp thông tin CSBH và Layout đạt trên 95%. |
| **6. Operational Boundary** | **Được phép:** Tư vấn phân khu, tra cứu giỏ hàng/giá tham khảo, gửi layout, giải đáp tiện ích (Vinschool, VinBus...), đặt lịch xem sa bàn. **TUYỆT ĐỐI KHÔNG được:** Tự cam kết mức lợi nhuận đầu tư/tăng giá; không được tự ý đàm phán giảm giá; không thay thế Sales chốt cọc. **Cần duyệt (HITL):** Khi khách yêu cầu thương lượng sâu, tính toán dòng tiền vay phức tạp, hoặc muốn chuyển cọc → Handoff lập tức sang người. |

---

## 3.3. Future-State Flow & AI Fit

**AI-Fit Matrix:** [ ] Rule / State-Machine  [X] **LLM Feature (RAG + Function-calling)**  [ ] Agentic Loop

> **Vì sao chọn LLM Feature?**
> - **Rule-based:** Ocean City quá rộng lớn, kịch bản rule-based không thể cover hết cách khách hàng hỏi tự nhiên (VD: "Có 2 tỷ mua được căn nào ở OP2 không em?").
> - **LLM Feature:** Tối ưu nhất. Sử dụng NLU để hiểu ý định khách + RAG/Function-calling để bóc tách dữ liệu từ CSDL chuẩn của Chủ đầu tư (giá, CSBH hiện hành).
> - **Agentic Loop:** Chưa an toàn vì trong ngành BĐS, quyết định chốt sale cuối cùng vẫn phải do con người thực hiện (quy định pháp lý và số tiền lớn).

**Future-State Flow:**

```
Khách hỏi trên Web/Zalo (VD: "Căn 2PN OP1 giờ giá thế nào?")
        │
        ▼
🔵 [AI Step] Hiểu ý định: Nhu cầu (Ở thực), Dự án (OP1), Loại hình (2PN)
        │
        ▼
🔵 [AI Step] Gọi hàm (Function-call) check giỏ hàng hiện tại của OP1
        │
        ▼
🔵 [AI Step] Phản hồi khách hàng: Đưa ra 2-3 Option tốt nhất kèm Layout (RAG)
        │
        ├── Khách thắc mắc về khoảng cách / tiện ích ──▶ 🔵 AI tiếp tục trả lời (RAG)
        │
        ├── Khách ưng ý muốn đi xem ──▶ 🔵 AI tạo form đặt lịch hẹn với Sales
        │
        └── Khách muốn hỏi sâu về lãi suất / cọc tiền
                    │
                    ▼
            🟢 [Human Step - Handoff] Báo Sales tiếp quản ngay lập tức
                    │
                    ▼
            ↩️ [Fallback] Trợ lý ảo phản hồi chung chung hoặc confidence thấp sẽ 
               tự động ngưng trả lời và báo Sales vào hỗ trợ, không tự bịa thông tin.
```

---

## 🏁 Phase 5 — Evaluate

### AI Readiness Checklist
- [X] Hệ thống CSDL của Chủ đầu tư (Bảng hàng, CSBH, hình ảnh Layout) đã có sẵn và chuẩn hoá.
- [X] Xác định được ranh giới rõ ràng: Trợ lý ảo làm phễu lọc và tư vấn sơ bộ, phần chốt sale/tài chính để lại cho con người.
- [ ] Cần tích hợp với CRM/Zalo OA để việc Handoff cho Sales mượt mà, không làm đứt đoạn trải nghiệm khách hàng.

### Quyết định cuối cùng của Ban Giám Đốc Vin Smart Future

[X] **GO (Bắt đầu xây dựng Prototype)**

**Lý giải quyết định (Justification):**
> Việc áp dụng trợ lý AI tư vấn là cực kỳ cấp thiết với quần thể quy mô khổng lồ như Ocean City. Chi phí triển khai LLM RAG hiện nay rẻ hơn rất nhiều so với chi phí mất lead (Mỗi lead BĐS rất đắt tiền). Ranh giới an toàn (Operational Boundary) đã được thiết lập chặt chẽ để tránh rủi ro pháp lý. Tuy nhiên, giai đoạn đầu sẽ chỉ đóng vai trò "Phễu lọc" để chốt lịch hẹn xem sa bàn, chưa đi sâu vào xử lý hợp đồng đặt cọc.

