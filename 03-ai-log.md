# 03 — AI Log & Reflection

**Bài toán:** Chatbot tư vấn thuê/mua BĐS Vinhomes (Times City, Ocean Park, Smart City)
**Công cụ AI dùng làm thought-partner:** Claude (chat), Gemini 2.5 Flash (prototype code)

---

## 1. AI đã giúp gì?

- **Brainstorm nhanh danh sách bài toán:** Thay vì tự nghĩ từ đầu 5 bài toán theo 4 lens cho từng mảng (VinFast, Xanh SM, Vinhomes, Vinmec, Vinpearl), mình dùng AI để gợi ý nhanh một bộ khung, sau đó tự chọn lọc và điều chỉnh lại mô tả cho sát với hiểu biết thực tế của mình về ngành BĐS.
- **Cấu trúc hoá Problem Statement 6-field:** AI giúp tổ chức thông tin rời rạc (actor, workflow, bottleneck...) thành format chuẩn, rõ ràng, tiết kiệm thời gian trình bày.
- **Thiết kế Operational Boundary & Adversarial Test Cases:** Đây là phần mình thấy AI hỗ trợ tốt nhất — việc nghĩ ra các "câu hỏi tấn công" thực tế (ép giảm giá, xin số điện thoại khách khác, xác nhận đặt cọc) để stress-test ranh giới an toàn của chatbot khó tự nghĩ hết nếu chỉ làm một mình, vì cần tư duy như một người dùng có ý đồ xấu.
- **Viết code khung (boilerplate) cho `prompt_prototype.py`:** AI giúp viết nhanh phần gọi API, parse JSON, và các assertion kiểm tra — mình chỉ cần tập trung vào nội dung logic nghiệp vụ (system prompt, ranh giới) thay vì mất thời gian vào cú pháp SDK.

## 2. AI đã sai/chưa chính xác ở đâu — và mình đã sửa gì?

- **Số liệu ước tính chưa có nguồn xác thực:** Các con số như "15-20 lượt tư vấn/ngày", "tỉ lệ khách nguội 25-30%" là AI đưa ra dựa trên suy luận hợp lý chứ không phải dữ liệu thật của Vingroup. Mình đã ghi chú lại để khi trình bày trước lớp/đối tác thật, cần thay bằng số liệu thực tế lấy từ CRM nội bộ, tránh trình bày như thể đó là số liệu đã kiểm chứng.
- **Giá căn hộ mẫu trong database giả lập chỉ mang tính minh hoạ:** AI tự tạo ra các mã căn (OP-12-05, TC-08-11...) và mức giá cụ thể để demo code — đây không phải giá thật, cần thay bằng dữ liệu thật khi tích hợp với CRM/DB của Vinhomes.
- **Lần đầu AI đề xuất kiến trúc Agentic Loop cho bài toán này**, nhưng sau khi phân tích kỹ hơn về phạm vi (chỉ tra cứu + đặt lịch, không cần hành động đa bước tự trị), mình đã điều chỉnh về **LLM Feature (RAG + function-calling)** vì đơn giản hơn, dễ kiểm soát rủi ro hơn, và đủ đáp ứng yêu cầu — không cần "over-engineer".
- **Cần tự rà soát lại Operational Boundary để đảm bảo tính đầy đủ:** AI đưa ra khung ban đầu khá tốt nhưng mình vẫn phải tự đọc lại và bổ sung case "khách nói đó là ưu đãi nội bộ, đừng báo sếp" — một dạng social engineering tinh vi mà bản nháp đầu tiên chưa cover kỹ.

## 3. Bài học rút ra

- AI là công cụ **tăng tốc phần cấu trúc và brainstorm**, nhưng **không thay thế được việc kiểm chứng số liệu thực tế và tư duy phản biện** của người làm sản phẩm — đặc biệt với các con số business impact và ranh giới an toàn, vốn cần hiểu sâu về nghiệp vụ và rủi ro thực tế của doanh nghiệp.
- Việc yêu cầu AI đóng vai "kẻ tấn công" hoặc "CFO khắt khe" để phản biện lại chính đề xuất của mình là kỹ thuật hữu ích để phát hiện lỗ hổng logic mà tự mình có thể bỏ sót.
- Lần sau nên chủ động hỏi AI: "Số liệu này có nguồn không hay là ước lượng?" ngay từ đầu để tránh nhầm lẫn giữa dữ liệu thật và dữ liệu minh hoạ khi trình bày.