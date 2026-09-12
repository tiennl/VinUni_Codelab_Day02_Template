"use client"

import React, { useReducer, useEffect, useRef } from 'react'
import { chatReducer, initialChatState } from '../../lib/chat-reducer'
import { sendAnswers } from '../../lib/chat-client'
import { ProgressHeader } from './progress-header'
import { ChatBubble } from './chat-bubble'
import { AnswerBubble } from './answer-bubble'
import { OptionPicker } from './option-picker'
import { TypingIndicator } from './typing-indicator'
import { ListingResults } from '../listings/listing-results'
import { AlertCircle } from 'lucide-react'
import { Button } from '../ui/button'

export function ChatContainer() {
  const [state, dispatch] = useReducer(chatReducer, initialChatState)
  const sessionIdRef = useRef<string>(
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `session-${Date.now()}`
  )
  const scrollBottomRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom
  const scrollToBottom = () => {
    scrollBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [state.history, state.status, state.currentStep])

  // Initial load
  useEffect(() => {
    let isMounted = true
    dispatch({ type: 'START' })

    sendAnswers(sessionIdRef.current, {})
      .then((res) => {
        if (isMounted) dispatch({ type: 'RECEIVE_RESPONSE', response: res })
      })
      .catch((err) => {
        if (isMounted) dispatch({ type: 'SET_ERROR', error: err.message })
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Submit answer handler
  const handleSubmitAnswer = (
    stepId: string,
    question: string,
    value: string | string[],
    label: string
  ) => {
    dispatch({ type: 'SUBMIT_ANSWER', stepId, question, value, label })

    const updatedAnswers = { ...state.answers, [stepId]: value }
    sendAnswers(sessionIdRef.current, updatedAnswers)
      .then((res) => {
        dispatch({ type: 'RECEIVE_RESPONSE', response: res })
      })
      .catch((err) => {
        dispatch({ type: 'SET_ERROR', error: err.message })
      })
  }

  // Edit previous answer
  const handleEditStep = (stepId: string) => {
    dispatch({ type: 'EDIT_STEP', stepId })

    // Recalculate kept answers
    const stepIndex = state.history.findIndex((h) => h.stepId === stepId)
    const keptHistory = state.history.slice(0, stepIndex)
    const newAnswers: Record<string, string | string[]> = {}
    keptHistory.forEach((item) => {
      newAnswers[item.stepId] = item.answerValue
    })

    sendAnswers(sessionIdRef.current, newAnswers)
      .then((res) => {
        dispatch({ type: 'RECEIVE_RESPONSE', response: res })
      })
      .catch((err) => {
        dispatch({ type: 'SET_ERROR', error: err.message })
      })
  }

  // Reset entire chat
  const handleReset = () => {
    sessionIdRef.current = crypto.randomUUID ? crypto.randomUUID() : `session-${Date.now()}`
    dispatch({ type: 'START' })
    sendAnswers(sessionIdRef.current, {})
      .then((res) => {
        dispatch({ type: 'RECEIVE_RESPONSE', response: res })
      })
      .catch((err) => {
        dispatch({ type: 'SET_ERROR', error: err.message })
      })
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-[#F7F5F0] text-[#1F2A44] font-sans overflow-x-hidden">
      {/* Background ambient gold & navy glow blobs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#C6A75E]/15 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-[#1F2A44]/5 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-[#C6A75E]/15 blur-3xl" />
      </div>

      <ProgressHeader current={state.progress.current} total={state.progress.total} />

      <main className="relative z-1 flex-1 px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Welcome Intro */}
          <div className="text-center py-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#C6A75E]/40 px-3.5 py-1 text-xs font-bold text-[#1F2A44] mb-2 shadow-xs backdrop-blur-xs">
              <span>🤖</span> VinSmart AI Assistant
            </span>
            <h2 className="text-2xl font-extrabold text-[#1F2A44] tracking-tight">
              Tìm Bất Động Sản <span className="bg-gradient-to-r from-[#1F2A44] via-[#A88C48] to-[#C6A75E] bg-clip-text text-transparent">Vinhomes Ocean Park</span>
            </h2>
            <p className="text-xs font-medium text-[#5E6A80] mt-1.5">
              Trả lời 5 câu hỏi nhanh để AI chọn căn hộ hoàn hảo cho bạn.
            </p>
          </div>

          {/* History of Chat */}
          {state.history.map((item) => (
            <div key={item.stepId} className="space-y-4">
              <ChatBubble content={item.question} />
              <AnswerBubble
                label={item.answerLabel}
                onEdit={() => handleEditStep(item.stepId)}
              />
            </div>
          ))}

          {/* Current Question or Loading or Results */}
          {state.status === 'question' && state.currentStep && (
            <div className="space-y-4">
              <ChatBubble
                content={state.currentStep.question}
                hint={state.currentStep.hint}
              />
              <OptionPicker
                step={state.currentStep}
                onSubmit={(val, label) =>
                  handleSubmitAnswer(
                    state.currentStep!.id,
                    state.currentStep!.question,
                    val,
                    label
                  )
                }
              />
            </div>
          )}

          {state.status === 'loading' && (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1F2A44] text-[#C6A75E] text-xs font-extrabold shadow-md ring-2 ring-[#C6A75E]/30">
                AI
              </div>
              <TypingIndicator />
            </div>
          )}

          {state.status === 'results' && state.results && (
            <ListingResults
              results={state.results as any}
              onReset={handleReset}
            />
          )}

          {state.status === 'error' && (
            <div className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-4 dark:border-red-900/40 dark:bg-red-950/30 flex items-center justify-between text-sm text-red-700 dark:text-red-300 shadow-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                <span>{state.error || 'Mình chưa kết nối được, hãy thử lại nhé.'}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 font-bold"
              >
                Thử lại
              </Button>
            </div>
          )}

          <div ref={scrollBottomRef} />
        </div>
      </main>
    </div>
  )
}

