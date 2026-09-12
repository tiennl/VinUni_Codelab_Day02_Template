"use client"

import React from 'react'

interface ChatBubbleProps {
  content: string
  hint?: string | null
}

export function ChatBubble({ content, hint }: ChatBubbleProps) {
  return (
    <div className="flex gap-3 max-w-[85%] sm:max-w-[78%] animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1F2A44] to-[#121A2C] text-[#C6A75E] text-xs font-extrabold shadow-md ring-2 ring-[#C6A75E]/30">
        AI
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="relative overflow-hidden rounded-2xl rounded-tl-sm bg-white border border-[#C6A75E]/35 px-4 py-3 text-sm text-[#1F2A44] shadow-md leading-relaxed">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#C6A75E] via-[#A88C48] to-[#C6A75E]" />
          {content}
        </div>
        {hint && (
          <span className="px-2 text-xs font-medium text-[#A88C48] flex items-center gap-1">
            <span>💡</span> {hint}
          </span>
        )}
      </div>
    </div>
  )
}

