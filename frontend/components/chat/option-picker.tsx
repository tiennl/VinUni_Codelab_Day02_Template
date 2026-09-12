"use client"

import React, { useState } from 'react'
import type { Option, Step } from '../../lib/types'
import { Button } from '../ui/button'
import { Check } from 'lucide-react'

interface OptionPickerProps {
  step: Step
  disabled?: boolean
  onSubmit: (value: string | string[], label: string) => void
}

export function OptionPicker({ step, disabled, onSubmit }: OptionPickerProps) {
  const [selectedMulti, setSelectedMulti] = useState<string[]>([])

  if (step.type === 'single') {
    return (
      <div className="flex flex-wrap gap-2.5 pt-2 animate-in fade-in duration-300">
        {step.options.map((option) => (
          <Button
            key={option.value}
            variant="outline"
            disabled={disabled}
            onClick={() => onSubmit(option.value, option.label)}
            className="rounded-xl border-[#C6A75E]/35 bg-white text-[#1F2A44] hover:border-[#1F2A44] hover:bg-[#1F2A44] hover:text-[#E8DCC8] text-sm font-semibold py-2.5 px-4 shadow-xs hover:shadow-md transition-all text-left active:scale-[0.98]"
          >
            {option.label}
          </Button>
        ))}
      </div>
    )
  }

  // Multi choice
  const toggleOption = (opt: Option) => {
    if (selectedMulti.includes(opt.value)) {
      setSelectedMulti(selectedMulti.filter((v) => v !== opt.value))
    } else {
      setSelectedMulti([...selectedMulti, opt.value])
    }
  }

  const handleConfirmMulti = () => {
    if (selectedMulti.length === 0) return
    const labels = selectedMulti
      .map((val) => step.options.find((o) => o.value === val)?.label ?? val)
      .join(', ')
    onSubmit(selectedMulti, labels)
  }

  return (
    <div className="flex flex-col gap-3 pt-2 animate-in fade-in duration-300">
      <div className="flex flex-wrap gap-2.5">
        {step.options.map((option) => {
          const isSelected = selectedMulti.includes(option.value)
          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              onClick={() => toggleOption(option)}
              className={`flex items-center gap-2 rounded-xl border text-sm font-semibold py-2.5 px-4 transition-all shadow-xs ${
                isSelected
                  ? 'border-[#1F2A44] bg-[#1F2A44] text-[#E8DCC8] font-extrabold ring-2 ring-[#C6A75E]/40 shadow-md'
                  : 'border-[#C6A75E]/35 bg-white text-[#1F2A44] hover:border-[#C6A75E] hover:bg-[#F7F5F0]'
              }`}
            >
              {isSelected && <Check className="h-4 w-4 text-[#C6A75E]" />}
              <span>{option.label}</span>
            </button>
          )
        })}
      </div>

      <div className="flex justify-end pt-1">
        <Button
          disabled={disabled || selectedMulti.length === 0}
          onClick={handleConfirmMulti}
          className="rounded-xl bg-[#1F2A44] hover:bg-[#2C3B5E] text-[#E8DCC8] font-extrabold shadow-lg shadow-[#1F2A44]/20 px-6 py-2.5 transition-all"
        >
          Xác nhận ({selectedMulti.length})
        </Button>
      </div>
    </div>
  )
}

