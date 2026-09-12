# 01 — Problem Scan & Quick Assessment
**Vin Smart Future — Lab 02: AI Product Scoping (Nhóm)**

---

## 🔍 Phase 1 — SCAN (Cá nhân)

Quét hoạt động vận hành các công ty thành viên Vingroup bằng **4 Lenses**: Lặp lại (Repetitive) / Tốn thời gian (Time-consuming) / AI có thể tốt hơn (AI-upgrade) / Pain từ người khác (Stakeholder Pain).

| # | Subsidiary | Lens | Mô tả ngắn bài toán |
|---|---|---|---|
| 1 | **Vinhomes** | Stakeholder Pain + AI-upgrade | Khách hàng phải chờ đợi lâu do Tư vấn viên (TVV) mất nhiều thời gian tra cứu thủ công tình trạng căn hộ/biệt thự tại Times City, Ocean Park, Smart City; dẫn đến TVV bị quá tải giờ cao điểm. |
| 2 | VinFast | Time-consuming | Bộ phận CSKH tốn nhiều thời gian gõ lại các câu trả lời thủ công liên quan đến chính sách bảo hành pin EV cho khách hàng, khiến tốc độ phản hồi chậm. |
| 3 | Xanh SM | Repetitive | Tài xế liên tục phải báo cáo lỗi định vị/sai điểm đón cho tổng đài một cách thủ công, gây chậm trễ trong việc điều vận. |
| 4 | Vinmec | AI-upgrade | Chatbot đặt lịch khám bệnh phản hồi quá rập khuôn, không hiểu được các triệu chứng phức tạp nên bệnh nhân vẫn phải gọi tổng đài. |
| 5 | Vinpearl / VinWonders | Time-consuming | Quản lý phải tự tay tổng hợp các đánh giá của khách hàng từ nhiều nguồn (Facebook, Google, Zalo) để làm báo cáo chất lượng dịch vụ hàng tuần. |

---

## 🃏 Phase 2 — QUICK-ASSESS: 3 Quick Problem Cards

### ⭐ Quick Problem Card #1 (Bài toán được chọn để Deep-Dive)

```
┌─────────────────────────────────────────────────────────────┐
│ QUICK PROBLEM CARD #1                                       │
│                                                             │
│ Bài toán: Thời gian chờ đợi của khách hàng kéo dài do tư    │
│ vấn viên (TVV) phải tra cứu thủ công quỹ căn hộ/biệt thự    │
│ tại các dự án Times City, Ocean Park, Smart City.           │
│                                                             │
│ Công ty thành viên: [X] Vinhomes                            │
│                                                             │
│ Ai đang đau (Actor)?                                        │
│ - Khách mua/thuê: bực bội vì chờ đợi lâu, phải hỏi lại nhiều│
│ - Nhân viên TVV (Sales/CSKH): kiệt sức vì lặp lại thao tác  │
│   tra cứu trên Excel/CRM vào giờ cao điểm.                  │
│                                                             │
│ Workflow thủ công hiện tại:                                 │
│ 1. Khách hàng inbox Zalo/Hotline hỏi thông tin căn hộ ──>   │
│ 2. TVV mở file Excel/CRM để tìm kiếm căn khớp yêu cầu ──>   │
│ 3. TVV chụp màn hình thông tin, giá bán gửi lại cho khách ──>│
│ 4. Khách hỏi thêm chi tiết (pháp lý, tiến độ, hướng) ──>    │
│ 5. TVV lại tra cứu thủ công và tiến hành đặt lịch hẹn xem nhà│
│                                                             │
│ Bước tốn thời gian/lỗi nhất? Bước 2 & 4                     │
│ (⏱ ~15-20 phút/lượt; rủi ro cao báo sai giá hoặc tình trạng) │
│                                                             │
│ AI có thể hỗ trợ ở bước nào? Bước 1-4 (Tự động tiếp nhận,   │
│ truy vấn database realtime, gợi ý căn và đặt lịch hẹn).     │
│                                                             │
│ Đo thành công bằng gì (Metric có số)?                       │
│ - Rút ngắn thời gian phản hồi từ ~20 phút ──> dưới 30 giây. │
│ - Tăng tỉ lệ khách đặt lịch xem nhà thành công qua chatbot  │
│   lên mức ≥ 45%.                                            │
│                                                             │
│ Quick Architecture: [ ] No AI  [ ] Rule  [X] LLM  [ ] Agent │
│ (Sử dụng LLM kết hợp RAG/Function-calling vào DB BĐS sẵn có)│
└─────────────────────────────────────────────────────────────┘
```

### Quick Problem Card #2 (Ứng viên phụ — không đi tiếp Deep-Dive)

```
┌─────────────────────────────────────────────────────────────┐
│ QUICK PROBLEM CARD #2                                       │
│                                                             │
│ Bài toán: Chatbot tư vấn lịch khám Vinmec hiện tại rập      │
│ khuôn, không phân tích được triệu chứng đan xen của bệnh nhân│
│ Công ty thành viên: [X] Vinmec                              │
│ Ai đang đau: Bệnh nhân (buộc gọi hotline) + Tổng đài viên   │
│ (bị dồn việc vào khung giờ sáng).                           │
│ Workflow: Khách chat với Bot ──> Bot báo lỗi/không hiểu ──> │
│ Khách gọi Hotline ──> Tổng đài viên nghe và đặt lịch thủ công│
│ Bước tốn thời gian nhất: Gọi lại hotline để tư vấn triệu chứng│
│ (⏱ ~8-10 phút chờ máy).                                     │
│ Metric: Giảm tỉ lệ chuyển tiếp ra hotline từ 45% ──> dưới 20%│
│ Quick Architecture: [ ] No AI [ ] Rule [ ] LLM [X] Agent    │
└─────────────────────────────────────────────────────────────┘
```

### Quick Problem Card #3 (Ứng viên phụ — không đi tiếp Deep-Dive)

```
┌─────────────────────────────────────────────────────────────┐
│ QUICK PROBLEM CARD #3                                       │
│                                                             │
│ Bài toán: Đội CSKH VinFast mất nhiều công sức để phản hồi   │
│ thủ công các thắc mắc thường gặp về chính sách bảo hành pin.│
│ Công ty thành viên: [X] VinFast                             │
│ Ai đang đau: Nhân viên CSKH (phải lặp lại text) + Khách hàng│
│ Workflow: Khách inbox hỏi ──> CSKH lấy số VIN xe ──> Tra cứu│
│ tài liệu bảo hành theo dòng xe ──> Copy & Paste trả lời.    │
│ Bước tốn thời gian nhất: Tra cứu chính sách cho từng xe     │
│ (⏱ ~5-7 phút/lượt).                                         │
│ Metric: Giảm thời gian phản hồi trung bình từ 7 phút ──>    │
│ dưới 1 phút.                                                │
│ Quick Architecture: [ ] No AI [ ] Rule [X] LLM [ ] Agent    │
└─────────────────────────────────────────────────────────────┘
```

> **Lý do chọn Card #1 để Deep-Dive:** Bài toán này có sẵn hệ thống database cấu trúc tốt để triển khai Function-calling/RAG, tần suất hỏi đáp rất lớn hàng ngày, và dễ dàng kiểm soát rủi ro bằng cách đưa ra Operational Boundary cụ thể (báo giá nhưng không chốt cọc). Phù hợp để làm prototype nhanh trong lab.
