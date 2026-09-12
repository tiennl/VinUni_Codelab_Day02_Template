"use client"

import React from 'react'
import type { Listing } from '../../lib/types'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Building2, Bed, Bath, Maximize2, CheckCircle2, Sparkles } from 'lucide-react'

interface ListingCardProps {
  listing: Listing
}

export function ListingCard({ listing }: ListingCardProps) {
  const defaultImage = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'

  return (
    <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
      <div className="relative h-52 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {/* Image */}
        <img
          src={listing.image_url || defaultImage}
          alt={listing.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = defaultImage
          }}
        />
        {/* Match score badge with vibrant multi-color gradient */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white backdrop-blur-md border-0 font-bold px-3 py-1 shadow-md shadow-emerald-950/20 text-xs">
            <Sparkles className="h-3 w-3 mr-1 animate-pulse text-amber-200" />
            {listing.match_score}% Phù hợp
          </Badge>
        </div>
        {/* Price tag */}
        <div className="absolute bottom-3 left-3">
          <span className="rounded-xl bg-[#0F2A4A]/90 backdrop-blur-md border border-cyan-400/30 px-3.5 py-1.5 text-sm font-extrabold text-white shadow-md">
            {listing.price_label}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-bold mb-1.5">
          <Building2 className="h-3.5 w-3.5 text-pink-500" />
          <span>{listing.subdivision}</span>
        </div>

        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 line-clamp-1 mb-3">
          {listing.name}
        </h3>

        {/* Specs bar with colorful micro-badges */}
        <div className="flex items-center justify-between border-y border-slate-100 dark:border-slate-800/80 py-3 mb-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 text-amber-700 dark:text-amber-300">
            <Bed className="h-3.5 w-3.5 text-amber-500" />
            <span>{listing.bedrooms} PN</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 px-2.5 py-1 text-cyan-700 dark:text-cyan-300">
            <Bath className="h-3.5 w-3.5 text-cyan-500" />
            <span>{listing.bathrooms} WC</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-emerald-700 dark:text-emerald-300">
            <Maximize2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>{listing.area_m2} m²</span>
          </div>
        </div>

        {/* AI Reasons */}
        <div className="flex-1 space-y-2 mb-5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <span className="text-purple-500">✨</span> Lý do AI đề xuất:
          </p>
          <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            {listing.reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTAs */}
        <div className="flex gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-auto">
          <Button
            onClick={() => alert(`Cảm ơn bạn! Tư vấn viên Vinhomes sẽ liên hệ hỗ trợ căn ${listing.name} ngay.`)}
            className="flex-1 rounded-xl bg-[#0F2A4A] hover:bg-[#16365F] text-white font-bold text-xs py-2.5 shadow-md shadow-blue-950/20 active:scale-[0.98] transition-all"
          >
            Liên hệ tư vấn
          </Button>
          {listing.detail_url && (
            <Button
              variant="outline"
              onClick={() => window.open(listing.detail_url!, '_blank')}
              className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Chi tiết
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

