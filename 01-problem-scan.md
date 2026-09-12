# 01 — Problem Scan & Quick Assessment
**Vin Smart Future — Lab 02: AI Product Scoping**

---

## 🔍 Phase 1 — SCAN (Cá nhân)

Quét hoạt động vận hành các công ty thành viên Vingroup bằng **4 Lenses**: Lặp lại (Repetitive) / Tốn thời gian (Time-consuming) / AI có thể tốt hơn (AI-upgrade) / Pain từ người khác (Stakeholder Pain).

| # | Subsidiary | Lens | Mô tả ngắn bài toán |
|---|---|---|---|
| 1 | **Vinhomes** | Stakeholder Pain + AI-upgrade | Khách hàng chờ lâu vì tư vấn viên (TVV) phải tra cứu thủ công thông tin căn hộ/biệt thự thuê/mua tại Times City, Ocean Park, Smart City; TVV quá tải vào giờ cao điểm. |
| 2 | VinFast | Time-consuming | Nhân viên CSKH mất nhiều thời gian trả lời thủ công các câu hỏi lặp lại về chính sách bảo hành pin EV, dẫn tới thời gian phản hồi trung bình cao. |
| 3 | Xanh SM | Repetitive | Tài xế phải tự báo cáo thủ công các lệch tuyến/lỗi định vị cho tổng đài điều vận, gây chậm trễ xử lý sự cố thực địa. |
| 4 | Vinmec | AI-upgrade | Chatbot đặt lịch khám hiện tại trả lời rập khuôn, không xử lý được câu hỏi triệu chứng phức tạp, khiến bệnh nhân phải gọi tổng đài. |
| 5 | Vinpearl / VinWonders | Time-consuming | Nhân viên phải thủ công tổng hợp phản hồi khách hàng từ nhiều kênh (Google Review, Zalo, hotline) để làm báo cáo tuần cho quản lý. |

---

## 🃏 Phase 2 — QUICK-ASSESS: 3 Quick Problem Cards

### ⭐ Quick Problem Card #1 (Bài toán được chọn để Deep-Dive)

```
┌─────────────────────────────────────────────────────────────┐
│ QUICK PROBLEM CARD #1                                        │
│                                                               │
│ Bài toán: Khách hàng mất nhiều thời gian chờ tư vấn viên     │
│ (TVV) tra cứu thủ công thông tin căn hộ/biệt thự phù hợp     │
│ tại các dự án Times City, Ocean Park, Smart City.            │
│                                                               │
│ Công ty thành viên: [X] Vinhomes                             │
│                                                               │
│ Ai đang đau (Actor)?                                         │
│ - Khách hàng: chờ lâu, phải nhắn/gọi nhiều lần mới có info   │
│ - Tư vấn viên (Sales/CSKH): quá tải, tra cứu thủ công lặp lại │
│                                                               │
│ Workflow thủ công hiện tại:                                  │
│ 1. Khách nhắn Zalo/Hotline hỏi căn hộ ──>                    │
│ 2. TVV tra Excel/CRM nội bộ tìm căn phù hợp ──>              │
│ 3. TVV chụp ảnh/bảng giá gửi thủ công qua Zalo ──>           │
│ 4. Khách hỏi thêm (pháp lý, tiến độ, lịch xem nhà) ──>       │
│ 5. TVV lặp lại tra cứu, đặt lịch xem nhà thủ công            │
│                                                               │
│ Bước tốn thời gian/lỗi nhất? Bước 2 & 4                      │
│ (⏱ ~15-20 phút/lượt tra cứu, dễ báo sai giá/tình trạng căn)  │
│                                                               │
│ AI có thể hỗ trợ ở bước nào? Bước 1-4 (tự động trả lời,      │
│ query database realtime, đề xuất căn phù hợp, đặt lịch xem)  │
│                                                               │
│ Đo thành công bằng gì (Metric có số)?                        │
│ - Giảm thời gian phản hồi từ ~20 phút ──> dưới 30 giây       │
│ - Tăng tỉ lệ khách đặt lịch xem nhà thành công qua chatbot   │
│   lên ≥ 40%                                                   │
│                                                               │
│ Quick Architecture: [ ] No AI  [ ] Rule  [X] LLM  [ ] Agent  │
│ (LLM + RAG/function-calling vào database BĐS có sẵn)         │
└─────────────────────────────────────────────────────────────┘
```

### Quick Problem Card #2 (Ứng viên phụ — không đi tiếp Deep-Dive)

```
┌─────────────────────────────────────────────────────────────┐
│ QUICK PROBLEM CARD #2                                        │
│                                                               │
│ Bài toán: Chatbot đặt lịch khám Vinmec trả lời rập khuôn,    │
│ chưa xử lý được câu hỏi triệu chứng phức tạp.                │
│ Công ty thành viên: [X] Vinmec                               │
│ Ai đang đau: Bệnh nhân (phải gọi tổng đài) + Nhân viên tổng   │
│ đài (quá tải vào giờ cao điểm sáng).                          │
│ Workflow: Bệnh nhân chat với bot ──> Bot không hiểu ──>       │
│ Bệnh nhân gọi hotline ──> Nhân viên xử lý thủ công.           │
│ Bước tốn thời gian nhất: Bước gọi lại hotline (⏱ ~8-10 phút   │
│ chờ máy giờ cao điểm).                                        │
│ Metric: Giảm tỉ lệ chuyển hotline từ 45% ──> dưới 20%.        │
│ Quick Architecture: [ ] No AI [ ] Rule [ ] LLM [X] Agent      │
│ (cần agent xử lý đa bước: hỏi triệu chứng, gợi ý khoa khám,   │
│ đặt lịch — độ rủi ro y tế cao hơn nên cân nhắc kỹ HITL).      │
└─────────────────────────────────────────────────────────────┘
```

### Quick Problem Card #3 (Ứng viên phụ — không đi tiếp Deep-Dive)

```
┌─────────────────────────────────────────────────────────────┐
│ QUICK PROBLEM CARD #3                                        │
│                                                               │
│ Bài toán: CSKH VinFast trả lời thủ công các câu hỏi lặp lại   │
│ về chính sách bảo hành pin EV.                                │
│ Công ty thành viên: [X] VinFast                               │
│ Ai đang đau: Nhân viên CSKH (lặp lại cùng câu trả lời hàng    │
│ chục lần/ngày) + Khách hàng (chờ lâu để được giải đáp).       │
│ Workflow: Khách gửi câu hỏi ──> CSKH tra chính sách bảo hành   │
│ theo VIN xe ──> Soạn trả lời thủ công.                        │
│ Bước tốn thời gian nhất: Tra cứu chính sách theo từng dòng xe │
│ (⏱ ~5-7 phút/lượt).                                           │
│ Metric: Giảm thời gian phản hồi trung bình từ 7 phút ──>      │
│ dưới 1 phút.                                                  │
│ Quick Architecture: [ ] No AI [ ] Rule [X] LLM [ ] Agent      │
└─────────────────────────────────────────────────────────────┘
```

> **Lý do chọn Card #1 để Deep-Dive:** Bài toán có database BĐS có cấu trúc sẵn (dễ triển khai RAG/function-calling), tần suất tương tác cao, và rủi ro nghiệp vụ (giá, pháp lý) có thể kiểm soát tốt qua Operational Boundary rõ ràng — phù hợp làm prototype trong thời gian lab ngắn.