"use client"

import React from 'react'

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-white border border-[#C6A75E]/35 px-4 py-3 shadow-sm w-fit">
      <span className="h-2 w-2 rounded-full bg-[#1F2A44] animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="h-2 w-2 rounded-full bg-[#1F2A44] animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="h-2 w-2 rounded-full bg-[#1F2A44] animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  )
}
