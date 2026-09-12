import type { Answers, ChatResponse, Step } from './types'

export interface ChatState {
  answers: Answers
  history: Array<{ stepId: string; question: string; answerValue: string | string[]; answerLabel: string }>
  currentStep: Step | null
  progress: { current: number; total: number }
  status: 'initial' | 'loading' | 'question' | 'results' | 'error'
  results: ChatResponse | null
  error: string | null
}

export type ChatAction =
  | { type: 'START' }
  | { type: 'SUBMIT_ANSWER'; stepId: string; question: string; value: string | string[]; label: string }
  | { type: 'EDIT_STEP'; stepId: string }
  | { type: 'RECEIVE_RESPONSE'; response: ChatResponse }
  | { type: 'SET_ERROR'; error: string }

export const initialChatState: ChatState = {
  answers: {},
  history: [],
  currentStep: null,
  progress: { current: 1, total: 5 },
  status: 'initial',
  results: null,
  error: null,
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'START':
      return {
        ...state,
        status: 'loading',
        error: null,
      }

    case 'SUBMIT_ANSWER': {
      const newAnswers = { ...state.answers, [action.stepId]: action.value }
      const newHistory = [
        ...state.history.filter((h) => h.stepId !== action.stepId),
        {
          stepId: action.stepId,
          question: action.question,
          answerValue: action.value,
          answerLabel: action.label,
        },
      ]
      return {
        ...state,
        answers: newAnswers,
        history: newHistory,
        status: 'loading',
        error: null,
      }
    }

    case 'EDIT_STEP': {
      const stepIndex = state.history.findIndex((h) => h.stepId === action.stepId)
      if (stepIndex === -1) return state

      const keptHistory = state.history.slice(0, stepIndex)
      const newAnswers: Answers = {}
      keptHistory.forEach((item) => {
        newAnswers[item.stepId] = item.answerValue
      })

      return {
        ...state,
        answers: newAnswers,
        history: keptHistory,
        status: 'loading',
        results: null,
        error: null,
      }
    }

    case 'RECEIVE_RESPONSE': {
      if (action.response.type === 'question') {
        return {
          ...state,
          currentStep: action.response.step,
          progress: action.response.progress,
          status: 'question',
          error: null,
        }
      } else {
        return {
          ...state,
          currentStep: null,
          results: action.response,
          status: 'results',
          error: null,
        }
      }
    }

    case 'SET_ERROR':
      return {
        ...state,
        status: 'error',
        error: action.error,
      }

    default:
      return state
  }
}
