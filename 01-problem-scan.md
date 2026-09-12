# 01 — Problem Scan & Quick Cards

**Học viên:** Ngô Lê Thúy Tiên
**Branch:** `tien`
**Lab:** 02 — AI Product Scoping (Vin Smart Future)
**Vai trò:** AI Product Engineer tại Vin Smart Future, khảo sát mảng **Vinhomes — Kinh doanh & CSKH dự án Ocean Park**.

---

## 🏛️ Bối cảnh khảo sát

Tôi dành buổi sáng ngồi cạnh một chuyên viên tư vấn tại sàn giao dịch Vinhomes Ocean Park (Gia Lâm) và đọc log hotline của tổng đài. Điều đập vào mắt tôi không phải là thiếu khách — mà là **lead đến nhanh hơn tốc độ con người xử lý**. Mỗi chuyên viên ôm 30–50 lead/ngày từ hotline, Facebook Ads và Zalo OA, trong khi bảng hàng Ocean Park 1/2/3 có hơn 2.000 sản phẩm nằm trong file Excel cập nhật hằng ngày. Khách hỏi lúc 22h thì sáng hôm sau mới có người trả lời, và lúc đó khách đã nhắn cho 3 sàn khác.

Phần lớn các bài toán dưới đây xuất phát từ quan sát thực địa này, phần còn lại tôi quét thêm qua các công ty thành viên khác để có góc nhìn so sánh.

---

# 🔍 Phase 1 — SCAN: Bảng quét cơ hội

| # | Subsidiary | Lens | Mô tả ngắn bài toán |
|---|------------|------|---------------------|
| 1 | **Vinhomes** | AI-upgrade | Khách hỏi mua BĐS Ocean Park ngoài giờ hành chính phải chờ 4–12 tiếng mới có chuyên viên phản hồi; lead nguội và chạy sang sàn khác. |
| 2 | **Vinhomes** | Tốn thời gian | Chuyên viên lọc thủ công bảng hàng Excel >2.000 căn để chọn ra 3 căn phù hợp nhu cầu khách, mất ~15 phút/lead. |
| 3 | **Vinhomes** | Lặp lại | Soạn lại gần như cùng một tin tư vấn Zalo (giới thiệu căn + lý do phù hợp + bảng giá) cho hàng chục khách mỗi ngày, mất ~10 phút/tin. |
| 4 | **Vinhomes** | Pain từ người khác | Cư dân Ocean Park gửi phản ánh dịch vụ trên app Vinhomes Resident, CSKH phân loại & route thủ công, SLA phản hồi trung bình 12 tiếng. |
| 5 | **Xanh SM** | Tốn thời gian | Điều phối viên xử lý thủ công sự cố hết pin thực địa của tài xế (tra vị trí → tra trạm sạc trống → soạn chỉ dẫn), mất 15 phút/lượt. |
| 6 | **Vinmec** | Lặp lại | Bác sĩ viết tay tóm tắt hồ sơ xuất viện cho từng bệnh nhân, mất 20–30 phút/hồ sơ. |

> **Ghi chú về cách dùng lens:** Bài toán #1 và #2 lộ ra khi soi bằng lens *Tốn thời gian* và *AI-upgrade*, nhưng điều làm tôi chọn nó là lens *Pain từ người khác*: chính chuyên viên tư vấn phàn nàn rằng "em mất khách không phải vì tư vấn dở, mà vì trả lời chậm".

---

# 🃏 Phase 2 — QUICK-ASSESS: 3 Quick Problem Cards

Top 3 được chọn từ bảng SCAN: **#1+#2 (Vinhomes — tư vấn chọn căn)**, **#4 (Vinhomes — phản ánh cư dân)**, **#6 (Vinmec — tóm tắt hồ sơ xuất viện)**.

## Card #1 — Trợ lý tư vấn chọn BĐS Vinhomes Ocean Park

```text
┌─────────────────────────────────────────────────────────────┐
│ QUICK PROBLEM CARD #1                                       │
│                                                             │
│ Bài toán: Khách quan tâm BĐS Ocean Park phải chờ nhiều giờ  │
│ mới nhận được danh sách căn phù hợp với nhu cầu của mình.   │
│ Công ty thành viên: [x] Vinhomes                            │
│                                                             │
│ Ai đang đau (Actor)?                                        │
│   - Chuyên viên tư vấn (ôm 30-50 lead/ngày, quá tải)        │
│   - Khách hàng tiềm năng (chờ lâu, nhận tư vấn rập khuôn)   │
│                                                             │
│ Workflow thủ công hiện tại (5 bước):                        │
│   1. Nhận lead (hotline/Facebook/Zalo OA)                   │
│   → 2. Gọi/nhắn hỏi 5-7 câu về nhu cầu (khu, loại hình,     │
│        mục đích, ngân sách, quy mô)                         │
│   → 3. Mở Excel bảng hàng >2.000 căn, lọc tay bằng filter   │
│   → 4. Soạn tin Zalo giới thiệu 3 căn + lý do phù hợp       │
│   → 5. Gửi & follow-up thủ công                             │
│                                                             │
│ Bước nào tốn thời gian/lỗi nhất? Bước 3 + 4 (⏱ 25 phút/lead)│
│ AI có thể nhảy vào hỗ trợ ở bước nào?                        │
│   Bước 2 (chatbot tự hỏi 5 câu có nút bấm sẵn) và           │
│   Bước 3-4 (lọc bảng hàng + sinh lý do gợi ý cá nhân hoá)   │
│                                                             │
│ Đo thành công bằng gì (Metric có số)?                        │
│   "Giảm thời gian phản hồi lead đầu tiên từ 4 giờ ──> dưới  │
│    1 phút; thời gian dựng shortlist 25 phút ──> dưới 3 phút"│
│                                                             │
│ Quick Architecture: [x] LLM Feature (lọc bằng rule +         │
│                          LLM sinh lý do gợi ý)              │
└─────────────────────────────────────────────────────────────┘
```

## Card #2 — Phân loại & route phản ánh cư dân Ocean Park

```text
┌─────────────────────────────────────────────────────────────┐
│ QUICK PROBLEM CARD #2                                       │
│                                                             │
│ Bài toán: Phản ánh của cư dân trên app Vinhomes Resident    │
│ được phân loại và chuyển bộ phận xử lý hoàn toàn thủ công.  │
│ Công ty thành viên: [x] Vinhomes                            │
│                                                             │
│ Ai đang đau (Actor)? Nhân viên CSKH Ban quản lý toà nhà     │
│                                                             │
│ Workflow thủ công hiện tại (4 bước):                        │
│   1. Cư dân gửi phản ánh dạng văn bản tự do                 │
│   → 2. CSKH đọc, đoán nhóm vấn đề (kỹ thuật/an ninh/vệ      │
│        sinh/phí dịch vụ)                                    │
│   → 3. Chuyển ticket sang bộ phận phụ trách                 │
│   → 4. Soạn tin phản hồi cư dân                             │
│                                                             │
│ Bước nào tốn thời gian/lỗi nhất? Bước 2-3 (⏱ 8 phút/ticket, │
│ route sai ~20% phải chuyển lại lần 2)                       │
│ AI có thể nhảy vào hỗ trợ ở bước nào? Bước 2 (phân loại)     │
│                                                             │
│ Đo thành công bằng gì (Metric có số)?                        │
│   "85% ticket được phân loại đúng nhóm dưới 10 giây;        │
│    SLA phản hồi lần đầu từ 12 giờ ──> dưới 2 giờ"           │
│                                                             │
│ Quick Architecture: [x] LLM Feature (text classification)   │
└─────────────────────────────────────────────────────────────┘
```

## Card #3 — Trợ lý soạn tóm tắt hồ sơ xuất viện Vinmec

```text
┌─────────────────────────────────────────────────────────────┐
│ QUICK PROBLEM CARD #3                                       │
│                                                             │
│ Bài toán: Bác sĩ mất 20-30 phút viết tay tóm tắt hồ sơ      │
│ xuất viện cho mỗi bệnh nhân.                                │
│ Công ty thành viên: [x] Vinmec                              │
│                                                             │
│ Ai đang đau (Actor)? Bác sĩ điều trị & điều dưỡng hành chính│
│                                                             │
│ Workflow thủ công hiện tại (4 bước):                        │
│   1. Đọc lại toàn bộ bệnh án, kết quả cận lâm sàng          │
│   → 2. Viết tóm tắt diễn biến điều trị                      │
│   → 3. Kê đơn & dặn dò tái khám                             │
│   → 4. Ký duyệt, bàn giao cho bệnh nhân                     │
│                                                             │
│ Bước nào tốn thời gian/lỗi nhất? Bước 1-2 (⏱ 25 phút/hồ sơ) │
│ AI có thể nhảy vào hỗ trợ ở bước nào? Bước 2 (draft tóm tắt)│
│                                                             │
│ Đo thành công bằng gì (Metric có số)?                        │
│   "Giảm thời gian soạn tóm tắt từ 25 phút ──> dưới 8 phút,  │
│    100% bản nháp có bác sĩ ký duyệt trước khi phát hành"    │
│                                                             │
│ Quick Architecture: [x] LLM Feature (bắt buộc HITL)         │
└─────────────────────────────────────────────────────────────┘
```

---

# 🗳️ Quyết định chọn bài toán Deep-Dive

Nhóm chọn **Card #1 — Trợ lý tư vấn chọn BĐS Vinhomes Ocean Park** để phân tích sâu ở file [02-deep-dive-report.md](02-deep-dive-report.md).

**Vì sao chọn Card #1:**
- Tác động doanh thu trực tiếp và đo được: mỗi lead nguội là một cơ hội bán hàng mất đi, và tốc độ phản hồi là biến số mà chúng tôi kiểm soát được ngay.
- Rủi ro khi AI sai ở mức chấp nhận được: đầu ra là **gợi ý tham khảo**, không phải quyết định tài chính — mọi con số giá và cam kết vẫn do chuyên viên xác nhận.
- Dữ liệu đã sẵn sàng: bảng hàng Ocean Park là dữ liệu có cấu trúc, có thể đưa vào hệ thống ngay mà không cần dự án làm sạch dữ liệu kéo dài.

**Vì sao loại Card #2:** Phân loại phản ánh cư dân là bài toán tốt nhưng phần lớn có thể giải bằng bộ luật từ khoá cộng một form chọn nhóm vấn đề ngay trên app — dùng LLM ở đây là dùng dao mổ trâu, và phần khó thật sự (điều phối nguồn lực kỹ thuật) nằm ngoài phạm vi AI.

**Vì sao loại Card #3:** Rủi ro lâm sàng cao, quy trình phát hành hồ sơ y tế chịu ràng buộc pháp lý chặt, và việc tiếp cận dữ liệu bệnh án cho một buổi lab là không khả thi. Bài toán này xứng đáng có riêng một dự án với đội ngũ y khoa tham gia từ đầu, không phải một prototype 3 tiếng.
