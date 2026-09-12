"use client"

import React from 'react'

interface ProgressHeaderProps {
  current: number
  total: number
}

export function ProgressHeader({ current, total }: ProgressHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-[#C6A75E]/20 bg-white/90 backdrop-blur-md px-4 py-3.5 sm:px-6 transition-all">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1F2A44] to-[#121A2C] border border-[#C6A75E]/40 text-[#C6A75E] shadow-md ring-1 ring-[#C6A75E]/30">
            <span className="text-xl">🏠</span>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C6A75E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#C6A75E]"></span>
            </span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#1F2A44] tracking-tight flex items-center gap-1.5">
              <span>Trợ lý BĐS Vinhomes</span>
              <span className="rounded-md bg-[#1F2A44] text-[#C6A75E] px-1.5 py-0.5 text-[10px] font-extrabold uppercase shadow-xs">
                AI Pro
              </span>
            </h1>
            <p className="text-xs font-medium text-slate-500">
              Tư vấn Ocean Park 1, 2, 3
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  i < current
                    ? 'w-7 bg-[#C6A75E] shadow-xs shadow-[#C6A75E]/40'
                    : 'w-2.5 bg-[#E5E0D8]'
                }`}
              />
            ))}
          </div>
          <span className="ml-1 text-xs font-bold text-[#1F2A44]">
            {current}/{total}
          </span>
        </div>
      </div>
    </header>
  )
}

