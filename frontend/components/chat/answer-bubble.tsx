"use client"

import React from 'react'
import { Pencil } from 'lucide-react'

interface AnswerBubbleProps {
  label: string
  onEdit?: () => void
}

export function AnswerBubble({ label, onEdit }: AnswerBubbleProps) {
  return (
    <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="group relative flex items-center gap-2 rounded-2xl rounded-tr-sm bg-gradient-to-r from-[#1F2A44] to-[#2C3B5E] px-4 py-2.5 text-sm font-semibold text-[#E8DCC8] shadow-md ring-1 ring-[#C6A75E]/40 transition-all">
        <span>{label}</span>
        {onEdit && (
          <button
            onClick={onEdit}
            title="Sửa câu trả lời này"
            className="ml-1 opacity-80 hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-[#C6A75E]/20 text-[#C6A75E]"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

