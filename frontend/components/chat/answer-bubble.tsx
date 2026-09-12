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
      <div className="group relative flex items-center gap-2 rounded-2xl rounded-tr-sm bg-gradient-to-r from-[#0F2A4A] via-[#15345B] to-[#1E3E7B] px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-950/20 ring-1 ring-cyan-400/30 hover:ring-cyan-400/60 transition-all">
        <span>{label}</span>
        {onEdit && (
          <button
            onClick={onEdit}
            title="Sửa câu trả lời này"
            className="ml-1 opacity-80 hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-cyan-500/20 text-cyan-300"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

