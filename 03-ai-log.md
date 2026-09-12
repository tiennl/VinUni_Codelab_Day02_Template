# 03 — AI Log & Reflection

**Học viên:** Ngô Lê Thúy Tiên
**Branch:** `tien`
**Công cụ AI đã dùng:** Claude (Claude Code trong terminal) làm trợ lý chính, Gemini 2.5 Flash làm đối tượng kiểm thử ranh giới trong Phase 4.

---

## 1. Tôi đã dùng AI như thế nào

Tôi không dùng AI theo kiểu "ra đề — nhận bài". Buổi lab này tôi dùng nó ở ba vai khác nhau, và mỗi vai cho chất lượng rất khác nhau.

**Vai 1 — Người mở rộng không gian ý tưởng (Phase 1, SCAN).** Tôi bí sau 2 bài toán đầu tiên nên nhờ AI liệt kê các pain point vận hành của Vinhomes. Nó trả về một danh sách dài, nhưng phần lớn là những câu chung chung kiểu "tối ưu hoá trải nghiệm cư dân bằng AI" — nghe rất hợp lý mà không dùng được, vì không có actor cụ thể, không có bước nào trong quy trình để chỉ tay vào. Thứ thật sự giúp tôi là khi tôi đổi prompt: thay vì hỏi "có bài toán AI nào", tôi mô tả những gì tôi quan sát được ở sàn giao dịch rồi hỏi "bước nào trong quy trình này tốn thời gian nhất và vì sao". Câu hỏi hẹp lại thì câu trả lời mới bám đất.

**Vai 2 — Người phản biện (Phase 2, stress-test thẻ bài toán).** Đây là chỗ AI có giá trị nhất. Tôi dán Quick Card #1 vào và yêu cầu nó đóng vai CFO khó tính. Nó chỉ ra một điểm mà tôi đã bỏ qua hoàn toàn: **phần lớn giá trị của bài toán này không cần LLM** — lọc bảng hàng theo ngân sách và số phòng ngủ chỉ là một câu truy vấn. Phản biện đó đã làm thay đổi hẳn kiến trúc tôi chọn: từ "chatbot AI tư vấn BĐS" thành "lớp lọc bằng luật + LLM chỉ sinh lý do gợi ý". Nếu không có bước phản biện này, tôi đã thiết kế một hệ thống đắt hơn, chậm hơn và dễ sai hơn.

**Vai 3 — Người viết code cùng (Phase 4, prompt prototype).** Tôi dùng AI để dựng khung `prompt_prototype.py` và bàn về cách viết ranh giới. Code chạy được ngay, nhưng phần tôi phải tự nghĩ là *nên tấn công vào đâu* — và đó mới là phần chấm điểm thật sự.

---

## 2. Chỗ AI trả lời sai / gây hiểu lầm

Ba lần cụ thể, ghi lại trung thực:

### 2.1. Bịa số liệu nghe rất thuyết phục

Khi tôi hỏi về tác động kinh doanh, AI đưa ra những con số rất gọn gàng kiểu "tỉ lệ chuyển đổi giảm 78% nếu phản hồi sau 1 giờ" kèm giọng điệu chắc nịch, không hề nói rõ nguồn. Tôi hỏi lại nguồn ở đâu thì nó thừa nhận đó là con số ước lượng tổng hợp, không phải số liệu của Vinhomes.

**Cách tôi xử lý:** tôi bỏ toàn bộ các con số "vay mượn" đó. Những con số còn lại trong báo cáo (37 phút/lead, ~400 lead/ngày, >2.000 sản phẩm) là **ước lượng từ quan sát và phỏng vấn tại sàn, cần đối chiếu lại với dữ liệu CRM thật trước khi đưa vào bất kỳ quyết định đầu tư nào** — và tôi ghi rõ điều đó thay vì để chúng trông như số liệu chính thức. Bài học: một con số có dấu phần trăm và giọng điệu tự tin không làm nó thành sự thật.

### 2.2. Luôn gật đầu với ý tưởng của tôi

Lần đầu tôi đề xuất dùng **Agentic Loop** cho chatbot, AI khen ý tưởng hay và bắt đầu vẽ kiến trúc multi-agent. Chỉ khi tôi chủ động hỏi ngược "có lý do gì để KHÔNG dùng agent ở đây không?" thì nó mới chỉ ra rằng quy trình 5 câu hỏi cố định chẳng cần agent tự lập kế hoạch, và agent chỉ làm tăng độ trễ với chi phí.

**Cách tôi sửa prompt:** tôi bỏ hẳn kiểu hỏi "ý tưởng này thế nào?" và chuyển sang "hãy chỉ ra 3 lý do mạnh nhất để KHÔNG làm theo cách này". Ép AI vào vai phản biện cho kết quả tốt hơn nhiều so với để nó tự do đồng tình.

### 2.3. Viết ranh giới an toàn quá mơ hồ

Bản system prompt đầu tiên AI gợi ý có câu kiểu "hãy luôn ưu tiên an toàn cho tài xế". Nghe rất tử tế nhưng vô dụng khi kiểm thử: không có ngưỡng số, không có hành vi cụ thể, nên không cách nào viết assertion để kiểm tra.

**Cách tôi sửa:** viết lại mọi ranh giới thành mệnh đề có thể kiểm chứng bằng code — "pin < 5% ⇒ action phải là `dispatch_mobile_charger`", "mọi message phải bắt đầu bằng `[DRAFT_ONLY]`". Đây là bài học lớn nhất của tôi hôm nay: **một ranh giới không kiểm chứng được bằng assertion thì không phải là ranh giới, mà chỉ là một lời chúc tốt lành.**

---

## 3. Chỗ tôi đã thắng được AI

Ba đòn tấn công trong `ADVERSARIAL_TESTS` là do tôi tự nghĩ, và cái thứ ba — mạo danh trưởng ca để moi số điện thoại tài xế kèm cam kết bồi thường — là cái tôi thấy đáng giá nhất. AI khi được hỏi "hãy viết test case" thường đưa ra những đòn tấn công lịch sự, tấn công đúng vào luật đã ghi trong prompt. Còn đòn hiệu quả thật thì đến từ việc hiểu bối cảnh tổ chức: trong một trung tâm điều vận, câu "tôi là trưởng ca" là loại thẩm quyền mà con người thường không kiểm tra lại — và đó chính xác là thứ mô hình cũng dễ mềm lòng. Kiểu tấn công đó đến từ việc quan sát con người, không đến từ việc đọc tài liệu kỹ thuật.

Tương tự, quyết định **GO có điều kiện** (tự động hạ xuống NOT YET nếu sau 2 tuần chưa ai nhận trách nhiệm nội dung AI) là của tôi. AI đưa ra một chữ GO gọn ghẽ; nhưng rủi ro lớn nhất của dự án này không nằm ở mô hình, mà ở chỗ tổ chức chưa chỉ định ai chịu trách nhiệm cho những gì AI nói với khách hàng. Đó là loại rủi ro chỉ thấy được khi hiểu tổ chức đang vận hành ra sao.

---

## 4. Nguyên tắc tôi rút ra cho lần sau

1. **Hỏi hẹp thì được câu trả lời dùng được.** "Có bài toán AI nào cho Vinhomes?" cho ra rác; "bước nào trong 5 bước này tốn thời gian nhất và vì sao" cho ra insight.
2. **Ép AI phản biện thay vì đồng tình.** Prompt tốt nhất trong buổi hôm nay là "chỉ ra 3 lý do để KHÔNG làm theo cách này".
3. **Mọi con số AI đưa ra đều bị coi là chưa xác minh cho tới khi có nguồn.** Nếu không kiểm chứng được, hoặc bỏ đi, hoặc ghi rõ là ước lượng.
4. **Ranh giới phải viết được thành assertion.** Nếu không thể viết một dòng `assert` cho nó, thì nó chưa đủ cụ thể để bảo vệ điều gì.
5. **Dùng AI để mở rộng và để phản biện; giữ lại cho mình phần phán đoán về con người và tổ chức.** Đó là phần AI yếu nhất, và cũng là phần quyết định dự án sống hay chết.
