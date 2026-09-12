"use client"

import React from 'react'

interface ChatBubbleProps {
  content: string
  hint?: string | null
}

export function ChatBubble({ content, hint }: ChatBubbleProps) {
  return (
    <div className="flex gap-3 max-w-[85%] sm:max-w-[78%] animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#0F2A4A] via-indigo-600 to-pink-500 text-xs font-bold text-white shadow-md shadow-indigo-500/20 ring-2 ring-white/50 dark:ring-slate-800">
        AI
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="relative rounded-2xl rounded-tl-sm bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 shadow-md leading-relaxed">
          <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-blue-600 via-indigo-500 to-pink-500" />
          {content}
        </div>
        {hint && (
          <span className="px-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            <span className="text-amber-500">💡</span> {hint}
          </span>
        )}
      </div>
    </div>
  )
}

