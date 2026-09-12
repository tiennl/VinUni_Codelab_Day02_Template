# 01 — Phase 1: Problem Scan & Quick Cards

**Vin Smart Future — Lab 02: AI Product Scoping (Nhóm Linh)**

---

## 🔍 Danh sách các bài toán (4 Lenses)

Quét qua quy trình bán hàng của đại dự án **Ocean City (Vinhomes Ocean Park 1, 2, 3)**:

| # | Hạng mục | Lens | Mô tả ngắn bài toán |
|---|----------|------|---------------------|
| 1 | Bán hàng | Lặp lại | Sales liên tục phải gửi đi gửi lại cùng một bộ tài liệu (mặt bằng, CSBH) cho hàng trăm khách hàng khác nhau. |
| 2 | CSKH | Tốn thời gian | Trả lời thủ công các câu hỏi lặp lại của cư dân/khách hàng về vị trí, khoảng cách tiện ích, lịch trình VinBus đi trung tâm. |
| 3 | Bán hàng | AI-upgrade | Khách hàng bị "ngợp" trước hàng nghìn sản phẩm của 3 dự án OP1, 2, 3. Cần một công cụ lọc và gợi ý căn hộ thông minh hơn là bộ lọc web truyền thống. |
| 4 | CSKH | Pain từ người khác | Khách hàng phàn nàn vì nhắn tin hỏi giá và chính sách vào buổi tối muộn nhưng đến sáng hôm sau mới nhận được phản hồi từ Sales. |
| 5 | Vận hành | Lặp lại | Sales tra cứu thủ công tình trạng giỏ hàng (căn nào còn, căn nào hết) trên nhiều file Excel hoặc nhóm chat nội bộ khác nhau. |

---

## 🃏 Thẻ bài toán tiêu biểu (Quick Problem Card)

```text
┌─────────────────────────────────────────────────────────────┐
│ QUICK PROBLEM CARD #1                                       │
│                                                             │
│ Bài toán: Khách hàng hỏi thông tin căn hộ ngoài giờ hành    │
│ chính phải chờ đợi lâu, Sales bận rộn tra cứu giỏ hàng 3    │
│ dự án (OP1, OP2, OP3) gây chậm trễ phản hồi.                │
│ Hạng mục: [X] Vinhomes (Ocean City)                         │
│                                                             │
│ Ai đang đau? Khách hàng (chờ đợi), Sales (quá tải)          │
│                                                             │
│ Workflow thủ công hiện tại:                                 │
│   1. Khách nhắn nhu cầu ──> 2. Sales đọc tin nhắn           │
│   ──> 3. Sales tra cứu giỏ hàng 3 dự án ──> 4. Gửi báo giá  │
│                                                             │
│ Bước nào tốn nhất? Bước 3 (Tra cứu - ⏱ 15-20 phút/lượt)     │
│ AI nhảy vào hỗ trợ ở bước nào? Bước 2, 3, 4 (Phễu lọc)      │
│ (AI hiểu nhu cầu -> Tự tra DB -> Gửi gợi ý & đặt lịch hẹn)  │
│                                                             │
│ Đo thành công bằng gì (Metric)?                             │
│ Giảm thời gian phản hồi từ 20 phút ──> dưới 5 giây (24/7).  │
│                                                             │
│ Quick Architecture: [X] LLM Feature (RAG + Function call)   │
└─────────────────────────────────────────────────────────────┘
```
