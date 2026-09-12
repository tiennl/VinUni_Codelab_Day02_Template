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
            className="rounded-xl border-slate-200 bg-white hover:border-[#0F2A4A] hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-[#0F2A4A] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan-500 dark:hover:bg-slate-800/80 dark:hover:text-cyan-300 text-sm font-semibold py-2.5 px-4 shadow-sm hover:shadow-md transition-all text-left active:scale-[0.98]"
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
                  ? 'border-[#0F2A4A] bg-gradient-to-r from-[#0F2A4A] to-[#1E3A8A] text-white ring-2 ring-cyan-400/40 shadow-md'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-500/50'
              }`}
            >
              {isSelected && <Check className="h-4 w-4 text-cyan-300" />}
              <span>{option.label}</span>
            </button>
          )
        })}
      </div>

      <div className="flex justify-end pt-1">
        <Button
          disabled={disabled || selectedMulti.length === 0}
          onClick={handleConfirmMulti}
          className="rounded-xl bg-[#0F2A4A] hover:bg-[#16365F] text-white shadow-lg shadow-blue-950/20 font-bold px-6 py-2.5 transition-all"
        >
          Xác nhận ({selectedMulti.length})
        </Button>
      </div>
    </div>
  )
}

