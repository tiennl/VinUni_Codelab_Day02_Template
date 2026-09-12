"use client"

import React from 'react'
import type { ResultsResponse } from '../../lib/types'
import { ListingCard } from './listing-card'
import { Button } from '../ui/button'
import { RotateCcw, Sparkles } from 'lucide-react'

interface ListingResultsProps {
  results: ResultsResponse
  onReset: () => void
}

export function ListingResults({ results, onReset }: ListingResultsProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 py-4">
      {/* Colorful Summary box */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F2A4A]/10 via-purple-500/10 to-pink-500/10 dark:from-blue-950/60 dark:via-purple-950/40 dark:to-slate-900 p-5 border border-indigo-200/80 dark:border-indigo-500/30 shadow-md">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-400" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-500 animate-spin" />
            <span>Kết quả phân tích AI</span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-800/60"
          >
            <RotateCcw className="h-3.5 w-3.5 text-cyan-500" />
            <span>Tìm lại từ đầu</span>
          </Button>
        </div>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
          {results.summary}
        </p>
      </div>

      {/* Grid of cards */}
      {results.listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-4">
            Chưa tìm thấy bất động sản nào khớp hoàn toàn với tiêu chí của bạn.
          </p>
          <Button onClick={onReset} variant="outline" className="rounded-xl border-[#0F2A4A] text-[#0F2A4A] dark:text-cyan-400 font-bold">
            Nới rộng tiêu chí tìm kiếm
          </Button>
        </div>
      )}
    </div>
  )
}

