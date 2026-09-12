import type { Answers, ChatResponse } from './types'
import { MOCK_FLOW } from './mock-flow'
import { filterMockListings } from './mock-listings'

export async function sendAnswers(
  sessionId: string,
  answers: Answers
): Promise<ChatResponse> {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK !== 'false'

  if (useMock) {
    // Simulate network latency for pleasant natural chat feel
    await new Promise((resolve) => setTimeout(resolve, 600))

    const answeredKeys = Object.keys(answers)
    const nextStepIndex = answeredKeys.length

    if (nextStepIndex < MOCK_FLOW.length) {
      const step = MOCK_FLOW[nextStepIndex]
      return {
        type: 'question',
        progress: { current: nextStepIndex + 1, total: MOCK_FLOW.length },
        step,
      }
    } else {
      const listings = filterMockListings(answers)
      return {
        type: 'results',
        summary: `Dựa trên nhu cầu của bạn, trợ lý AI Vinhomes gợi ý các bất động sản phù hợp nhất dưới đây:`,
        listings,
      }
    }
  }

  // Real backend call
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, answers }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Không thể kết nối đến máy chủ tư vấn')
  }

  return response.json()
}
