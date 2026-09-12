# 02 — Deep-Dive Report: Trợ lý AI Bán hàng Vinhomes

**Ý tưởng được nhóm lựa chọn:** Trợ lý giúp khách hàng tìm căn hộ phù hợp và hỗ trợ nhân viên kinh doanh ở bước tư vấn ban đầu.

> Báo cáo không coi các mục tiêu phần trăm là kết quả đã đạt. Baseline và dữ liệu sản phẩm thật vẫn cần được Vinhomes cung cấp để kiểm chứng.

---

# 🏗️ Phase 3 — DEEP-DIVE

## 3.1. Current-State Workflow Mapping

### Tình huống đại diện

Khách hàng nói: “Tôi có khoảng 5 tỷ, muốn mua căn 2 phòng ngủ ở Hà Nội để ở và có thể vay khoảng 40%.”

### Quy trình hiện tại

```text
[1. Khách tìm thông tin trên nhiều nguồn — 15–30 phút*]
        ↓
[2. Khách gửi nhu cầu cho nhân viên kinh doanh — 2–5 phút]
        ↓  🔄 HANDOFF: Khách hàng → Nhân viên kinh doanh
[3. Nhân viên hỏi lại ngân sách, vị trí, loại căn, mục đích mua, nhu cầu vay — 5–10 phút]
        ↓
[4. Nhân viên tra cứu và lọc giỏ hàng — 10–20 phút*]  🔴 BOTTLENECK
        ↓
[5. Nhân viên so sánh căn và giải thích phương án tài chính — 10–15 phút*]
        ↓  🔄 HANDOFF: Nhân viên kinh doanh → Khách hàng
[6. Gửi danh sách; khách phản hồi và điều chỉnh tiêu chí — 5–10 phút]

Tổng ước tính ban đầu: 47–90 phút/lượt.
*Cần bấm giờ với dữ liệu thật để xác lập baseline.
```

### Bảng chi tiết

| Bước | Actor / System | Input | Output | Thời gian ước tính | Vấn đề |
|---:|---|---|---|---:|---|
| 1 | Khách hàng | Nhu cầu cá nhân | Danh sách căn tự tìm | 15–30 phút | Nhiều nguồn, khó so sánh |
| 2 | Khách hàng | Nhu cầu chưa có cấu trúc | Tin nhắn/cuộc gọi | 2–5 phút | Dễ thiếu thông tin |
| 3 | Nhân viên kinh doanh | Mô tả của khách | Bộ tiêu chí ban đầu | 5–10 phút | Hỏi lặp lại nhiều câu |
| 4 | Nhân viên kinh doanh | Tiêu chí + dữ liệu sản phẩm | Danh sách căn sơ bộ | 10–20 phút | **Bottleneck:** lọc nhiều điều kiện và kiểm tra tình trạng căn |
| 5 | Nhân viên kinh doanh | Danh sách căn + chính sách | Bảng so sánh và tư vấn | 10–15 phút | Dễ dùng dữ liệu cũ hoặc giải thích thiếu nhất quán |
| 6 | Khách hàng và nhân viên | Danh sách đề xuất | Phản hồi, lịch tư vấn hoặc tiêu chí mới | 5–10 phút | Có thể lặp lại nhiều vòng |

Sơ đồ trực quan: [04-workflow-diagram.png](04-workflow-diagram.png).

---

## 3.2. Problem Statement (6-field) & Metrics

### Problem Statement

Làm thế nào giúp khách hàng nhanh chóng tìm được căn hộ Vinhomes phù hợp với nhu cầu và khả năng tài chính, đồng thời giảm thời gian tư vấn ban đầu cho đội ngũ kinh doanh?

| Field | Nội dung chi tiết |
|---|---|
| **1. Actor / Operator** | Khách hàng đang tìm mua căn hộ Vinhomes; nhân viên kinh doanh tiếp nhận và tư vấn khách hàng tiềm năng. |
| **2. Current Workflow** | Khách tự tìm trên nhiều nguồn, gửi nhu cầu, nhân viên hỏi lại, lọc giỏ hàng, so sánh căn và giải thích chính sách trước khi đặt lịch tư vấn. |
| **3. Bottleneck** | Bước chuyển nhu cầu viết bằng ngôn ngữ tự nhiên thành tiêu chí rõ, rồi lọc các căn còn hiệu lực theo ngân sách, vị trí, số phòng ngủ và nhu cầu vay. |
| **4. Business Impact** | Làm tăng thời gian xử lý ban đầu của nhân viên và thời gian chờ của khách. Tác động thực tế sẽ được tính bằng: số lượt tư vấn × thời gian trung bình mỗi lượt; hiện chưa có baseline từ Vinhomes. |
| **5. Success Metric** | Giảm 30% thời gian tìm căn; tăng 20% tỷ lệ khách tìm được căn phù hợp; tăng 15% tỷ lệ để lại thông tin; tăng 10% tỷ lệ đặt lịch; độ chính xác đề xuất trên 90%. |
| **6. Operational Boundary** | AI chỉ hiểu nhu cầu và giải thích kết quả từ dữ liệu được cung cấp. Rule quyết định căn nào đạt điều kiện bắt buộc. AI không tự tạo giá, tình trạng căn, chính sách, cam kết tài chính, liên hệ khách hoặc đặt lịch khi chưa được xác nhận. |

### Định nghĩa metric và cách đo

| Metric | Baseline | Mục tiêu | Cách đo |
|---|---|---|---|
| Thời gian tìm được danh sách phù hợp | `T0`: trung vị thời gian của quy trình hiện tại | `≤ 0,70 × T0` | Từ lúc khách bắt đầu nhập nhu cầu đến lúc nhận danh sách được xác nhận |
| Tỷ lệ tìm được ít nhất một căn phù hợp | `F0`: tỷ lệ hiện tại | Tăng tương đối 20% so với `F0` | Khách chọn “phù hợp” và nhân viên xác nhận căn còn hiệu lực, thỏa điều kiện bắt buộc |
| Tỷ lệ để lại thông tin | `L0`: tỷ lệ hiện tại | Tăng tương đối 15% | Số khách đồng ý gửi thông tin / số phiên đủ điều kiện |
| Tỷ lệ đặt lịch tư vấn hoặc xem nhà | `A0`: tỷ lệ hiện tại | Tăng tương đối 10% | Số lịch được khách xác nhận / số phiên có căn phù hợp |
| Độ chính xác đề xuất | Chưa có bộ test | Trên 90% | Tỷ lệ đề xuất có mã căn hợp lệ, còn hiệu lực và thỏa toàn bộ điều kiện bắt buộc |

**Guardrail:** 0 giá hoặc chính sách do AI tự tạo; 0 lịch hẹn tự đặt; 100% đề xuất hiển thị mã căn, nguồn và thời điểm cập nhật.

---

## 3.3. Future-State Flow & AI Fit

### Future-State Flow

```text
[1. Khách nhập nhu cầu bằng câu tự nhiên]
        ↓
[2. 🔵 LLM trích xuất: ngân sách, vị trí, loại căn, mục đích mua, nhu cầu vay]
        ↓
[3. Thiếu dữ liệu quan trọng? → 🔵 hỏi tối đa 2 câu ngắn]
        ↓
[4. Rule kiểm tra độ mới của dữ liệu và lọc điều kiện bắt buộc]
        ↓
[5. 🔵 LLM trình bày tối đa 3 căn + lý do + cảnh báo]
        ↓
[6. 🟢 Khách chọn căn hoặc yêu cầu sửa tiêu chí]
        ↓
[7. 🟢 Nhân viên kiểm tra giá, tình trạng và chính sách]
        ↓  🔄 HANDOFF: AI → Nhân viên kinh doanh
[8. Khách xác nhận để lại thông tin hoặc đặt lịch]

↩️ FALLBACK:
- Không có dữ liệu hoặc dữ liệu quá cũ → không đề xuất, chuyển nhân viên.
- LLM trả sai cấu trúc → dùng Form nhập tiêu chí và bộ lọc Rule.
- Có hai nguồn mâu thuẫn → gắn cờ cần kiểm tra, không tự chọn nguồn.
```

### AI-Fit Matrix

| Mức | Dùng vào đâu | Điểm mạnh | Hạn chế / rủi ro | Quyết định |
|---|---|---|---|---|
| **Rule / State-Machine** | Lọc ngân sách, vị trí, số phòng ngủ, trạng thái căn và độ mới dữ liệu | Nhanh, kiểm soát được, kết quả rõ | Không hiểu tốt nhu cầu diễn đạt tự nhiên như “vừa túi tiền” hoặc “gần trường” | **Bắt buộc dùng làm nền** |
| **LLM Feature** | Hiểu câu tự nhiên, hỏi thêm thông tin, giải thích lý do đề xuất | Hội thoại tự nhiên, giảm câu hỏi lặp lại | Có thể hiểu sai hoặc tự tạo thông tin | **Chọn cho giai đoạn đầu** |
| **Agentic Loop** | Tự hỏi, tìm căn, tính vay, cập nhật CRM và đặt lịch | Tự động hóa nhiều bước | Cần nhiều API và quyền ghi; hậu quả lớn nếu tự hành động sai | **Chưa chọn** |

### Giải pháp lựa chọn

Giai đoạn đầu sử dụng **Rule-based + LLM Feature**:

- LLM hiểu nhu cầu và tạo câu trả lời dễ đọc.
- Rule lọc sản phẩm từ nguồn dữ liệu thật.
- Khách hàng xác nhận nhu cầu; nhân viên xác nhận thông tin thương mại.
- Agentic Loop chỉ được xem xét khi dữ liệu, API, phân quyền và cơ chế hoàn tác đã ổn định.

### Operational Boundary

**AI được phép:**

- Trích xuất nhu cầu từ câu người dùng nhập.
- Hỏi tối đa 2 câu khi thiếu thông tin quan trọng.
- Giải thích tối đa 3 căn đã qua bộ lọc Rule.
- Gắn cờ dữ liệu thiếu, cũ hoặc mâu thuẫn.

**AI không được phép:**

- Tự tạo giá, mã căn, trạng thái, chính sách vay hoặc ưu đãi.
- Đảm bảo lợi nhuận đầu tư, phê duyệt khoản vay hoặc đưa tư vấn pháp lý.
- Tự thu thập dữ liệu nhạy cảm không cần thiết.
- Tự gửi thông tin cho nhân viên, cập nhật CRM hoặc đặt lịch.
- Xếp hạng khách hàng theo đặc điểm nhạy cảm.

**Human-in-the-loop:**

- Khách xác nhận tiêu chí và đồng ý trước khi để lại thông tin.
- Nhân viên kinh doanh kiểm tra giá, tình trạng căn và chính sách trước khi tư vấn chính thức.
- Quản lý dữ liệu xử lý các nguồn mâu thuẫn.

---

# 💻 Phase 4 — TECHNICAL PROMPT PROTOTYPE

File code: [starter-code/prompt_prototype.py](starter-code/prompt_prototype.py).

Prototype có:

- System Prompt quy định vai trò, JSON output và ranh giới cấm.
- LLM chỉ được dùng dữ liệu sản phẩm có trong input.
- Chế độ an toàn khi thiếu API key hoặc khi output của mô hình không hợp lệ.
- Bốn adversarial tests: ép bịa giá, tự đặt lịch, làm lộ dữ liệu và đề xuất theo tiêu chí nhạy cảm.

**Kết quả chạy tại máy hiện tại:** 4/4 boundary tests đạt ở chế độ offline; autograder phần code đạt 5/5 tiêu chí. Chưa gọi Gemini thật vì môi trường chưa có API key và SDK; đây không được tính là kết quả đánh giá chất lượng mô hình.

### JSON output chính

```json
{
  "status_tag": "[DRAFT_ONLY]",
  "status": "READY_TO_RECOMMEND | NEEDS_MORE_INFO | NEEDS_HUMAN_REVIEW | REFUSED",
  "customer_need": {
    "budget_vnd": null,
    "location": null,
    "bedrooms": null,
    "purchase_purpose": null,
    "loan_ratio": null,
    "special_requirements": []
  },
  "clarifying_questions": [],
  "recommendations": [],
  "warnings": [],
  "next_action": {
    "type": "NONE | REQUEST_INFO | REQUEST_HUMAN_REVIEW | OFFER_BOOKING",
    "requires_user_confirmation": true
  }
}
```

---

# 🏁 Phase 5 — EVALUATE

## AI Readiness Checklist

1. [ ] **Có dữ liệu mẫu/logs sạch:** Chưa có snapshot giỏ hàng chính thức và bộ hội thoại đã ẩn danh.
2. [x] **Rủi ro AI sai có thể kiểm soát:** Có Rule, Human-in-the-loop, nguồn dữ liệu, bản nháp và Fallback.
3. [ ] **Stakeholders sẵn sàng đổi quy trình:** Chưa phỏng vấn nhân viên kinh doanh và quản lý dữ liệu.

## Quyết định

- [ ] **GO** — triển khai vào quy trình thật.
- [x] **NOT YET** — chuẩn bị dữ liệu và baseline trước.
- [ ] **NO-GO** — dừng dự án.

### Justification

Ý tưởng có AI Fit rõ: LLM xử lý ngôn ngữ, Rule xử lý dữ liệu và người thật duyệt quyết định quan trọng. Tuy nhiên, nhóm chưa có giỏ hàng chính thức, API, baseline hoặc kết quả phỏng vấn nhân viên kinh doanh. Vì vậy, chưa nên đưa sản phẩm vào quy trình bán hàng thật. Nhóm có thể tiếp tục làm prototype offline để kiểm tra prompt và cách đo.

## Pilot nhỏ nhất để chuyển sang GO

| Thành phần | Thiết kế pilot |
|---|---|
| Dữ liệu | Snapshot 30–50 sản phẩm đã ẩn thông tin nhạy cảm, có mã căn, giá, vị trí, số phòng, trạng thái và thời điểm cập nhật |
| Tình huống | Ít nhất 20 nhu cầu khách hàng đã ẩn danh hoặc do nhân viên kinh doanh xây dựng |
| Người đánh giá | 3–5 nhân viên kinh doanh kiểm tra tiêu chí và kết quả |
| So sánh | Cùng một tình huống được xử lý bằng quy trình hiện tại và Rule + LLM |
| Thời gian | 1 tuần đo baseline, 1 tuần thử prototype |
| Điều kiện đạt | Thời gian giảm ≥30%, độ chính xác >90%, không có dữ liệu bịa và nhân viên chấp nhận ít nhất 70% danh sách đề xuất |

## Rủi ro và Fallback

| Rủi ro | Cách phát hiện | Fallback |
|---|---|---|
| Giá hoặc trạng thái căn cũ | Kiểm tra thời điểm cập nhật trước khi lọc | Không đề xuất; chuyển nhân viên kiểm tra |
| LLM hiểu sai nhu cầu | Hiển thị tiêu chí để khách xác nhận | Quay về Form và bộ lọc Rule |
| AI tự tạo thông tin | So mọi mã căn và trường dữ liệu với nguồn | Loại kết quả, ghi log và chuyển người thật |
| Khách nhập dữ liệu nhạy cảm | Bộ lọc phát hiện trường không cần thiết | Cảnh báo, không lưu và hướng dẫn nhập lại |
| Đặt lịch hoặc gửi lead khi chưa đồng ý | Kiểm tra cờ xác nhận của khách | Chặn hành động; chỉ hiển thị bản nháp |

## Exit Criteria

Dừng hoặc hạ xuống Rule-only nếu sau pilot xảy ra một trong các trường hợp:

- Độ chính xác đề xuất không đạt 90%.
- Có bất kỳ giá, mã căn hoặc chính sách nào do AI tự tạo.
- Thời gian tìm căn không giảm ít nhất 30%.
- Nhân viên phải sửa phần lớn đề xuất hoặc không tin nguồn dữ liệu.
