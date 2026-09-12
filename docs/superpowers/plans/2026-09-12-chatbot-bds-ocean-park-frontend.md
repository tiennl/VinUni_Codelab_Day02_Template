# Chatbot BĐS Ocean Park — Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng frontend Next.js cho trợ lý hội thoại bán BĐS Vinhomes Ocean Park — đi đúng 7 câu của quy trình sale thật bằng chip bấm sẵn, chấm điểm và gợi ý căn phù hợp kèm lý do, rồi chốt bằng lời mời xem nhà mẫu.

**Architecture:** Toàn bộ state là một `useReducer` thuần (`lib/chat-reducer.ts`) tách rời React DOM nên test được bằng Vitest không cần jsdom. Hai câu đầu tiên lọc cứng (ngân sách, phòng ngủ), bốn câu còn lại chấm điểm mềm để `match_score` có nghĩa thật. Mọi lời gọi API đi qua đúng một hàm (`lib/chat-client.ts`) có hai nhánh mock/backend cùng trả về `ChatResponse`.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, shadcn/ui, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-12-chatbot-bds-ocean-park-design.md`

## Global Constraints

- Chỉ làm frontend trong `frontend/`. Không đụng `autograder/`, `starter-code/`, `requirements.txt`, `.venv/`, `real_estate_backend.py`, `.gitignore` gốc.
- Next.js 16 App Router + React 19 (Task 1 đã cài: Next 16.3.5 / React 19.2.8), TypeScript, Tailwind v4, shadcn/ui, Vitest môi trường `node` chỉ chạy `lib/**/*.test.ts`.
- **Không** dùng thư viện state ngoài. **Không** dựng React Testing Library — test tự động chỉ phủ logic thuần trong `lib/`; giao diện kiểm thủ công theo checklist Task 8.
- Toàn bộ copy giao diện bằng tiếng Việt, giữ đúng giọng sale (gọi khách là "anh/chị", tự gọi "em"). Diacritics là bắt buộc: `tỷ`, `Căn hộ`, `±10%`.
- Ngoài phạm vi, không tự thêm: xác thực, thanh toán thật, nhập liệu tự do bằng ngôn ngữ tự nhiên, đa ngôn ngữ, dark mode, responsive tablet.
- Nút CTA cuối cùng **không gửi đi đâu** — chỉ hiện xác nhận tại chỗ. Sản phẩm chỉ gợi ý, chốt khách vẫn do người thật làm (spec §5).

### Bộ câu hỏi: theo quy trình sale thật, không theo spec §4

Spec §4 viết 5 câu do mình tự nghĩ. Người dùng đã cung cấp **quy trình sale thật** (7 bước) và
nó thay thế spec §4. Ánh xạ:

| Bước sale | Thành câu hỏi | Ghi chú |
|---|---|---|
| 1. Ở ngay hay đầu tư sinh lời? | `muc_dich` (**multi**) | multi vì khách hay chọn cả hai — bỏ được lựa chọn "cả hai" giả tạo |
| 2. Mấy phòng ngủ **hoặc** tầm tài chính? | tách thành `quy_mo` + `ngan_sach` | UI chip không cho trả lời gộp |
| 3. Khu sầm uất hay yên tĩnh nhiều cây xanh? | `khong_gian` | |
| 4. Bao giờ cần nhận bàn giao? | `ban_giao` | |
| 5. Vốn tự có (chiết khấu) hay vay 0%? | `thanh_toan` | |
| 6. Nhà thô hay nội thất sẵn? | `noi_that` | |
| 7. Cuối tuần qua xem sa bàn, nhà mẫu | **không phải câu hỏi** — thành CTA sau màn kết quả | component `visit-invitation.tsx` |

### Backend thật: đã có nhưng chưa dùng được làm nguồn kết quả

`real_estate_backend.py` (đã merge từ branch `khoa`) dùng contract khác spec §3 và **dữ liệu
chưa đủ để chạy demo**. Sự thật đã kiểm chứng bằng cách parse `SEED_PROPERTIES`:

- `POST /api/chat` nhận `{message, conversation_id}` (một câu tự do), luôn trả
  `{answer, listings: Property[], model, used_model}` — không có `type: question|results`.
- 12 dòng dữ liệu đều là **cấp dự án**: `bedrooms`, `area_m2`, `price_vnd`,
  `handover_status`, `loan_support`, `furnishing` **null toàn bộ**; `property_type` 9/12 là
  `"project"`; chỉ 3 dòng Ocean Park.
- `search_listings` lọc bằng SQL `bedrooms >= ?` và `price_vnd <= ?` ⇒ gửi filter phòng
  ngủ/giá vào sẽ **trả về 0 dòng**.

Quyết định (người dùng chọn): **demo chạy bằng mock**, còn Task 9 vẫn viết và test adapter để
khi backend có dữ liệu cấp căn thì đổi một biến môi trường là xong. Hệ quả ghi rõ trong Task 9:
frontend phải tự format giá, `match_score` từ backend là `null`, `reasons` dựng từ field backend
thật sự có.

### Deviation có chủ ý so với spec

- Không cài shadcn `progress` và `skeleton`: tiến trình vẽ bằng dots (đúng mockup §5), trạng
  thái chờ đã có `typing-indicator`. Cài vào là code chết.
- `Listing.area_m2`, `bedrooms`, `bathrooms`, `match_score` là **nullable** (spec §3.3 ghi
  bắt buộc). Lý do: backend thật trả null cho các field này; mock vẫn luôn gửi số.
- `mock-flow.ts` là nguồn sự thật của bộ câu hỏi ở **cả hai** chế độ (spec §4 nói backend là
  nguồn sự thật khi có). Lý do: backend này không bao giờ trả câu hỏi.

---

## File Structure

| File | Trách nhiệm |
|---|---|
| `frontend/lib/types.ts` | Types hợp đồng. Nguồn sự thật dùng chung, không logic. |
| `frontend/lib/answers.ts` | Hai helper đọc `Answers` (`firstAnswer`, `answerList`). |
| `frontend/lib/sales-flow.ts` | 7 câu hỏi của quy trình sale + `labelOf`. Chỉ data. |
| `frontend/lib/mock-listings.ts` | 10 căn giả + bảng tra ngân sách/phòng ngủ. Chỉ data. |
| `frontend/lib/mock-results.ts` | Lọc cứng → chấm điểm mềm → sinh `reasons` → `ResultsResponse`. |
| `frontend/lib/chat-reducer.ts` | State machine thuần. Không import React DOM. |
| `frontend/lib/chat-client.ts` | Seam duy nhất: chọn câu kế tiếp, hoặc mock, hoặc backend. |
| `frontend/lib/backend-adapter.ts` | Dịch 7 answers → câu tiếng Việt; `Property[]` → `Listing[]`. |
| `frontend/components/chat/chat-container.tsx` | `"use client"` — file duy nhất biết về state. |
| `frontend/components/chat/progress-header.tsx` | Tên trợ lý + dots tiến trình. |
| `frontend/components/chat/chat-bubble.tsx` | Bong bóng bot (`default` \| `error`). |
| `frontend/components/chat/answer-bubble.tsx` | Bong bóng khách + nút sửa. |
| `frontend/components/chat/typing-indicator.tsx` | Ba chấm nhấp nháy. |
| `frontend/components/chat/option-picker.tsx` | single → chip Button; multi → ToggleGroup + Xác nhận. |
| `frontend/components/listings/listing-card.tsx` | Một căn BĐS. |
| `frontend/components/listings/listing-results.tsx` | `summary` + lưới card + trạng thái rỗng. |
| `frontend/components/listings/visit-invitation.tsx` | CTA bước 7 của sale: mời xem nhà mẫu. |
| `frontend/app/page.tsx` | Shell tĩnh, render `<ChatContainer/>`. |
| `frontend/next.config.ts` | `rewrites` `/api/*` → FastAPI cổng 8000. |
| `frontend/vitest.config.ts` | Vitest node, `lib/**/*.test.ts`. |

Đổi tên `mock-flow.ts` → `sales-flow.ts` ở Task 2: bộ câu hỏi không còn là "mock", nó là kịch
bản sale dùng ở cả hai chế độ.

---

### Task 1: Scaffold `frontend/` + types hợp đồng — ✅ ĐÃ XONG (commit `85d5a3f`)

Đã cài Next 16.3.5 / React 19.2.8 / Tailwind v4 / shadcn (button, card, badge, toggle-group,
separator) / Vitest 3.2.7; đã viết `lib/types.ts`, `lib/vitest.config.ts`, và một bộ 5 câu hỏi
tạm trong `lib/mock-flow.ts` + test. **Task 2 thay bộ câu hỏi đó bằng quy trình sale thật.**

Không cần làm lại. Ai đọc plan này để thực thi thì bắt đầu từ Task 2.

---

### Task 2: Đồng bộ hợp đồng + bộ 7 câu hỏi theo quy trình sale

Sửa hợp đồng cho khớp thực tế backend, và thay bộ câu hỏi tạm bằng kịch bản sale thật.

**Files:**
- Modify: `frontend/lib/types.ts` (4 field thành nullable)
- Create: `frontend/lib/answers.ts`
- Create: `frontend/lib/sales-flow.ts`
- Delete: `frontend/lib/mock-flow.ts`, `frontend/lib/mock-flow.test.ts`
- Test: `frontend/lib/sales-flow.test.ts`, `frontend/lib/answers.test.ts`

**Interfaces:**
- Consumes: `Step`, `Listing` từ `@/lib/types` (đã có từ Task 1).
- Produces:
  - `firstAnswer(value: string | string[] | undefined): string`, `answerList(value: string | string[] | undefined): string[]` từ `@/lib/answers`
  - `SALES_FLOW: Step[]`, `SALES_TOTAL = 7`, `labelOf(stepId: string, value: string): string` từ `@/lib/sales-flow`

- [ ] **Step 1: Viết test thất bại cho hai helper**

Tạo `frontend/lib/answers.test.ts`:

```ts
import { expect, it } from 'vitest'
import { answerList, firstAnswer } from './answers'

it('firstAnswer lấy giá trị đơn hoặc phần tử đầu của mảng', () => {
  expect(firstAnswer('2pn')).toBe('2pn')
  expect(firstAnswer(['ocp2', 'ocp3'])).toBe('ocp2')
})

it('firstAnswer trả chuỗi rỗng khi chưa trả lời hoặc mảng rỗng', () => {
  expect(firstAnswer(undefined)).toBe('')
  expect(firstAnswer([])).toBe('')
})

it('answerList luôn trả mảng', () => {
  expect(answerList('o_ngay')).toEqual(['o_ngay'])
  expect(answerList(['o_ngay', 'dau_tu'])).toEqual(['o_ngay', 'dau_tu'])
  expect(answerList(undefined)).toEqual([])
})
```

- [ ] **Step 2: Chạy test để chắc chắn nó fail**

Run: `npm test -- answers`
Expected: FAIL — không resolve được `./answers`.

- [ ] **Step 3: Viết hai helper**

Tạo `frontend/lib/answers.ts`:

```ts
export function firstAnswer(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

export function answerList(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value
  return value === undefined ? [] : [value]
}
```

- [ ] **Step 4: Viết test thất bại cho bộ câu hỏi sale**

Tạo `frontend/lib/sales-flow.test.ts`:

```ts
import { expect, it } from 'vitest'
import { SALES_FLOW, SALES_TOTAL, labelOf } from './sales-flow'

it('có đúng 7 câu, đúng thứ tự của quy trình sale', () => {
  expect(SALES_FLOW.map((step) => step.id)).toEqual([
    'muc_dich',
    'quy_mo',
    'ngan_sach',
    'khong_gian',
    'ban_giao',
    'thanh_toan',
    'noi_that',
  ])
  expect(SALES_FLOW).toHaveLength(SALES_TOTAL)
})

it('chỉ câu mục đích cho chọn nhiều', () => {
  expect(SALES_FLOW.filter((step) => step.type === 'multi').map((step) => step.id)).toEqual([
    'muc_dich',
  ])
})

it('mỗi câu có ít nhất 2 lựa chọn và value không trùng nhau', () => {
  for (const step of SALES_FLOW) {
    expect(step.options.length).toBeGreaterThanOrEqual(2)
    const values = step.options.map((option) => option.value)
    expect(new Set(values).size).toBe(values.length)
  }
})

it('giữ giọng sale: gọi khách là anh/chị', () => {
  const withoutGreeting = SALES_FLOW.filter((step) => step.id !== 'quy_mo')
  for (const step of withoutGreeting) {
    expect(step.question.toLowerCase()).toContain('anh/chị')
  }
  expect(SALES_FLOW[1].question).toContain('Gia đình mình')
})

it('labelOf trả label, fallback về value khi không tìm thấy', () => {
  expect(labelOf('ngan_sach', '3_5ty')).toBe('3 - 5 tỷ')
  expect(labelOf('thanh_toan', 'vay_0')).toBe('Vay ngân hàng 0%')
  expect(labelOf('ngan_sach', 'khong_ton_tai')).toBe('khong_ton_tai')
})
```

- [ ] **Step 5: Chạy test để chắc chắn nó fail**

Run: `npm test -- sales-flow`
Expected: FAIL — không resolve được `./sales-flow`.

- [ ] **Step 6: Viết bộ câu hỏi sale**

Tạo `frontend/lib/sales-flow.ts`:

```ts
import type { Step } from './types'

export const SALES_TOTAL = 7

export const SALES_FLOW: Step[] = [
  {
    id: 'muc_dich',
    type: 'multi',
    question:
      'Chào anh/chị! Chào mừng đến với Vinhomes Ocean Park — Thành phố Biển hồ. Anh/chị đang quan tâm mua để về ở ngay hay mua để đầu tư sinh lời ạ?',
    hint: 'Chọn được nhiều mục đích',
    options: [
      { value: 'o_ngay', label: 'Về ở ngay' },
      { value: 'dau_tu', label: 'Đầu tư sinh lời' },
      { value: 'nguoi_than', label: 'Mua cho người thân' },
    ],
  },
  {
    id: 'quy_mo',
    type: 'single',
    question: 'Gia đình mình cần tìm căn mấy phòng ngủ ạ?',
    hint: null,
    options: [
      { value: '1pn', label: '1 phòng ngủ' },
      { value: '2pn', label: '2 phòng ngủ' },
      { value: '3pn', label: '3 phòng ngủ' },
      { value: '4pn_tro_len', label: '4 phòng ngủ trở lên' },
    ],
  },
  {
    id: 'ngan_sach',
    type: 'single',
    question: 'Tầm tài chính anh/chị dự kiến khoảng bao nhiêu ạ?',
    hint: 'Chọn khoảng gần nhất, mình sẽ linh động ±10%',
    options: [
      { value: 'duoi_3ty', label: 'Dưới 3 tỷ' },
      { value: '3_5ty', label: '3 - 5 tỷ' },
      { value: '5_8ty', label: '5 - 8 tỷ' },
      { value: '8_15ty', label: '8 - 15 tỷ' },
      { value: 'tren_15ty', label: 'Trên 15 tỷ' },
    ],
  },
  {
    id: 'khong_gian',
    type: 'single',
    question: 'Anh/chị thích khu sầm uất trung tâm hay khu yên tĩnh, nhiều cây xanh hơn ạ?',
    hint: null,
    options: [
      { value: 'sam_uat', label: 'Sầm uất, gần trung tâm' },
      { value: 'yen_tinh', label: 'Yên tĩnh, nhiều cây xanh' },
      { value: 'can_bang', label: 'Cân bằng cả hai' },
    ],
  },
  {
    id: 'ban_giao',
    type: 'single',
    question: 'Anh/chị dự định bao giờ thì cần nhận bàn giao nhà ạ?',
    hint: null,
    options: [
      { value: 'ngay', label: 'Nhận ngay' },
      { value: 'trong_nam', label: 'Trong năm nay' },
      { value: 'sang_nam', label: 'Sang năm' },
      { value: 'linh_hoat', label: 'Linh hoạt, chờ được' },
    ],
  },
  {
    id: 'thanh_toan',
    type: 'single',
    question:
      'Với căn này, anh/chị muốn thanh toán bằng vốn tự có để nhận chiết khấu sâu, hay dùng gói vay ngân hàng miễn lãi 0% ạ?',
    hint: null,
    options: [
      { value: 'von_tu_co', label: 'Vốn tự có, lấy chiết khấu' },
      { value: 'vay_0', label: 'Vay ngân hàng 0%' },
      { value: 'chua_quyet', label: 'Chưa quyết, cần tư vấn' },
    ],
  },
  {
    id: 'noi_that',
    type: 'single',
    question:
      'Nhà mình muốn nhận nhà thô để tự thiết kế theo gu riêng, hay căn đã làm sẵn nội thất để xách vali vào ở luôn ạ?',
    hint: null,
    options: [
      { value: 'tho', label: 'Nhà thô, tự thiết kế' },
      { value: 'co_san', label: 'Nội thất sẵn' },
      { value: 'deu_duoc', label: 'Đều được' },
    ],
  },
]

export function labelOf(stepId: string, value: string): string {
  const step = SALES_FLOW.find((item) => item.id === stepId)
  return step?.options.find((option) => option.value === value)?.label ?? value
}
```

- [ ] **Step 7: Xoá bộ câu hỏi tạm của Task 1**

```bash
cd frontend && rm lib/mock-flow.ts lib/mock-flow.test.ts
```

- [ ] **Step 8: Nới 4 field của hợp đồng thành nullable**

Trong `frontend/lib/types.ts`, sửa đúng 4 dòng trong `interface Listing`:

```ts
  area_m2: number | null
  bedrooms: number | null
  bathrooms: number | null
  match_score: number | null
```

Giữ nguyên mọi field khác. Lý do nằm ở mục "Deviation có chủ ý" của plan: backend thật trả
null cho bốn field này.

- [ ] **Step 9: Chạy test và typecheck**

Run: `npm test && npx tsc --noEmit`
Expected: PASS — 8 test (3 của `answers`, 5 của `sales-flow`); không lỗi type.

- [ ] **Step 10: Commit**

```bash
cd /Users/thuytien/Code/vinai/VinUni_Codelab_Day02_Template
git add -A frontend/lib
git commit -m "feat(frontend): replace placeholder questions with real 7-step sales flow"
```

---

### Task 3: State machine hội thoại (`chat-reducer.ts`)

Phần logic thật sự duy nhất của khung chat, và là phần được test kỹ nhất (spec §9).

**Files:**
- Create: `frontend/lib/chat-reducer.ts`
- Test: `frontend/lib/chat-reducer.test.ts`

**Interfaces:**
- Consumes: `Answers`, `ChatResponse`, `Listing`, `Progress`, `Step` từ `@/lib/types`; `SALES_FLOW` từ `@/lib/sales-flow` (chỉ trong test).
- Produces:
  - `type Phase = 'loading' | 'asking' | 'results' | 'error'`
  - `interface AnsweredStep { step: Step; value: string | string[] }`
  - `interface ChatState { phase, history, current, progress, answers, summary, listings }`
  - `const initialState: ChatState`
  - `type ChatAction` gồm `REQUEST_SENT`, `RESPONSE_RECEIVED`, `REQUEST_FAILED`, `ANSWER_SUBMITTED`, `EDIT_REQUESTED`
  - `chatReducer(state: ChatState, action: ChatAction): ChatState`

- [ ] **Step 1: Viết test thất bại cho reducer**

Tạo `frontend/lib/chat-reducer.test.ts`:

```ts
import { expect, it } from 'vitest'
import { chatReducer, initialState, type ChatState } from './chat-reducer'
import { SALES_FLOW } from './sales-flow'
import type { ResultsResponse } from './types'

const [mucDich, quyMo, nganSach] = SALES_FLOW

function asking(step: (typeof SALES_FLOW)[number]): ChatState {
  return { ...initialState, phase: 'asking', current: step, progress: { current: 1, total: 7 } }
}

function answeredAll(): ChatState {
  const values: Array<string | string[]> = [
    ['o_ngay', 'dau_tu'],
    '2pn',
    '3_5ty',
    'sam_uat',
    'ngay',
    'vay_0',
    'co_san',
  ]
  let state: ChatState = initialState
  SALES_FLOW.forEach((step, index) => {
    state = chatReducer(state, {
      type: 'RESPONSE_RECEIVED',
      response: { type: 'question', progress: { current: index + 1, total: 7 }, step },
    })
    state = chatReducer(state, { type: 'ANSWER_SUBMITTED', value: values[index] })
  })
  return state
}

it('lưu câu trả lời single rồi tiến sang câu tiếp', () => {
  const answered = chatReducer(asking(quyMo), { type: 'ANSWER_SUBMITTED', value: '2pn' })
  expect(answered.phase).toBe('loading')
  expect(answered.answers).toEqual({ quy_mo: '2pn' })
  expect(answered.history).toHaveLength(1)
  expect(answered.current).toBeNull()

  const next = chatReducer(answered, {
    type: 'RESPONSE_RECEIVED',
    response: { type: 'question', progress: { current: 3, total: 7 }, step: nganSach },
  })
  expect(next.phase).toBe('asking')
  expect(next.current).toEqual(nganSach)
  expect(next.progress).toEqual({ current: 3, total: 7 })
})

it('lưu được mảng nhiều giá trị cho câu multi', () => {
  const state = chatReducer(asking(mucDich), {
    type: 'ANSWER_SUBMITTED',
    value: ['o_ngay', 'dau_tu'],
  })
  expect(state.answers).toEqual({ muc_dich: ['o_ngay', 'dau_tu'] })
  expect(state.history[0].value).toEqual(['o_ngay', 'dau_tu'])
})

it('sửa câu thứ 2 thì xoá mọi câu trả lời sau nó', () => {
  const state = chatReducer(answeredAll(), { type: 'EDIT_REQUESTED', stepId: 'quy_mo' })
  expect(state.phase).toBe('asking')
  expect(state.current).toEqual(quyMo)
  expect(state.answers).toEqual({ muc_dich: ['o_ngay', 'dau_tu'] })
  expect(state.history.map((entry) => entry.step.id)).toEqual(['muc_dich'])
  expect(state.progress).toEqual({ current: 2, total: 7 })
})

it('sửa câu cũ thì xoá luôn kết quả đang hiện', () => {
  const withResults = chatReducer(answeredAll(), {
    type: 'RESPONSE_RECEIVED',
    response: { type: 'results', summary: 'S', listings: [] },
  })
  const state = chatReducer(withResults, { type: 'EDIT_REQUESTED', stepId: 'ngan_sach' })
  expect(state.phase).toBe('asking')
  expect(state.listings).toBeNull()
  expect(state.summary).toBeNull()
  expect(Object.keys(state.answers)).toEqual(['muc_dich', 'quy_mo'])
})

it('nhận response results thì chuyển sang trạng thái kết thúc', () => {
  const results: ResultsResponse = { type: 'results', summary: 'Gợi ý 3 căn', listings: [] }
  const state = chatReducer(answeredAll(), { type: 'RESPONSE_RECEIVED', response: results })
  expect(state.phase).toBe('results')
  expect(state.summary).toBe('Gợi ý 3 căn')
  expect(state.listings).toEqual([])
  expect(state.current).toBeNull()
})

it('nhận lỗi thì vào trạng thái error và giữ nguyên answers để thử lại', () => {
  const before = answeredAll()
  const failed = chatReducer(before, { type: 'REQUEST_FAILED' })
  expect(failed.phase).toBe('error')
  expect(failed.answers).toEqual(before.answers)
  expect(failed.history).toHaveLength(7)

  const retried = chatReducer(failed, { type: 'REQUEST_SENT' })
  expect(retried.phase).toBe('loading')
  expect(retried.answers).toEqual(before.answers)
})

it('bỏ qua hành động không hợp lệ', () => {
  expect(chatReducer(initialState, { type: 'ANSWER_SUBMITTED', value: 'x' })).toBe(initialState)
  const state = answeredAll()
  expect(chatReducer(state, { type: 'EDIT_REQUESTED', stepId: 'khong_ton_tai' })).toBe(state)
})
```

- [ ] **Step 2: Chạy test để chắc chắn nó fail**

Run: `npm test -- chat-reducer`
Expected: FAIL — không resolve được `./chat-reducer`.

- [ ] **Step 3: Viết reducer**

Tạo `frontend/lib/chat-reducer.ts`:

```ts
import type { Answers, ChatResponse, Listing, Progress, Step } from './types'

export type Phase = 'loading' | 'asking' | 'results' | 'error'

export interface AnsweredStep {
  step: Step
  value: string | string[]
}

export interface ChatState {
  phase: Phase
  history: AnsweredStep[]
  current: Step | null
  progress: Progress | null
  answers: Answers
  summary: string | null
  listings: Listing[] | null
}

export const initialState: ChatState = {
  phase: 'loading',
  history: [],
  current: null,
  progress: null,
  answers: {},
  summary: null,
  listings: null,
}

export type ChatAction =
  | { type: 'REQUEST_SENT' }
  | { type: 'RESPONSE_RECEIVED'; response: ChatResponse }
  | { type: 'REQUEST_FAILED' }
  | { type: 'ANSWER_SUBMITTED'; value: string | string[] }
  | { type: 'EDIT_REQUESTED'; stepId: string }

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'REQUEST_SENT':
      return { ...state, phase: 'loading' }

    case 'ANSWER_SUBMITTED': {
      if (!state.current) return state
      return {
        ...state,
        phase: 'loading',
        history: [...state.history, { step: state.current, value: action.value }],
        answers: { ...state.answers, [state.current.id]: action.value },
        current: null,
      }
    }

    case 'RESPONSE_RECEIVED': {
      const response = action.response
      if (response.type === 'question') {
        return {
          ...state,
          phase: 'asking',
          current: response.step,
          progress: response.progress,
        }
      }
      return {
        ...state,
        phase: 'results',
        current: null,
        summary: response.summary,
        listings: response.listings,
      }
    }

    case 'REQUEST_FAILED':
      return { ...state, phase: 'error' }

    case 'EDIT_REQUESTED': {
      const index = state.history.findIndex((entry) => entry.step.id === action.stepId)
      if (index === -1) return state
      const kept = state.history.slice(0, index)
      const answers: Answers = {}
      for (const entry of kept) answers[entry.step.id] = entry.value
      return {
        ...state,
        phase: 'asking',
        history: kept,
        current: state.history[index].step,
        answers,
        progress: { current: index + 1, total: state.progress?.total ?? state.history.length },
        summary: null,
        listings: null,
      }
    }
  }
}
```

State **không** giữ thông điệp lỗi: `phase: 'error'` đủ để UI chọn nhánh, chi tiết kỹ thuật chỉ
vào `console.error` ở container (spec §3.4 — không đẩy `detail` ra cho người dùng).

- [ ] **Step 4: Chạy test để chắc chắn nó pass**

Run: `npm test`
Expected: PASS — 15 test (8 cũ + 7 của reducer).

- [ ] **Step 5: Commit**

```bash
cd /Users/thuytien/Code/vinai/VinUni_Codelab_Day02_Template
git add frontend/lib/chat-reducer.ts frontend/lib/chat-reducer.test.ts
git commit -m "feat(frontend): add chat state machine with edit-truncates-later-answers behaviour"
```

---

### Task 4: Kho căn giả + chấm điểm + seam gọi API

Ba file đi cùng nhau: dữ liệu, thuật toán chọn căn, và điểm nối mock/backend.

**Files:**
- Create: `frontend/lib/mock-listings.ts`
- Create: `frontend/lib/mock-results.ts`
- Create: `frontend/lib/chat-client.ts`
- Test: `frontend/lib/mock-results.test.ts`, `frontend/lib/chat-client.test.ts`

**Interfaces:**
- Consumes: `Answers`, `ChatResponse`, `Listing`, `ResultsResponse`, `Step` từ `@/lib/types`; `SALES_FLOW`, `SALES_TOTAL`, `labelOf` từ `@/lib/sales-flow`; `firstAnswer`, `answerList` từ `@/lib/answers`.
- Produces:
  - `MockListing`, `MOCK_LISTINGS: MockListing[]`, `BUDGET_RANGES: Record<string, [number, number]>`, `BEDROOM_TARGETS: Record<string, number>` từ `@/lib/mock-listings`
  - `buildMockResults(answers: Answers): ResultsResponse` từ `@/lib/mock-results`
  - `sendAnswers(sessionId: string, answers: Answers): Promise<ChatResponse>`, `nextQuestion(answers: Answers): ChatResponse | null` từ `@/lib/chat-client`

- [ ] **Step 1: Viết kho căn giả**

Tạo `frontend/lib/mock-listings.ts`:

```ts
import type { Listing } from './types'

/** Metadata chỉ dùng cho logic mock, không thuộc hợp đồng API. */
export interface MockListing extends Listing {
  price_ty: number
  vibe: 'sam_uat' | 'yen_tinh'
  handover: 'ngay' | 'trong_nam' | 'sang_nam'
  payment: Array<'von_tu_co' | 'vay_0'>
  furnishing: 'tho' | 'co_san'
  purpose: Array<'o_ngay' | 'dau_tu' | 'nguoi_than'>
}

export const BUDGET_RANGES: Record<string, [number, number]> = {
  duoi_3ty: [0, 3],
  '3_5ty': [3, 5],
  '5_8ty': [5, 8],
  '8_15ty': [8, 15],
  tren_15ty: [15, Number.POSITIVE_INFINITY],
}

export const BEDROOM_TARGETS: Record<string, number> = {
  '1pn': 1,
  '2pn': 2,
  '3pn': 3,
  '4pn_tro_len': 4,
}

export const MOCK_LISTINGS: MockListing[] = [
  {
    id: 'ocp1-sapphire1-0812',
    name: 'Sapphire 1 — Căn 0812',
    subdivision: 'Ocean Park 1',
    price_label: '2,4 tỷ',
    price_ty: 2.4,
    area_m2: 38,
    bedrooms: 1,
    bathrooms: 1,
    image_url: null,
    match_score: null,
    reasons: ['Sát biển hồ nước mặn, đi bộ 5 phút'],
    detail_url: null,
    vibe: 'sam_uat',
    handover: 'ngay',
    payment: ['von_tu_co', 'vay_0'],
    furnishing: 'co_san',
    purpose: ['o_ngay', 'dau_tu'],
  },
  {
    id: 'ocp1-ruby2-1105',
    name: 'Ruby 2 — Căn 1105',
    subdivision: 'Ocean Park 1',
    price_label: '3,1 tỷ',
    price_ty: 3.1,
    area_m2: 54,
    bedrooms: 2,
    bathrooms: 1,
    image_url: null,
    match_score: null,
    reasons: ['Cách Vinschool Ocean Park 400m'],
    detail_url: 'https://example.com/ocp1-ruby2-1105',
    vibe: 'sam_uat',
    handover: 'ngay',
    payment: ['vay_0'],
    furnishing: 'co_san',
    purpose: ['o_ngay', 'nguoi_than'],
  },
  {
    id: 'ocp2-sapphire2-1203',
    name: 'Sapphire 2 — Căn 1203',
    subdivision: 'Ocean Park 2',
    price_label: '4,2 tỷ',
    price_ty: 4.2,
    area_m2: 68,
    bedrooms: 2,
    bathrooms: 2,
    image_url: null,
    match_score: null,
    reasons: ['View hồ Ngọc Trai, hướng Đông Nam'],
    detail_url: 'https://example.com/ocp2-sapphire2-1203',
    vibe: 'sam_uat',
    handover: 'trong_nam',
    payment: ['von_tu_co', 'vay_0'],
    furnishing: 'tho',
    purpose: ['o_ngay', 'dau_tu'],
  },
  {
    id: 'ocp3-crown-c1-0906',
    name: 'The Crown C1 — Căn 0906',
    subdivision: 'Ocean Park 3',
    price_label: '4,8 tỷ',
    price_ty: 4.8,
    area_m2: 72,
    bedrooms: 2,
    bathrooms: 2,
    image_url: null,
    match_score: null,
    reasons: ['Cạnh công viên nội khu và bến xe buýt'],
    detail_url: null,
    vibe: 'yen_tinh',
    handover: 'sang_nam',
    payment: ['vay_0'],
    furnishing: 'tho',
    purpose: ['dau_tu'],
  },
  {
    id: 'ocp1-diamond2-0704',
    name: 'Diamond 2 — Căn 0704',
    subdivision: 'Ocean Park 1',
    price_label: '5,4 tỷ',
    price_ty: 5.4,
    area_m2: 88,
    bedrooms: 3,
    bathrooms: 2,
    image_url: null,
    match_score: null,
    reasons: ['Ba phòng ngủ đều có cửa sổ'],
    detail_url: 'https://example.com/ocp1-diamond2-0704',
    vibe: 'sam_uat',
    handover: 'ngay',
    payment: ['von_tu_co'],
    furnishing: 'co_san',
    purpose: ['o_ngay', 'nguoi_than'],
  },
  {
    id: 'ocp2-diamond1-1502',
    name: 'Diamond 1 — Căn 1502',
    subdivision: 'Ocean Park 2',
    price_label: '6,5 tỷ',
    price_ty: 6.5,
    area_m2: 96,
    bedrooms: 3,
    bathrooms: 2,
    image_url: null,
    match_score: null,
    reasons: ['Tầng cao, view quảng trường trung tâm'],
    detail_url: 'https://example.com/ocp2-diamond1-1502',
    vibe: 'sam_uat',
    handover: 'trong_nam',
    payment: ['von_tu_co', 'vay_0'],
    furnishing: 'tho',
    purpose: ['o_ngay', 'dau_tu'],
  },
  {
    id: 'ocp3-crown-villa-b14',
    name: 'Biệt thự The Crown — Lô B14',
    subdivision: 'Ocean Park 3',
    price_label: '9,8 tỷ',
    price_ty: 9.8,
    area_m2: 112,
    bedrooms: 3,
    bathrooms: 3,
    image_url: null,
    match_score: null,
    reasons: ['Sân vườn riêng, giáp dải cây xanh'],
    detail_url: null,
    vibe: 'yen_tinh',
    handover: 'sang_nam',
    payment: ['von_tu_co'],
    furnishing: 'tho',
    purpose: ['o_ngay'],
  },
  {
    id: 'ocp3-shophouse-s12',
    name: 'Shophouse The Crown — Lô S12',
    subdivision: 'Ocean Park 3',
    price_label: '13,5 tỷ',
    price_ty: 13.5,
    area_m2: 120,
    bedrooms: 4,
    bathrooms: 4,
    image_url: null,
    match_score: null,
    reasons: ['Mặt đường nội khu 20m, tầng 1 kinh doanh được'],
    detail_url: 'https://example.com/ocp3-shophouse-s12',
    vibe: 'yen_tinh',
    handover: 'trong_nam',
    payment: ['vay_0'],
    furnishing: 'tho',
    purpose: ['dau_tu'],
  },
  {
    id: 'ocp2-lienke-ngoctrai-22',
    name: 'Liền kề Ngọc Trai — Căn 22',
    subdivision: 'Ocean Park 2',
    price_label: '17 tỷ',
    price_ty: 17,
    area_m2: 150,
    bedrooms: 4,
    bathrooms: 4,
    image_url: null,
    match_score: null,
    reasons: ['Sân trước để được hai xe, gần cổng chính'],
    detail_url: null,
    vibe: 'sam_uat',
    handover: 'ngay',
    payment: ['von_tu_co'],
    furnishing: 'co_san',
    purpose: ['o_ngay', 'nguoi_than'],
  },
  {
    id: 'ocp1-bietthu-sanho-07',
    name: 'Biệt thự San Hô — Căn 07',
    subdivision: 'Ocean Park 1',
    price_label: '24 tỷ',
    price_ty: 24,
    area_m2: 225,
    bedrooms: 5,
    bathrooms: 5,
    image_url: null,
    match_score: null,
    reasons: ['Lô góc hai mặt thoáng, có bể bơi riêng'],
    detail_url: 'https://example.com/ocp1-bietthu-sanho-07',
    vibe: 'yen_tinh',
    handover: 'ngay',
    payment: ['von_tu_co'],
    furnishing: 'co_san',
    purpose: ['o_ngay', 'nguoi_than'],
  },
]
```

`image_url` null toàn bộ vì demo chạy offline — card sẽ vẽ gradient placeholder (spec §8).
`match_score` null trong dữ liệu thô: điểm do `mock-results.ts` chấm theo câu trả lời, không
phải con số cố định dán sẵn.

- [ ] **Step 2: Viết test thất bại cho thuật toán chọn căn**

Tạo `frontend/lib/mock-results.test.ts`:

```ts
import { expect, it } from 'vitest'
import { buildMockResults } from './mock-results'
import type { Answers } from './types'

const BASE: Answers = {
  muc_dich: ['o_ngay'],
  quy_mo: '2pn',
  ngan_sach: '3_5ty',
  khong_gian: 'sam_uat',
  ban_giao: 'ngay',
  thanh_toan: 'vay_0',
  noi_that: 'co_san',
}

it('lọc cứng theo ngân sách và số phòng ngủ', () => {
  const results = buildMockResults(BASE)
  expect(results.listings.length).toBeGreaterThan(0)
  for (const listing of results.listings) {
    expect(listing.bedrooms).toBe(2)
  }
  expect(results.listings.map((listing) => listing.id)).toContain('ocp1-ruby2-1105')
})

it('4 phòng ngủ trở lên nhận cả căn nhiều phòng hơn', () => {
  const results = buildMockResults({ ...BASE, quy_mo: '4pn_tro_len', ngan_sach: 'tren_15ty' })
  expect(results.listings.length).toBeGreaterThan(0)
  for (const listing of results.listings) {
    expect(listing.bedrooms).not.toBeNull()
    expect(listing.bedrooms as number).toBeGreaterThanOrEqual(4)
  }
})

it('căn khớp nhiều câu mềm hơn thì điểm cao hơn và xếp trên', () => {
  const results = buildMockResults(BASE)
  const scores = results.listings.map((listing) => listing.match_score as number)
  expect(scores).toEqual([...scores].sort((a, b) => b - a))
  expect(scores[0]).toBeGreaterThan(scores[scores.length - 1])
})

it('đổi câu mềm thì thứ tự gợi ý đổi theo', () => {
  const wantQuiet = buildMockResults({ ...BASE, khong_gian: 'yen_tinh', ban_giao: 'sang_nam' })
  expect(wantQuiet.listings[0].id).toBe('ocp3-crown-c1-0906')
  expect(buildMockResults(BASE).listings[0].id).not.toBe('ocp3-crown-c1-0906')
})

it('mỗi căn có tối đa 3 lý do và lý do nói đúng câu trả lời của khách', () => {
  const results = buildMockResults(BASE)
  for (const listing of results.listings) {
    expect(listing.reasons.length).toBeLessThanOrEqual(3)
    expect(listing.reasons[0]).toContain('3 - 5 tỷ')
  }
  const withLoan = results.listings.find((listing) => listing.id === 'ocp1-ruby2-1105')
  expect(withLoan?.reasons.join(' ')).toContain('0%')
})

it('không khớp lọc cứng thì trả listings rỗng và summary nói rõ', () => {
  const results = buildMockResults({ ...BASE, quy_mo: '1pn', ngan_sach: 'tren_15ty' })
  expect(results.listings).toEqual([])
  expect(results.summary).toContain('Chưa có căn nào')
})

it('summary nhắc lại mục đích và ngân sách khách chọn', () => {
  const results = buildMockResults({ ...BASE, muc_dich: ['dau_tu'] })
  expect(results.summary).toContain('Đầu tư sinh lời'.toLowerCase())
  expect(results.summary).toContain('3 - 5 tỷ')
})
```

- [ ] **Step 3: Chạy test để chắc chắn nó fail**

Run: `npm test -- mock-results`
Expected: FAIL — không resolve được `./mock-results`.

- [ ] **Step 4: Viết thuật toán chọn căn**

Tạo `frontend/lib/mock-results.ts`:

```ts
import { answerList, firstAnswer } from './answers'
import { BEDROOM_TARGETS, BUDGET_RANGES, MOCK_LISTINGS, type MockListing } from './mock-listings'
import { labelOf } from './sales-flow'
import type { Answers, Listing, ResultsResponse } from './types'

const BUDGET_TOLERANCE = 0.1
const BASE_SCORE = 60
const MAX_SUGGESTIONS = 4

export function buildMockResults(answers: Answers): ResultsResponse {
  const budget = firstAnswer(answers.ngan_sach)
  const scale = firstAnswer(answers.quy_mo)
  const purposes = answerList(answers.muc_dich)

  const matched = MOCK_LISTINGS.filter(
    (listing) => inBudget(listing, budget) && fitsScale(listing, scale),
  )
    .map((listing) => ({ listing, score: score(listing, answers) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SUGGESTIONS)

  const listings = matched.map(({ listing, score: value }) =>
    toListing(listing, value, reasons(listing, answers, budget)),
  )

  if (listings.length === 0) {
    return {
      type: 'results',
      summary:
        'Chưa có căn nào khớp hoàn toàn với tầm tài chính và quy mô anh/chị cần. Anh/chị nới nhẹ một trong hai tiêu chí, em tìm lại ngay ạ.',
      listings: [],
    }
  }

  const purposeText = purposes.map((value) => labelOf('muc_dich', value).toLowerCase()).join(' và ')
  return {
    type: 'results',
    summary: `Với nhu cầu ${purposeText}, tầm tài chính ${labelOf('ngan_sach', budget)} và ${labelOf('quy_mo', scale).toLowerCase()}, em gợi ý anh/chị ${listings.length} căn sau ạ:`,
    listings,
  }
}

function inBudget(listing: MockListing, budget: string): boolean {
  const [min, max] = BUDGET_RANGES[budget] ?? [0, Number.POSITIVE_INFINITY]
  const low = min * (1 - BUDGET_TOLERANCE)
  const high = Number.isFinite(max) ? max * (1 + BUDGET_TOLERANCE) : max
  return listing.price_ty >= low && listing.price_ty <= high
}

function fitsScale(listing: MockListing, scale: string): boolean {
  const target = BEDROOM_TARGETS[scale]
  if (target === undefined || listing.bedrooms === null) return true
  return scale === '4pn_tro_len' ? listing.bedrooms >= 4 : listing.bedrooms === target
}

function score(listing: MockListing, answers: Answers): number {
  let total = BASE_SCORE
  if (matchesVibe(listing, firstAnswer(answers.khong_gian))) total += 10
  if (matchesHandover(listing, firstAnswer(answers.ban_giao))) total += 10
  if (matchesPayment(listing, firstAnswer(answers.thanh_toan))) total += 8
  if (matchesFurnishing(listing, firstAnswer(answers.noi_that))) total += 7
  if (answerList(answers.muc_dich).some((value) => listing.purpose.includes(value as never))) {
    total += 5
  }
  return total
}

function matchesVibe(listing: MockListing, value: string): boolean {
  return value === 'can_bang' || value === listing.vibe
}

function matchesHandover(listing: MockListing, value: string): boolean {
  return value === 'linh_hoat' || value === listing.handover
}

function matchesPayment(listing: MockListing, value: string): boolean {
  return value === 'chua_quyet' || listing.payment.includes(value as never)
}

function matchesFurnishing(listing: MockListing, value: string): boolean {
  return value === 'deu_duoc' || value === listing.furnishing
}

function reasons(listing: MockListing, answers: Answers, budget: string): string[] {
  const lines = [`Nằm trong tầm tài chính ${labelOf('ngan_sach', budget)}`]

  if (matchesVibe(listing, firstAnswer(answers.khong_gian))) {
    lines.push(
      listing.vibe === 'sam_uat'
        ? 'Ngay khu sầm uất, sát trung tâm thương mại'
        : 'Khu yên tĩnh, nhiều cây xanh',
    )
  }
  if (matchesHandover(listing, firstAnswer(answers.ban_giao))) {
    lines.push(HANDOVER_REASON[listing.handover])
  }
  if (matchesPayment(listing, firstAnswer(answers.thanh_toan))) {
    lines.push(
      listing.payment.includes('vay_0')
        ? 'Có gói vay ngân hàng miễn lãi 0%'
        : 'Thanh toán vốn tự có được chiết khấu sâu',
    )
  }
  if (matchesFurnishing(listing, firstAnswer(answers.noi_that))) {
    lines.push(
      listing.furnishing === 'co_san'
        ? 'Nội thất đã hoàn thiện, xách vali vào ở'
        : 'Nhà thô, anh/chị tự do thiết kế theo gu riêng',
    )
  }
  lines.push(...listing.reasons)

  return lines.slice(0, 3)
}

const HANDOVER_REASON: Record<MockListing['handover'], string> = {
  ngay: 'Nhận bàn giao ngay, không phải chờ',
  trong_nam: 'Bàn giao trong năm nay',
  sang_nam: 'Bàn giao sang năm, còn thời gian chuẩn bị',
}

function toListing(listing: MockListing, matchScore: number, listingReasons: string[]): Listing {
  return {
    id: listing.id,
    name: listing.name,
    subdivision: listing.subdivision,
    price_label: listing.price_label,
    area_m2: listing.area_m2,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    image_url: listing.image_url,
    match_score: matchScore,
    reasons: listingReasons,
    detail_url: listing.detail_url,
  }
}
```

`toListing` viết tay từng field để metadata mock (`price_ty`, `vibe`, `handover`, `payment`,
`furnishing`, `purpose`) không lọt ra ngoài hợp đồng API.

- [ ] **Step 5: Chạy test để chắc chắn nó pass**

Run: `npm test -- mock-results`
Expected: PASS — 7 test.

- [ ] **Step 6: Viết test thất bại cho seam gọi API**

Tạo `frontend/lib/chat-client.test.ts`:

```ts
import { afterEach, expect, it, vi } from 'vitest'
import { nextQuestion, sendAnswers } from './chat-client'
import type { Answers, QuestionResponse, ResultsResponse } from './types'

const FULL: Answers = {
  muc_dich: ['o_ngay'],
  quy_mo: '2pn',
  ngan_sach: '3_5ty',
  khong_gian: 'sam_uat',
  ban_giao: 'ngay',
  thanh_toan: 'vay_0',
  noi_that: 'co_san',
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

it('answers rỗng thì hỏi câu đầu tiên của quy trình sale', () => {
  const response = nextQuestion({}) as QuestionResponse
  expect(response?.type).toBe('question')
  expect(response.step.id).toBe('muc_dich')
  expect(response.progress).toEqual({ current: 1, total: 7 })
})

it('hỏi đúng câu còn thiếu chứ không phải câu đầu', () => {
  const partial: Answers = { ...FULL }
  delete partial.noi_that
  const response = nextQuestion(partial) as QuestionResponse
  expect(response.step.id).toBe('noi_that')
  expect(response.progress.current).toBe(7)
})

it('trả lời đủ 7 câu thì không còn câu hỏi nào', () => {
  expect(nextQuestion(FULL)).toBeNull()
})

it('mặc định là mock: đủ 7 câu thì trả results, không gọi fetch', async () => {
  const fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  const response = (await sendAnswers('sess-1', FULL)) as ResultsResponse
  expect(response.type).toBe('results')
  expect(response.listings.length).toBeGreaterThan(0)
  expect(fetchMock).not.toHaveBeenCalled()
})

it('chưa đủ câu thì trả câu hỏi, kể cả khi tắt mock', async () => {
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK', 'false')
  const fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  const response = (await sendAnswers('sess-1', {})) as QuestionResponse
  expect(response.type).toBe('question')
  expect(fetchMock).not.toHaveBeenCalled()
})
```

- [ ] **Step 7: Chạy test để chắc chắn nó fail**

Run: `npm test -- chat-client`
Expected: FAIL — không resolve được `./chat-client`.

- [ ] **Step 8: Viết seam gọi API**

Tạo `frontend/lib/chat-client.ts`:

```ts
import { buildMockResults } from './mock-results'
import { SALES_FLOW, SALES_TOTAL } from './sales-flow'
import type { Answers, ChatResponse } from './types'

export function nextQuestion(answers: Answers): ChatResponse | null {
  const index = SALES_FLOW.findIndex((step) => answers[step.id] === undefined)
  if (index === -1) return null
  return {
    type: 'question',
    progress: { current: index + 1, total: SALES_TOTAL },
    step: SALES_FLOW[index],
  }
}

export async function sendAnswers(sessionId: string, answers: Answers): Promise<ChatResponse> {
  const pending = nextQuestion(answers)
  if (pending) return pending
  return buildMockResults(answers)
}
```

Backend này không bao giờ trả câu hỏi, nên `nextQuestion` chạy trước ở **cả hai** chế độ.
Task 9 thay dòng cuối bằng nhánh chọn mock/backend — đó là chỗ duy nhất phải sửa.

- [ ] **Step 9: Chạy toàn bộ test**

Run: `npm test && npx tsc --noEmit`
Expected: PASS — 27 test; không lỗi type.

- [ ] **Step 10: Commit**

```bash
cd /Users/thuytien/Code/vinai/VinUni_Codelab_Day02_Template
git add frontend/lib/mock-listings.ts frontend/lib/mock-results.ts frontend/lib/mock-results.test.ts frontend/lib/chat-client.ts frontend/lib/chat-client.test.ts
git commit -m "feat(frontend): add mock inventory, soft-scoring recommender and API seam"
```

---

### Task 5: Component trình bày của khung chat

Bốn component không giữ state. Theo Global Constraints không dựng React Testing Library, nên
kiểm chứng ở task này là typecheck + build; phần nhìn kiểm ở Task 8.

**Files:**
- Create: `frontend/components/chat/progress-header.tsx`
- Create: `frontend/components/chat/chat-bubble.tsx`
- Create: `frontend/components/chat/answer-bubble.tsx`
- Create: `frontend/components/chat/typing-indicator.tsx`

**Interfaces:**
- Consumes: `Progress` từ `@/lib/types`; `Button` từ `@/components/ui/button`.
- Produces: `ProgressHeader({ progress }: { progress: Progress | null })`; `ChatBubble({ children, tone }: { children: ReactNode; tone?: 'default' | 'error' })`; `AnswerBubble({ label, onEdit, disabled }: { label: string; onEdit: () => void; disabled: boolean })`; `TypingIndicator()`.

- [ ] **Step 1: Viết ProgressHeader**

Tạo `frontend/components/chat/progress-header.tsx`:

```tsx
import type { Progress } from '@/lib/types'

export function ProgressHeader({ progress }: { progress: Progress | null }) {
  const total = progress?.total ?? 7
  const current = progress?.current ?? 0

  return (
    <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center gap-2">
        <span aria-hidden className="text-lg">
          🏠
        </span>
        <span className="font-semibold text-slate-900">Trợ lý BĐS Ocean Park</span>
      </div>
      <div className="flex items-center gap-2" aria-label={`Bước ${current} trên ${total}`}>
        <div className="flex gap-1">
          {Array.from({ length: total }, (_, index) => (
            <span
              key={index}
              className={`size-2 rounded-full ${index < current ? 'bg-sky-600' : 'bg-slate-300'}`}
            />
          ))}
        </div>
        <span className="text-sm tabular-nums text-slate-500">
          {current}/{total}
        </span>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Viết ChatBubble**

Tạo `frontend/components/chat/chat-bubble.tsx`:

```tsx
import type { ReactNode } from 'react'

export function ChatBubble({
  children,
  tone = 'default',
}: {
  children: ReactNode
  tone?: 'default' | 'error'
}) {
  const toneClass =
    tone === 'error'
      ? 'border-red-200 bg-red-50 text-red-900'
      : 'border-slate-200 bg-white text-slate-900'

  return (
    <div className="flex justify-start">
      <div className={`max-w-[85%] rounded-2xl rounded-bl-sm border px-4 py-3 shadow-sm ${toneClass}`}>
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Viết AnswerBubble**

Tạo `frontend/components/chat/answer-bubble.tsx`:

```tsx
import { Button } from '@/components/ui/button'

export function AnswerBubble({
  label,
  onEdit,
  disabled,
}: {
  label: string
  onEdit: () => void
  disabled: boolean
}) {
  return (
    <div className="flex justify-end">
      <div className="flex max-w-[85%] items-center gap-2 rounded-2xl rounded-br-sm bg-sky-600 px-4 py-2 text-white">
        <span className="text-sm">{label}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6 text-white hover:bg-sky-700 hover:text-white"
          onClick={onEdit}
          disabled={disabled}
          aria-label={`Sửa câu trả lời: ${label}`}
        >
          ✎
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Viết TypingIndicator**

Tạo `frontend/components/chat/typing-indicator.tsx`:

```tsx
export function TypingIndicator() {
  return (
    <div className="flex justify-start" role="status" aria-label="Đang soạn câu tiếp theo">
      <div className="flex gap-1 rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="size-2 animate-bounce rounded-full bg-slate-400"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Typecheck, lint và build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: không lỗi. Component chưa được import ở đâu nên build chỉ xác nhận biên dịch được.

- [ ] **Step 6: Commit**

```bash
cd /Users/thuytien/Code/vinai/VinUni_Codelab_Day02_Template
git add frontend/components/chat
git commit -m "feat(frontend): add chat presentational components"
```

---

### Task 6: OptionPicker

Component duy nhất trong khung chat có state nội bộ và hai nhánh hành vi (spec §5). Nhánh
`multi` phục vụ câu `muc_dich` của quy trình sale và là phần bắt buộc của hợp đồng
`Step.type`, không phải code dự phòng.

**Files:**
- Create: `frontend/components/chat/option-picker.tsx`

**Interfaces:**
- Consumes: `Step` từ `@/lib/types`; `Button`; `ToggleGroup`, `ToggleGroupItem` từ `@/components/ui/toggle-group`.
- Produces: `OptionPicker({ step, disabled, onSubmit }: { step: Step; disabled: boolean; onSubmit: (value: string | string[]) => void })`.

- [ ] **Step 1: Viết OptionPicker**

Tạo `frontend/components/chat/option-picker.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { Step } from '@/lib/types'

export function OptionPicker({
  step,
  disabled,
  onSubmit,
}: {
  step: Step
  disabled: boolean
  onSubmit: (value: string | string[]) => void
}) {
  const [selected, setSelected] = useState<string[]>([])

  if (step.type === 'single') {
    return (
      <div className="flex flex-wrap gap-2">
        {step.options.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={disabled}
            onClick={() => onSubmit(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <ToggleGroup
        type="multiple"
        value={selected}
        onValueChange={setSelected}
        disabled={disabled}
        className="flex flex-wrap justify-start gap-2"
      >
        {step.options.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            className="rounded-full border border-slate-200 px-4 data-[state=on]:bg-sky-600 data-[state=on]:text-white"
          >
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <Button
        type="button"
        disabled={disabled || selected.length === 0}
        onClick={() => onSubmit(selected)}
      >
        Xác nhận
      </Button>
    </div>
  )
}
```

Câu single gửi ngay khi bấm chip; câu multi phải bấm "Xác nhận" và nút bị vô hiệu hoá khi chưa
chọn gì (spec §5). Selection nằm trong state nội bộ nên container **phải** render với
`key={step.id}` để đổi câu là reset lựa chọn — đã ghi trong Task 8.

- [ ] **Step 2: Typecheck, lint và build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: không lỗi.

- [ ] **Step 3: Commit**

```bash
cd /Users/thuytien/Code/vinai/VinUni_Codelab_Day02_Template
git add frontend/components/chat/option-picker.tsx
git commit -m "feat(frontend): add option picker with single-tap and multi-confirm modes"
```

---

### Task 7: Màn hình kết quả + CTA mời xem nhà mẫu

Bước 7 của quy trình sale ("cuối tuần này anh/chị qua xem sa bàn và nhà mẫu đi") là CTA sau
danh sách kết quả, **thay cho** nút "Liên hệ tư vấn" trên từng card.

**Files:**
- Create: `frontend/components/listings/listing-card.tsx`
- Create: `frontend/components/listings/visit-invitation.tsx`
- Create: `frontend/components/listings/listing-results.tsx`

**Interfaces:**
- Consumes: `Listing` từ `@/lib/types`; `Badge`, `Button`, `Card`, `CardContent`, `CardFooter`, `Separator` từ `@/components/ui/*`.
- Produces: `ListingCard({ listing }: { listing: Listing })`; `VisitInvitation()`; `ListingResults({ summary, listings, onRelaxBudget }: { summary: string; listings: Listing[]; onRelaxBudget: () => void })`.

- [ ] **Step 1: Viết ListingCard**

Tạo `frontend/components/listings/listing-card.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import type { Listing } from '@/lib/types'

export function ListingCard({ listing }: { listing: Listing }) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = listing.image_url !== null && !imageFailed

  const specs = [
    listing.area_m2 === null ? null : `${listing.area_m2} m²`,
    listing.bedrooms === null ? null : `${listing.bedrooms} PN`,
    listing.bathrooms === null ? null : `${listing.bathrooms} WC`,
  ].filter((item) => item !== null)

  return (
    <Card className="gap-4 overflow-hidden pt-0">
      <div className="relative h-40 w-full bg-gradient-to-br from-sky-200 to-emerald-200">
        {showImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.image_url ?? ''}
            alt={listing.name}
            className="h-40 w-full object-cover"
            onError={() => setImageFailed(true)}
          />
        )}
        {listing.match_score !== null && (
          <Badge className="absolute top-2 right-2 bg-emerald-600 text-white">
            {listing.match_score}% khớp
          </Badge>
        )}
      </div>

      <CardContent className="space-y-2">
        <div>
          <h3 className="font-semibold text-slate-900">{listing.name}</h3>
          <p className="text-sm text-slate-500">{listing.subdivision}</p>
        </div>
        <p className="text-lg font-bold text-sky-700">{listing.price_label}</p>
        {specs.length > 0 && <p className="text-sm text-slate-600">{specs.join(' · ')}</p>}
        <ul className="space-y-1 text-sm text-slate-700">
          {listing.reasons.map((reason) => (
            <li key={reason} className="flex gap-2">
              <span aria-hidden className="text-emerald-600">
                ✓
              </span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      {listing.detail_url && (
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <a href={listing.detail_url} target="_blank" rel="noreferrer">
              Xem chi tiết
            </a>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
```

Ba ràng buộc spec §8 nằm ở đây: `image_url` null hoặc ảnh lỗi → giữ nền gradient; `detail_url`
null → ẩn hẳn footer; thêm vào đó `match_score`/`area_m2`/`bedrooms`/`bathrooms` null (dữ liệu
từ backend thật) → ẩn đúng phần đó, không in "null" hay "0".

- [ ] **Step 2: Viết VisitInvitation**

Tạo `frontend/components/listings/visit-invitation.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

const SLOTS = [
  { value: 'sang_t7', label: 'Sáng thứ 7' },
  { value: 'chieu_t7', label: 'Chiều thứ 7' },
  { value: 'chu_nhat', label: 'Chủ nhật' },
  { value: 'goi_lai', label: 'Để em gọi lại sau' },
]

export function VisitInvitation() {
  const [picked, setPicked] = useState<string | null>(null)

  return (
    <section className="space-y-3 rounded-2xl border border-sky-200 bg-sky-50 p-4">
      <p className="text-slate-800">
        Cuối tuần này rảnh anh/chị cứ qua xem thực tế sa bàn và nhà mẫu ạ, thích thì mình tính
        tiếp, không sao cả. Anh/chị tiện qua lúc nào để em báo chuẩn bị đón tiếp nhà mình ạ?
      </p>
      <div className="flex flex-wrap gap-2">
        {SLOTS.map((slot) => (
          <Button
            key={slot.value}
            type="button"
            variant={picked === slot.value ? 'default' : 'outline'}
            className="rounded-full"
            onClick={() => setPicked(slot.value)}
          >
            {slot.label}
          </Button>
        ))}
      </div>
      {picked !== null && (
        <p role="status" className="text-sm font-medium text-emerald-700">
          {picked === 'goi_lai'
            ? 'Dạ vâng, em sẽ gọi lại cho anh/chị ạ.'
            : `Dạ em đã ghi nhận ${SLOTS.find((slot) => slot.value === picked)?.label.toLowerCase()}. Em gọi xác nhận trước một tiếng ạ.`}
        </p>
      )}
    </section>
  )
}
```

Bấm chip chỉ đổi state nội bộ và hiện xác nhận — **không** gửi đi đâu, không mở form. Đây là
ranh giới có chủ ý của spec §5: sản phẩm chỉ gợi ý, chốt khách do người thật làm.

- [ ] **Step 3: Viết ListingResults**

Tạo `frontend/components/listings/listing-results.tsx`:

```tsx
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ListingCard } from './listing-card'
import { VisitInvitation } from './visit-invitation'
import type { Listing } from '@/lib/types'

export function ListingResults({
  summary,
  listings,
  onRelaxBudget,
}: {
  summary: string
  listings: Listing[]
  onRelaxBudget: () => void
}) {
  return (
    <section className="space-y-4">
      <p className="rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
        {summary}
      </p>

      {listings.length === 0 ? (
        <div className="space-y-3 rounded-xl border border-dashed border-slate-300 p-6 text-center">
          <p className="text-slate-600">Chưa có căn nào khớp hoàn toàn.</p>
          <Button type="button" variant="outline" onClick={onRelaxBudget}>
            Nới tầm tài chính
          </Button>
        </div>
      ) : (
        <>
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          <VisitInvitation />
        </>
      )}
    </section>
  )
}
```

- [ ] **Step 4: Typecheck, lint và build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: không lỗi.

- [ ] **Step 5: Commit**

```bash
cd /Users/thuytien/Code/vinai/VinUni_Codelab_Day02_Template
git add frontend/components/listings
git commit -m "feat(frontend): add listing results, nullable-safe card and showroom visit CTA"
```

---

### Task 8: Nối tất cả lại — container, trang, rewrites, README, kiểm thủ công

**Files:**
- Create: `frontend/components/chat/chat-container.tsx`
- Modify: `frontend/app/page.tsx` (thay toàn bộ nội dung mặc định)
- Modify: `frontend/app/layout.tsx` (`lang="vi"` + metadata)
- Modify: `frontend/next.config.ts` (thêm `rewrites`)
- Create: `frontend/.env.example`
- Create: `frontend/README.md`

**Interfaces:**
- Consumes: `chatReducer`, `initialState` từ `@/lib/chat-reducer`; `sendAnswers` từ `@/lib/chat-client`; `Answers`, `Step` từ `@/lib/types`; `ProgressHeader`, `ChatBubble`, `AnswerBubble`, `TypingIndicator`, `OptionPicker`; `ListingResults`; `Button`.
- Produces: `ChatContainer()`.

- [ ] **Step 1: Viết ChatContainer**

Tạo `frontend/components/chat/chat-container.tsx`:

```tsx
'use client'

import { useCallback, useEffect, useReducer, useRef } from 'react'
import { AnswerBubble } from './answer-bubble'
import { ChatBubble } from './chat-bubble'
import { OptionPicker } from './option-picker'
import { ProgressHeader } from './progress-header'
import { TypingIndicator } from './typing-indicator'
import { ListingResults } from '@/components/listings/listing-results'
import { Button } from '@/components/ui/button'
import { sendAnswers } from '@/lib/chat-client'
import { chatReducer, initialState } from '@/lib/chat-reducer'
import type { Answers, Step } from '@/lib/types'

const TYPING_MS = 400

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function answerLabel(step: Step, value: string | string[]): string {
  const values = Array.isArray(value) ? value : [value]
  return values
    .map((item) => step.options.find((option) => option.value === item)?.label ?? item)
    .join(', ')
}

export function ChatContainer() {
  const [state, dispatch] = useReducer(chatReducer, initialState)
  const sessionId = useRef('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const send = useCallback(async (answers: Answers) => {
    try {
      const [response] = await Promise.all([
        sendAnswers(sessionId.current, answers),
        sleep(TYPING_MS),
      ])
      dispatch({ type: 'RESPONSE_RECEIVED', response })
    } catch (error) {
      console.error('[chat] sendAnswers failed', error)
      dispatch({ type: 'REQUEST_FAILED' })
    }
  }, [])

  useEffect(() => {
    sessionId.current = crypto.randomUUID()
    void send({})
  }, [send])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [state])

  const busy = state.phase === 'loading'

  function handleAnswer(value: string | string[]) {
    const step = state.current
    if (!step) return
    dispatch({ type: 'ANSWER_SUBMITTED', value })
    void send({ ...state.answers, [step.id]: value })
  }

  function handleRetry() {
    dispatch({ type: 'REQUEST_SENT' })
    void send(state.answers)
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-2xl flex-col bg-slate-50">
      <ProgressHeader progress={state.progress} />

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {state.history.map((entry) => (
          <div key={entry.step.id} className="space-y-2">
            <ChatBubble>
              <p>{entry.step.question}</p>
            </ChatBubble>
            <AnswerBubble
              label={answerLabel(entry.step, entry.value)}
              disabled={busy}
              onEdit={() => dispatch({ type: 'EDIT_REQUESTED', stepId: entry.step.id })}
            />
          </div>
        ))}

        {state.current && (
          <div className="space-y-3">
            <ChatBubble>
              <p>{state.current.question}</p>
              {state.current.hint && (
                <p className="mt-1 text-sm text-slate-500">{state.current.hint}</p>
              )}
            </ChatBubble>
            <OptionPicker
              key={state.current.id}
              step={state.current}
              disabled={busy}
              onSubmit={handleAnswer}
            />
          </div>
        )}

        {busy && <TypingIndicator />}

        {state.phase === 'error' && (
          <div className="space-y-2">
            <ChatBubble tone="error">
              <p>Mình chưa kết nối được, thử lại nhé.</p>
            </ChatBubble>
            <Button type="button" variant="outline" onClick={handleRetry}>
              Thử lại
            </Button>
          </div>
        )}

        {state.phase === 'results' && state.listings && (
          <ListingResults
            summary={state.summary ?? ''}
            listings={state.listings}
            onRelaxBudget={() => dispatch({ type: 'EDIT_REQUESTED', stepId: 'ngan_sach' })}
          />
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
```

Ba điểm dễ làm sai: `Promise.all` với `sleep(400)` giữ typing indicator tối thiểu 400ms kể cả
khi mock trả về tức thì (spec §5); bấm ✎ **không** gọi API vì câu hỏi cũ đã nằm trong `history`;
`key={state.current.id}` để lựa chọn multi không dính sang câu sau.

- [ ] **Step 2: Rút gọn trang chủ**

Thay toàn bộ `frontend/app/page.tsx`:

```tsx
import { ChatContainer } from '@/components/chat/chat-container'

export default function Home() {
  return <ChatContainer />
}
```

- [ ] **Step 3: Sửa layout**

Trong `frontend/app/layout.tsx`: đổi `<html lang="en">` thành `<html lang="vi">` và thay object
`metadata`:

```ts
export const metadata: Metadata = {
  title: 'Trợ lý BĐS Ocean Park',
  description: 'Trợ lý AI gợi ý bất động sản phù hợp tại Vinhomes Ocean Park',
}
```

- [ ] **Step 4: Thêm rewrites cho FastAPI**

Thay `frontend/next.config.ts`:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: '/api/:path*', destination: 'http://localhost:8000/api/:path*' }]
  },
}

export default nextConfig
```

Frontend luôn gọi đường dẫn tương đối `/api/chat` nên trình duyệt coi như cùng origin — không
phát sinh CORS, backend không phải thêm middleware (spec §3.5).

- [ ] **Step 5: Ghi tài liệu cách chạy**

Tạo `frontend/.env.example`:

```
# Để trống hoặc "true" -> chạy mock hoàn toàn offline (mặc định, dùng cho demo).
# Đặt "false" -> gọi POST /api/chat, rewrite sang FastAPI cổng 8000.
NEXT_PUBLIC_USE_MOCK=true
```

Tạo `frontend/README.md`:

````markdown
# Frontend — Chatbot BĐS Ocean Park

Thiết kế: `../docs/superpowers/specs/2026-09-12-chatbot-bds-ocean-park-design.md`
Kế hoạch: `../docs/superpowers/plans/2026-09-12-chatbot-bds-ocean-park-frontend.md`

Trợ lý đi đúng 7 bước của quy trình sale Vinhomes Ocean Park, rồi gợi ý căn kèm điểm khớp
và lý do, và chốt bằng lời mời qua xem sa bàn / nhà mẫu.

## Chạy

```bash
npm install
npm run dev        # http://localhost:3000, mặc định dùng mock
npm test           # test logic trong lib/
```

## Trước buổi demo

```bash
npm run build && npm start
```

## Nối backend thật

Xem mục "Nối backend" trong README sau khi Task 9 hoàn thành.
````

- [ ] **Step 6: Chạy toàn bộ kiểm chứng tự động**

Run: `npm test && npx tsc --noEmit && npm run lint && npm run build`
Expected: test PASS, không lỗi type, lint sạch, build thành công.

- [ ] **Step 7: Kiểm thủ công trên trình duyệt**

Run: `npm run dev`, mở http://localhost:3000, đi hết checklist:

- [ ] Vào trang thấy typing indicator rồi hiện câu 1 (lời chào Ocean Park), header hiện `1/7`.
- [ ] Câu 1 (multi): nút "Xác nhận" mờ khi chưa chọn; chọn cả "Về ở ngay" + "Đầu tư sinh lời" rồi Xác nhận thì sang câu 2, bong bóng trả lời hiện cả hai label cách nhau dấu phẩy.
- [ ] Câu 2 (single): bấm một chip là chuyển câu ngay, không cần xác nhận.
- [ ] Mỗi lần chuyển câu đều thấy typing indicator một nhịp ngắn, không nhảy phựt.
- [ ] Dots và số `x/7` ở header tăng đúng theo từng câu.
- [ ] Trả lời hết 7 câu → hiện summary nhắc lại mục đích + tầm tài chính + quy mô, rồi lưới card.
- [ ] Card có badge `% khớp`, tối đa 3 lý do, nền gradient thay ảnh; card xếp theo điểm giảm dần.
- [ ] Dưới lưới card có khối mời xem nhà mẫu; bấm một buổi → hiện xác nhận tại chỗ, không mở form, không điều hướng.
- [ ] Card không có `detail_url` thì không thấy nút "Xem chi tiết".
- [ ] Bấm ✎ ở câu số 2 → quay lại câu 2, các câu sau và kết quả biến mất; trả lời lại thì đi tiếp bình thường.
- [ ] Chọn `1 phòng ngủ` + `Trên 15 tỷ` → thấy trạng thái rỗng + nút "Nới tầm tài chính"; bấm nút thì quay về câu tầm tài chính.
- [ ] Đổi câu "khu sầm uất" thành "yên tĩnh" (bằng nút ✎) → thứ tự card đổi rõ rệt.
- [ ] Khu vực chat tự cuộn xuống tin nhắn mới nhất.
- [ ] Thu cửa sổ về ~400px: không tràn ngang, chip xuống dòng, card một cột.

- [ ] **Step 8: Commit**

```bash
cd /Users/thuytien/Code/vinai/VinUni_Codelab_Day02_Template
git add frontend/components/chat/chat-container.tsx frontend/app/page.tsx \
  frontend/app/layout.tsx frontend/next.config.ts frontend/.env.example frontend/README.md
git commit -m "feat(frontend): wire chat container, page shell, API rewrites and run docs"
```

---

### Task 9: Adapter sang backend `real_estate_backend.py`

Backend hiện có contract khác và dữ liệu chưa đủ (xem Global Constraints). Task này **không**
đổi đường demo — mock vẫn là mặc định — nhưng viết và test sẵn đường sang backend để khi có dữ
liệu cấp căn thì chỉ đổi một biến môi trường.

**Files:**
- Create: `frontend/lib/backend-adapter.ts`
- Test: `frontend/lib/backend-adapter.test.ts`
- Modify: `frontend/lib/chat-client.ts` (thêm nhánh backend vào `sendAnswers`)
- Modify: `frontend/lib/chat-client.test.ts` (thêm test cho nhánh backend)
- Modify: `frontend/README.md` (mục "Nối backend" + ghi chú bàn giao)

**Interfaces:**
- Consumes: `firstAnswer`, `answerList` từ `@/lib/answers`; `labelOf` từ `@/lib/sales-flow`; `Answers`, `Listing`, `ResultsResponse` từ `@/lib/types`.
- Produces:
  - `interface BackendProperty`, `interface BackendChatResponse`
  - `buildMessage(answers: Answers): string`
  - `toResults(payload: BackendChatResponse): ResultsResponse`
  - `formatPriceLabel(priceVnd: number | null): string`

- [ ] **Step 1: Viết test thất bại cho adapter**

Tạo `frontend/lib/backend-adapter.test.ts`:

```ts
import { expect, it } from 'vitest'
import { buildMessage, formatPriceLabel, toResults, type BackendProperty } from './backend-adapter'
import type { Answers } from './types'

const FULL: Answers = {
  muc_dich: ['o_ngay'],
  quy_mo: '2pn',
  ngan_sach: '3_5ty',
  khong_gian: 'sam_uat',
  ban_giao: 'ngay',
  thanh_toan: 'vay_0',
  noi_that: 'co_san',
}

function property(overrides: Partial<BackendProperty> = {}): BackendProperty {
  return {
    property_id: 'ocp2-001',
    project: 'Vinhomes Ocean Park 2 - The Empire',
    zone: 'Khu vực phía Đông',
    building: 'Sapphire 2',
    unit_code: '1203',
    district: 'Van Giang',
    property_type: 'apartment',
    bedrooms: 2,
    bathrooms: 2,
    area_m2: 68,
    price_vnd: 4_200_000_000,
    purpose_fit: ['residential'],
    nearby_amenities: ['schools', 'shopping', 'parks'],
    images: [],
    source_url: null,
    status: 'for_sale',
    ...overrides,
  }
}

it('câu gửi backend chứa đúng token mà extract_filters bắt được', () => {
  const message = buildMessage(FULL)
  expect(message).toContain('căn hộ')
  expect(message).toContain('2 phòng ngủ')
  expect(message).toContain('dưới 5 tỷ')
})

it('ngân sách trên 15 tỷ thì không gửi token "dưới" để backend khỏi lọc sai', () => {
  expect(buildMessage({ ...FULL, ngan_sach: 'tren_15ty' })).not.toContain('dưới')
})

it('câu gửi backend mang theo cả 4 câu mềm để LLM giải thích đúng ngữ cảnh', () => {
  const message = buildMessage(FULL)
  expect(message).toContain('sầm uất')
  expect(message).toContain('nhận nhà ngay')
  expect(message).toContain('vay ngân hàng 0%')
  expect(message).toContain('nội thất sẵn')
})

it('formatPriceLabel cắt đuôi thập phân 0 và báo rõ khi thiếu giá', () => {
  expect(formatPriceLabel(4_200_000_000)).toBe('4,2 tỷ')
  expect(formatPriceLabel(24_000_000_000)).toBe('24 tỷ')
  expect(formatPriceLabel(null)).toBe('Giá chưa xác minh')
})

it('toResults dùng answer của backend làm summary', () => {
  const results = toResults({
    answer: 'Em gợi ý 1 căn ạ',
    listings: [property()],
    model: 'gpt',
    used_model: true,
  })
  expect(results.type).toBe('results')
  expect(results.summary).toBe('Em gợi ý 1 căn ạ')
  expect(results.listings).toHaveLength(1)
})

it('map Property sang Listing đúng field và không bịa match_score', () => {
  const [listing] = toResults({
    answer: 'a',
    listings: [property()],
    model: 'gpt',
    used_model: true,
  }).listings
  expect(listing.id).toBe('ocp2-001')
  expect(listing.name).toBe('Sapphire 2 — 1203')
  expect(listing.subdivision).toBe('Vinhomes Ocean Park 2 - The Empire')
  expect(listing.price_label).toBe('4,2 tỷ')
  expect(listing.match_score).toBeNull()
  expect(listing.image_url).toBeNull()
  expect(listing.detail_url).toBeNull()
})

it('giữ nguyên null của backend thay vì đổi thành 0', () => {
  const [listing] = toResults({
    answer: 'a',
    listings: [property({ bedrooms: null, bathrooms: null, area_m2: null, price_vnd: null })],
    model: 'fallback',
    used_model: false,
  }).listings
  expect(listing.bedrooms).toBeNull()
  expect(listing.bathrooms).toBeNull()
  expect(listing.area_m2).toBeNull()
  expect(listing.price_label).toBe('Giá chưa xác minh')
})

it('lý do dựng từ dữ liệu backend thật sự có, tối đa 3 dòng', () => {
  const [listing] = toResults({
    answer: 'a',
    listings: [property({ status: 'reference_only' })],
    model: 'gpt',
    used_model: true,
  }).listings
  expect(listing.reasons.length).toBeLessThanOrEqual(3)
  expect(listing.reasons.join(' ')).toContain('trường học')
  expect(listing.reasons.join(' ')).toContain('chưa xác minh')
})

it('ảnh đầu tiên thành image_url, source_url thành detail_url', () => {
  const [listing] = toResults({
    answer: 'a',
    listings: [
      property({ images: ['https://img/1.jpg', 'https://img/2.jpg'], source_url: 'https://vin' }),
    ],
    model: 'gpt',
    used_model: true,
  }).listings
  expect(listing.image_url).toBe('https://img/1.jpg')
  expect(listing.detail_url).toBe('https://vin')
})
```

- [ ] **Step 2: Chạy test để chắc chắn nó fail**

Run: `npm test -- backend-adapter`
Expected: FAIL — không resolve được `./backend-adapter`.

- [ ] **Step 3: Viết adapter**

Tạo `frontend/lib/backend-adapter.ts`:

```ts
import { answerList, firstAnswer } from './answers'
import type { Answers, Listing, ResultsResponse } from './types'

/** Chỉ những field frontend đọc, theo Property của real_estate_backend.py. */
export interface BackendProperty {
  property_id: string
  project: string
  zone: string | null
  building: string | null
  unit_code: string | null
  district: string | null
  property_type: string
  bedrooms: number | null
  bathrooms: number | null
  area_m2: number | null
  price_vnd: number | null
  purpose_fit: string[]
  nearby_amenities: string[]
  images: string[]
  source_url: string | null
  status: string
}

export interface BackendChatResponse {
  answer: string
  listings: BackendProperty[]
  model: string
  used_model: boolean
}

const TYPE_PHRASE: Record<string, string> = {
  '1pn': 'căn hộ',
  '2pn': 'căn hộ',
  '3pn': 'căn hộ',
  '4pn_tro_len': 'nhà phố',
}

const BEDROOM_PHRASE: Record<string, string> = {
  '1pn': '1 phòng ngủ',
  '2pn': '2 phòng ngủ',
  '3pn': '3 phòng ngủ',
  '4pn_tro_len': '4 phòng ngủ',
}

const BUDGET_CEILING_TY: Record<string, number> = {
  duoi_3ty: 3,
  '3_5ty': 5,
  '5_8ty': 8,
  '8_15ty': 15,
}

const VIBE_PHRASE: Record<string, string> = {
  sam_uat: 'thích khu sầm uất gần trung tâm',
  yen_tinh: 'thích khu yên tĩnh nhiều cây xanh',
  can_bang: 'cân bằng giữa sầm uất và yên tĩnh',
}

const HANDOVER_PHRASE: Record<string, string> = {
  ngay: 'cần nhận nhà ngay',
  trong_nam: 'cần nhận nhà trong năm nay',
  sang_nam: 'nhận nhà sang năm cũng được',
  linh_hoat: 'thời điểm nhận nhà linh hoạt',
}

const PAYMENT_PHRASE: Record<string, string> = {
  von_tu_co: 'thanh toán bằng vốn tự có để lấy chiết khấu',
  vay_0: 'muốn dùng gói vay ngân hàng 0%',
  chua_quyet: 'chưa quyết phương thức thanh toán',
}

const FURNISHING_PHRASE: Record<string, string> = {
  tho: 'muốn nhà thô để tự thiết kế',
  co_san: 'muốn căn có nội thất sẵn',
  deu_duoc: 'nhà thô hay nội thất sẵn đều được',
}

const PURPOSE_PHRASE: Record<string, string> = {
  o_ngay: 'để ở ngay',
  dau_tu: 'để đầu tư sinh lời',
  nguoi_than: 'để cho người thân ở',
}

const AMENITY_PHRASE: Record<string, string> = {
  schools: 'trường học',
  shopping: 'trung tâm mua sắm',
  parks: 'công viên',
  lake: 'hồ nước',
  sports: 'khu thể thao',
  offices: 'khu văn phòng',
  entertainment: 'khu vui chơi',
  exhibition_center: 'trung tâm triển lãm',
}

export function buildMessage(answers: Answers): string {
  const scale = firstAnswer(answers.quy_mo)
  const budget = firstAnswer(answers.ngan_sach)
  const parts: string[] = ['Tôi tìm', TYPE_PHRASE[scale] ?? 'bất động sản', 'ở Ocean Park']

  const bedrooms = BEDROOM_PHRASE[scale]
  if (bedrooms) parts.push(bedrooms)

  const ceiling = BUDGET_CEILING_TY[budget]
  if (ceiling !== undefined) parts.push(`dưới ${ceiling} tỷ`)
  else if (budget === 'tren_15ty') parts.push('tầm trên 15 tỷ')

  const purposes = answerList(answers.muc_dich)
    .map((value) => PURPOSE_PHRASE[value])
    .filter((phrase) => phrase !== undefined)
  if (purposes.length > 0) parts.push(purposes.join(' và '))

  const soft = [
    VIBE_PHRASE[firstAnswer(answers.khong_gian)],
    HANDOVER_PHRASE[firstAnswer(answers.ban_giao)],
    PAYMENT_PHRASE[firstAnswer(answers.thanh_toan)],
    FURNISHING_PHRASE[firstAnswer(answers.noi_that)],
  ].filter((phrase) => phrase !== undefined)

  const request = `${parts.join(' ')}.`
  return soft.length > 0 ? `${request} Tôi ${soft.join(', ')}.` : request
}

export function formatPriceLabel(priceVnd: number | null): string {
  if (priceVnd === null) return 'Giá chưa xác minh'
  const billions = priceVnd / 1_000_000_000
  const rounded = Math.round(billions * 10) / 10
  const text = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(1).replace('.', ',')
  return `${text} tỷ`
}

export function toResults(payload: BackendChatResponse): ResultsResponse {
  return {
    type: 'results',
    summary: payload.answer,
    listings: payload.listings.map(toListing),
  }
}

function toListing(property: BackendProperty): Listing {
  return {
    id: property.property_id,
    name: unitName(property),
    subdivision: property.project,
    price_label: formatPriceLabel(property.price_vnd),
    area_m2: property.area_m2,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    image_url: property.images[0] ?? null,
    match_score: null,
    reasons: buildReasons(property),
    detail_url: property.source_url,
  }
}

function unitName(property: BackendProperty): string {
  const parts = [property.building, property.unit_code].filter(
    (part): part is string => part !== null && part !== '',
  )
  return parts.length > 0 ? parts.join(' — ') : property.project
}

function buildReasons(property: BackendProperty): string[] {
  const reasons: string[] = []

  const amenities = property.nearby_amenities
    .map((item) => AMENITY_PHRASE[item])
    .filter((phrase): phrase is string => phrase !== undefined)
    .slice(0, 3)
  if (amenities.length > 0) reasons.push(`Gần ${amenities.join(', ')}`)

  if (property.purpose_fit.includes('residential')) {
    reasons.push('Dữ liệu ghi nhận phù hợp để ở')
  } else if (property.purpose_fit.includes('investment')) {
    reasons.push('Dữ liệu ghi nhận phù hợp để đầu tư')
  }

  if (property.status === 'reference_only') {
    reasons.push('Thông tin tham khảo, chưa xác minh')
  }

  return reasons.slice(0, 3)
}
```

`match_score` luôn `null`: backend không trả điểm khớp, và bịa một con số là nói sai với khách.
`reasons` chỉ dựng từ `nearby_amenities`, `purpose_fit`, `status` — đúng những gì backend có.

- [ ] **Step 4: Chạy test để chắc chắn nó pass**

Run: `npm test -- backend-adapter`
Expected: PASS — 10 test.

- [ ] **Step 5: Thêm test nhánh backend cho chat-client**

Thêm vào cuối `frontend/lib/chat-client.test.ts`:

```ts
it('USE_MOCK=false và đủ 7 câu thì POST /api/chat đúng contract của backend', async () => {
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK', 'false')
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ answer: 'Em gợi ý 0 căn ạ', listings: [], model: 'gpt', used_model: true }),
  })
  vi.stubGlobal('fetch', fetchMock)

  const response = (await sendAnswers('sess-9', FULL)) as ResultsResponse

  expect(fetchMock).toHaveBeenCalledTimes(1)
  const [url, init] = fetchMock.mock.calls[0]
  expect(url).toBe('/api/chat')
  expect(init.method).toBe('POST')
  expect(init.headers).toEqual({ 'Content-Type': 'application/json' })
  const body = JSON.parse(init.body)
  expect(body.conversation_id).toBe('sess-9')
  expect(body.message).toContain('2 phòng ngủ')
  expect(response.summary).toBe('Em gợi ý 0 căn ạ')
})

it('USE_MOCK=false và backend lỗi thì throw để UI vào trạng thái error', async () => {
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK', 'false')
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: false, status: 500, text: async () => '{"detail":"boom"}' }),
  )
  await expect(sendAnswers('sess-9', FULL)).rejects.toThrow('500')
})
```

- [ ] **Step 6: Thêm nhánh backend vào chat-client**

Thay toàn bộ `frontend/lib/chat-client.ts`:

```ts
import { buildMessage, toResults, type BackendChatResponse } from './backend-adapter'
import { buildMockResults } from './mock-results'
import { SALES_FLOW, SALES_TOTAL } from './sales-flow'
import type { Answers, ChatResponse } from './types'

export function nextQuestion(answers: Answers): ChatResponse | null {
  const index = SALES_FLOW.findIndex((step) => answers[step.id] === undefined)
  if (index === -1) return null
  return {
    type: 'question',
    progress: { current: index + 1, total: SALES_TOTAL },
    step: SALES_FLOW[index],
  }
}

export async function sendAnswers(sessionId: string, answers: Answers): Promise<ChatResponse> {
  const pending = nextQuestion(answers)
  if (pending) return pending
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'false') return fetchBackendResults(sessionId, answers)
  return buildMockResults(answers)
}

async function fetchBackendResults(sessionId: string, answers: Answers): Promise<ChatResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: buildMessage(answers), conversation_id: sessionId }),
  })
  if (!response.ok) {
    throw new Error(`POST /api/chat ${response.status}: ${await response.text()}`)
  }
  return toResults((await response.json()) as BackendChatResponse)
}
```

- [ ] **Step 7: Chạy toàn bộ test và build**

Run: `npm test && npx tsc --noEmit && npm run lint && npm run build`
Expected: PASS toàn bộ; không lỗi.

- [ ] **Step 8: Viết tài liệu nối backend + ghi chú bàn giao**

Thay mục "Nối backend thật" trong `frontend/README.md` bằng:

````markdown
## Nối backend thật

Backend nằm ở `../real_estate_backend.py` (merge từ branch `khoa`).

```bash
cd ..
source .venv/bin/activate
pip install -r requirements.txt
export OPENAI_API_KEY=...            # thiếu key thì backend tự trả câu fallback tiếng Anh
uvicorn real_estate_backend:app --port 8000 --reload
```

Rồi ở `frontend/`: `cp .env.example .env.local`, đổi thành `NEXT_PUBLIC_USE_MOCK=false`,
chạy lại `npm run dev`.

### Tại sao demo vẫn chạy mock

`real_estate_backend.py` dùng contract khác spec §3 (nhận `{message}`, trả
`{answer, listings}`) — `lib/backend-adapter.ts` đã dịch hai chiều nên frontend chạy được.
Vấn đề còn lại là **dữ liệu**: 12 dòng trong `SEED_PROPERTIES` đều ở cấp dự án, với
`bedrooms`, `area_m2`, `price_vnd`, `handover_status`, `loan_support`, `furnishing` **null
toàn bộ**. Vì `search_listings` lọc bằng SQL `bedrooms >= ?` và `price_vnd <= ?`, gửi filter
phòng ngủ/giá vào sẽ trả về 0 dòng.

Để chuyển hẳn sang backend, cần phía backend:

1. Seed dữ liệu **cấp căn** có `bedrooms`, `area_m2`, `price_vnd`, `status = 'for_sale'`.
2. Điền `handover_status`, `loan_support`, `furnishing` — ba câu 5, 6, 7 của quy trình sale
   đang hỏi đúng ba field này.
3. Thêm `min_price_vnd` vào `extract_filters` (hiện chỉ bắt "dưới N tỷ", không bắt "trên N tỷ").
4. Nếu muốn đúng spec §3: trả thêm `match_score` và `reasons` theo từng căn, và
   `price_label` đã format sẵn — hiện frontend phải tự format giá.
````

- [ ] **Step 9: Commit**

```bash
cd /Users/thuytien/Code/vinai/VinUni_Codelab_Day02_Template
git add frontend/lib/backend-adapter.ts frontend/lib/backend-adapter.test.ts \
  frontend/lib/chat-client.ts frontend/lib/chat-client.test.ts frontend/README.md
git commit -m "feat(frontend): add backend adapter for real_estate_backend contract"
```
