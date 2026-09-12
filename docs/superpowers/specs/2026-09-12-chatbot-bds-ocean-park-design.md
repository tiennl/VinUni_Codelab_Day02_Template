# Design — Chatbot tư vấn BĐS Vinhomes Ocean Park (Frontend)

**Ngày:** 2026-09-12
**Phạm vi:** Chỉ frontend. Backend do thành viên khác làm bằng Python/FastAPI.
**Bối cảnh:** Lab 02 — AI Product Scoping (VinUni × Vin Smart Future).

---

## 1. Mục tiêu

Dựng một trợ lý AI dạng hội thoại giúp khách hàng tìm bất động sản phù hợp tại
Vinhomes Ocean Park (Gia Lâm). Trợ lý hỏi 5 câu, mỗi câu đưa ra các lựa chọn bấm
sẵn, rồi trả về danh sách BĐS gợi ý kèm lý do.

**Tiêu chí thành công:** demo chạy được trên máy local trong buổi lab, và nối
được với FastAPI khi backend hoàn thành mà không phải sửa lại giao diện.

**Ngoài phạm vi:** xác thực người dùng, thanh toán, dữ liệu BĐS thật, nhập liệu
tự do bằng ngôn ngữ tự nhiên, đa ngôn ngữ, responsive cho máy tính bảng.

---

## 2. Stack

| Thành phần | Lựa chọn |
|---|---|
| Framework | Next.js 15, App Router |
| Ngôn ngữ | TypeScript |
| CSS | Tailwind v4 |
| Component | shadcn/ui |
| Test | Vitest |
| Vị trí | `frontend/` trong repo lab |

Cài các component shadcn: `button`, `card`, `badge`, `progress`, `toggle-group`,
`skeleton`, `separator`.

Không dùng thư viện quản lý state ngoài. State của ứng dụng chỉ gồm danh sách
câu đã hỏi, câu trả lời và bước hiện tại — một `useReducer` là đủ.

---

## 3. Hợp đồng API với Backend

Đây là phần cần thống nhất với người làm backend **trước khi hai bên viết code**.

### 3.1. Nguyên tắc: backend không giữ trạng thái

Mỗi lần gọi, frontend gửi lại **toàn bộ** câu trả lời từ đầu. Backend không lưu
session, không cần Redis, không cần dọn session hết hạn. Backend nhận `answers`
rồi quyết định: hỏi tiếp hay trả kết quả.

Đánh đổi: payload lớn dần theo số câu (không đáng kể với 5 câu). Đổi lại backend
đơn giản hơn hẳn và frontend có thể sửa câu trả lời cũ mà không cần API riêng.

### 3.2. Request

```
POST /api/chat
Content-Type: application/json
```

```jsonc
{
  "session_id": "a3f2c1d0-...",   // frontend sinh bằng crypto.randomUUID().
                                   // Backend chỉ dùng để ghi log. Không bắt buộc.
  "answers": {
    "khu_vuc": ["ocp1", "ocp2"],   // câu multi  -> mảng chuỗi
    "loai_hinh": "can_ho",         // câu single -> chuỗi
    "muc_dich": "o_luon"
  }
}
```

`answers` rỗng (`{}`) nghĩa là bắt đầu hội thoại — backend trả về câu hỏi đầu tiên.

### 3.3. Response

Backend trả về một trong hai dạng, phân biệt bằng trường `type`.

**Dạng 1 — còn hỏi tiếp:**

```jsonc
{
  "type": "question",
  "progress": { "current": 4, "total": 5 },
  "step": {
    "id": "ngan_sach",
    "type": "single",              // "single" | "multi"
    "question": "Ngân sách dự kiến của bạn?",
    "hint": "Chọn khoảng gần nhất, mình sẽ linh động ±10%",  // optional, có thể null
    "options": [
      { "value": "duoi_3ty", "label": "Dưới 3 tỷ" },
      { "value": "3_5ty",    "label": "3 - 5 tỷ" }
    ]
  }
}
```

**Dạng 2 — đã đủ thông tin:**

```jsonc
{
  "type": "results",
  "summary": "Với nhu cầu ở luôn, ngân sách 3-5 tỷ và cần 2 phòng ngủ, mình gợi ý 3 căn sau:",
  "listings": [
    {
      "id": "ocp2-sapphire2-1203",
      "name": "Sapphire 2 — Căn 1203",
      "subdivision": "Ocean Park 2",
      "price_label": "4,2 tỷ",
      "area_m2": 68,
      "bedrooms": 2,
      "bathrooms": 2,
      "image_url": "https://...",   // có thể null -> frontend dùng ảnh placeholder
      "match_score": 92,            // số nguyên 0-100
      "reasons": [
        "Nằm trong tầm ngân sách 3-5 tỷ",
        "Cách Vinschool Ocean Park 400m, hợp nhu cầu ở cùng con nhỏ"
      ],
      "detail_url": "https://..."   // có thể null -> frontend ẩn nút Xem chi tiết
    }
  ]
}
```

Hai quyết định cố ý trong hợp đồng này:

- `price_label` là chuỗi backend đã định dạng sẵn, không phải số. Tránh hai bên
  định dạng tiền lệch nhau.
- `reasons` là **mảng chuỗi**, mỗi phần tử 1 câu ngắn (tối đa 3 phần tử). Frontend
  render thành gạch đầu dòng có icon. Nếu backend trả một đoạn văn dài thì phần
  "AI giải thích" mất tác dụng thị giác.

### 3.4. Lỗi

Backend trả HTTP status chuẩn. Với lỗi, body dạng:

```jsonc
{ "detail": "Thông điệp lỗi ngắn gọn" }
```

Frontend không hiển thị `detail` cho người dùng cuối (có thể lộ chi tiết kỹ thuật);
nó chỉ ghi vào console và hiện thông điệp thân thiện.

### 3.5. Kết nối

`next.config.ts` dùng `rewrites` để chuyển tiếp request sang FastAPI:

```ts
async rewrites() {
  return [{ source: '/api/:path*', destination: 'http://localhost:8000/api/:path*' }]
}
```

Frontend luôn gọi đường dẫn tương đối `/api/chat`. Trình duyệt coi như đang gọi
chính origin của nó, nên **không phát sinh CORS** và backend không phải cấu hình
thêm middleware.

Khi demo, chạy hai tiến trình: `npm run dev` (cổng 3000) và
`uvicorn main:app --reload` (cổng 8000). Mở `http://localhost:3000`.

---

## 4. Bộ câu hỏi (mock)

Frontend mock đúng 5 câu dưới đây, theo đúng shape của mục 3.3. Khi backend sẵn
sàng, backend là nguồn sự thật và bộ mock này chỉ còn dùng cho chế độ offline.

| # | `id` | Câu hỏi | Kiểu | Lựa chọn (`value` / `label`) |
|---|---|---|---|---|
| 1 | `khu_vuc` | Bạn quan tâm phân khu nào? | multi | `ocp1`/Ocean Park 1 · `ocp2`/Ocean Park 2 (The Empire) · `ocp3`/Ocean Park 3 (The Crown) · `chua_ro`/Chưa rõ, gợi ý giúp mình |
| 2 | `loai_hinh` | Bạn tìm loại hình nào? | single | `can_ho`/Căn hộ chung cư · `shophouse`/Shophouse, nhà phố TM · `biet_thu`/Biệt thự · `lien_ke`/Liền kề |
| 3 | `muc_dich` | Mua với mục đích gì? | single | `o_luon`/Ở luôn · `cho_thue`/Đầu tư cho thuê · `tang_gia`/Đầu tư chờ tăng giá · `nguoi_than`/Mua cho người thân |
| 4 | `ngan_sach` | Ngân sách dự kiến? | single | `duoi_3ty`/Dưới 3 tỷ · `3_5ty`/3 - 5 tỷ · `5_8ty`/5 - 8 tỷ · `8_15ty`/8 - 15 tỷ · `tren_15ty`/Trên 15 tỷ |
| 5 | `quy_mo` | Quy mô cần? | single | `1pn`/1 phòng ngủ · `2pn`/2 phòng ngủ · `3pn`/3 phòng ngủ · `4pn_tro_len`/4 phòng ngủ trở lên |

Câu 3 (`muc_dich`) là câu mang tính "AI" nhất: nó cho phép backend đổi hẳn giọng
điệu của `reasons` — khách đầu tư thì nhấn tỷ suất cho thuê, khách ở thì nhấn
trường học và tiện ích sống.

---

## 5. Giao diện

Dạng hội thoại (bong bóng chat) kèm thanh tiến trình ở đầu trang.

```
┌──────────────────────────────────┐
│ 🏠 Trợ lý BĐS    ●●○○○   2/5     │   <- ProgressHeader
├──────────────────────────────────┤
│ ┌────────────────────────┐       │
│ │ Bạn quan tâm phân khu  │       │   <- ChatBubble (bot)
│ │ nào?                   │       │
│ └────────────────────────┘       │
│         ┌──────────────────────┐ │
│         │ Ocean Park 2      ✎  │ │   <- AnswerBubble (có nút sửa)
│         └──────────────────────┘ │
│ ┌────────────────────────┐       │
│ │ Ngân sách của bạn?     │       │
│ └────────────────────────┘       │
│  [ Dưới 3 tỷ ]  [ 3 - 5 tỷ ]     │   <- OptionPicker
│  [ 5 - 8 tỷ ]   [ Trên 8 tỷ ]    │
└──────────────────────────────────┘
```

Quy tắc tương tác:

- Câu **single**: bấm một chip là chọn và chuyển câu ngay, không cần nút xác nhận.
- Câu **multi**: chip bật/tắt được, phải bấm nút "Xác nhận" mới sang câu tiếp.
  Nút bị vô hiệu hoá khi chưa chọn gì.
- Nút ✎ trên bong bóng trả lời: quay lại câu đó, **xoá mọi câu trả lời sau nó**.
- Khu vực chat tự cuộn xuống tin nhắn mới nhất.
- Sau mỗi lựa chọn, hiện typing indicator tối thiểu 400ms trước khi câu tiếp hiện
  ra — kể cả khi dùng mock, để nhịp hội thoại không bị nhảy phựt.

Màn hình kết quả hiện `summary` rồi tới lưới `ListingCard`. Mỗi card gồm: ảnh,
tên căn, phân khu, `price_label`, diện tích, số phòng ngủ/vệ sinh, badge
`match_score`, danh sách `reasons` dạng gạch đầu dòng, và hai nút CTA
("Liên hệ tư vấn", "Xem chi tiết").

Nút "Liên hệ tư vấn" trong phạm vi bản này chỉ hiện một thông báo xác nhận tại chỗ
— không gửi đi đâu, không mở form. Đây là ranh giới có chủ ý: sản phẩm chỉ gợi ý,
việc chốt khách vẫn do người thật làm.

---

## 6. Cấu trúc file

```
frontend/
  app/
    page.tsx                      shell tĩnh, render <ChatContainer/>
    layout.tsx                     font, metadata
    globals.css
  components/
    chat/
      chat-container.tsx           "use client" — reducer + điều phối. File duy
                                   nhất biết về state.
      progress-header.tsx          tên trợ lý + chấm tiến trình
      chat-bubble.tsx              bong bóng bot
      answer-bubble.tsx            bong bóng người dùng + nút sửa
      option-picker.tsx            single -> chip Button; multi -> ToggleGroup
      typing-indicator.tsx         ba chấm nhấp nháy
    listings/
      listing-results.tsx          summary + lưới card
      listing-card.tsx             một căn BĐS
  lib/
    types.ts                       types của hợp đồng mục 3, dùng chung
    chat-reducer.ts                state machine thuần, không phụ thuộc React DOM
    chat-client.ts                 điểm nối duy nhất mock <-> backend thật
    mock-flow.ts                   5 câu hỏi của mục 4
    mock-listings.ts               ~8 căn giả
  next.config.ts
  vitest.config.ts
```

Tách `chat-reducer.ts` ra khỏi `chat-container.tsx` để test được state machine mà
không cần dựng môi trường DOM.

---

## 7. Chuyển từ mock sang backend thật

Toàn bộ việc gọi API nằm trong `lib/chat-client.ts`, với một hàm duy nhất:

```ts
export async function sendAnswers(
  sessionId: string,
  answers: Answers,
): Promise<ChatResponse>
```

Hàm này đọc `process.env.NEXT_PUBLIC_USE_MOCK`:

- `"true"` (mặc định) — chạy logic mock cục bộ: chọn câu tiếp theo từ `mock-flow.ts`,
  hoặc khi đã đủ 5 câu thì lọc `mock-listings.ts` theo `answers` và trả về dạng
  `results`.
- `"false"` — `fetch('/api/chat', { method: 'POST', ... })`.

Việc nối backend do đó là **đổi một biến môi trường**, không sửa dòng UI nào. Cả
hai nhánh đều trả về cùng kiểu `ChatResponse`, nên TypeScript bắt lỗi ngay nếu
backend đổi shape.

Logic lọc trong nhánh mock cần đủ thật để các câu trả lời khác nhau cho ra kết quả
khác nhau (ít nhất lọc theo `ngan_sach` và `quy_mo`). Một mock luôn trả về cùng 3
căn sẽ lộ ngay khi demo.

---

## 8. Xử lý tình huống lệch

| Tình huống | Hành vi |
|---|---|
| `fetch` lỗi hoặc backend chết | Bong bóng lỗi "Mình chưa kết nối được, thử lại nhé" + nút Thử lại. Không trắng trang. |
| `listings: []` | "Chưa có căn nào khớp hoàn toàn" + nút "Nới ngân sách" quay về câu `ngan_sach`. |
| `image_url` null hoặc ảnh hỏng | Ảnh placeholder dạng gradient, không để ô vỡ. |
| `detail_url` null | Ẩn nút "Xem chi tiết", giữ nút "Liên hệ tư vấn". |
| Bấm ✎ sửa câu cũ | Xoá mọi câu trả lời sau câu đó rồi hỏi lại. Không để state mâu thuẫn. |
| Đang chờ response | Vô hiệu hoá mọi chip để tránh bấm hai lần. |

---

## 9. Kiểm thử

Logic thật sự duy nhất là reducer. Vitest, kiểm `lib/chat-reducer.ts`:

- Trả lời câu single thì tiến sang câu tiếp và lưu đúng `answers`.
- Trả lời câu multi lưu được mảng nhiều giá trị.
- Sửa câu thứ 2 thì xoá câu trả lời thứ 3, 4, 5.
- Nhận response `results` thì chuyển sang trạng thái kết thúc.
- Nhận lỗi thì vào trạng thái lỗi và giữ nguyên `answers` để thử lại được.

Phần giao diện kiểm thủ công theo checklist. Dựng React Testing Library cho một
demo một buổi là không tương xứng với công sức bỏ ra.

---

## 10. Rủi ro

| Rủi ro | Giảm thiểu |
|---|---|
| Backend không kịp xong trước buổi demo | Mock chạy độc lập hoàn toàn, demo đầy đủ 5 câu + kết quả mà không cần backend. |
| Backend trả shape khác hợp đồng | Types dùng chung trong `types.ts`; gửi mục 3 cho người làm backend **trước khi** hai bên viết code. |
| `npm run dev` hỏng trên máy lạ lúc demo | Chạy thử `npm run build && npm start` trước buổi demo; bản build không phụ thuộc dev server. |
