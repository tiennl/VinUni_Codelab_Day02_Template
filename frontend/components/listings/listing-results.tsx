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
      {/* Summary box */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-5 border border-[#C6A75E]/35 shadow-md">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#C6A75E]" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#1F2A44] flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-[#A88C48] animate-spin" />
            <span>Kết quả phân tích AI</span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 gap-1.5 text-xs font-semibold text-[#1F2A44] hover:text-[#A88C48] hover:bg-[#F7F5F0]"
          >
            <RotateCcw className="h-3.5 w-3.5 text-[#A88C48]" />
            <span>Tìm lại từ đầu</span>
          </Button>
        </div>
        <p className="text-sm font-medium text-[#1F2A44] leading-relaxed">
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
        <div className="text-center py-12 rounded-2xl bg-white border border-[#C6A75E]/35 shadow-sm">
          <p className="text-sm font-medium text-slate-600 mb-4">
            Chưa tìm thấy bất động sản nào khớp hoàn toàn với tiêu chí của bạn.
          </p>
          <Button onClick={onReset} variant="outline" className="rounded-xl border-[#1F2A44] text-[#1F2A44] hover:bg-[#1F2A44] hover:text-[#E8DCC8] font-bold">
            Nới rộng tiêu chí tìm kiếm
          </Button>
        </div>
      )}
    </div>
  )
}

