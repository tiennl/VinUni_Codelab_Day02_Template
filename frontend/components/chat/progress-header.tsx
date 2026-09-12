"use client"

import React from 'react'

interface ProgressHeaderProps {
  current: number
  total: number
}

export function ProgressHeader({ current, total }: ProgressHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-blue-900/10 bg-white/85 backdrop-blur-md dark:border-blue-500/15 dark:bg-slate-950/85 px-4 py-3.5 sm:px-6 transition-all">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F2A4A] via-[#1E3A8A] to-[#3B82F6] text-white shadow-lg shadow-blue-900/25 ring-2 ring-cyan-400/30">
            <span className="text-xl">🏠</span>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
            </span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#0F2A4A] dark:text-blue-100 tracking-tight flex items-center gap-1.5">
              <span>Trợ lý BĐS Vinhomes</span>
              <span className="rounded-md bg-gradient-to-r from-amber-500 to-pink-500 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-white shadow-xs">
                AI Pro
              </span>
            </h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
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
                    ? 'w-7 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 shadow-xs shadow-blue-500/40'
                    : 'w-2.5 bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
          <span className="ml-1 text-xs font-bold text-slate-600 dark:text-slate-300">
            {current}/{total}
          </span>
        </div>
      </div>
    </header>
  )
}

