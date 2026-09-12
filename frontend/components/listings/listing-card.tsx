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
    <Card className="overflow-hidden rounded-2xl border border-[#C6A75E]/30 bg-white text-[#1F2A44] shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
      <div className="relative h-52 w-full bg-[#F7F5F0] overflow-hidden">
        {/* Image */}
        <img
          src={listing.image_url || defaultImage}
          alt={listing.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = defaultImage
          }}
        />
        {/* Match score badge with Gold & Navy theme */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-[#1F2A44] text-[#C6A75E] backdrop-blur-md border border-[#C6A75E]/40 font-extrabold px-3 py-1 shadow-md text-xs">
            <Sparkles className="h-3 w-3 mr-1 animate-pulse text-[#C6A75E]" />
            {listing.match_score}% Phù hợp
          </Badge>
        </div>
        {/* Price tag */}
        <div className="absolute bottom-3 left-3">
          <span className="rounded-xl bg-[#1F2A44]/90 backdrop-blur-md border border-[#C6A75E]/40 px-3.5 py-1.5 text-sm font-extrabold text-[#E8DCC8] shadow-md">
            {listing.price_label}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-1.5 text-xs text-[#A88C48] font-bold mb-1.5">
          <Building2 className="h-3.5 w-3.5 text-[#A88C48]" />
          <span>{listing.subdivision}</span>
        </div>

        <h3 className="text-base font-extrabold text-[#1F2A44] line-clamp-1 mb-3">
          {listing.name}
        </h3>

        {/* Specs bar */}
        <div className="flex items-center justify-between border-y border-[#C6A75E]/20 py-3 mb-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 rounded-lg bg-[#F7F5F0] border border-[#C6A75E]/20 px-2.5 py-1 text-[#1F2A44]">
            <Bed className="h-3.5 w-3.5 text-[#A88C48]" />
            <span>{listing.bedrooms} PN</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-[#F7F5F0] border border-[#C6A75E]/20 px-2.5 py-1 text-[#1F2A44]">
            <Bath className="h-3.5 w-3.5 text-[#A88C48]" />
            <span>{listing.bathrooms} WC</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-[#F7F5F0] border border-[#C6A75E]/20 px-2.5 py-1 text-[#1F2A44]">
            <Maximize2 className="h-3.5 w-3.5 text-[#A88C48]" />
            <span>{listing.area_m2} m²</span>
          </div>
        </div>

        {/* AI Reasons */}
        <div className="flex-1 space-y-2 mb-5">
          <p className="text-[11px] font-bold text-[#A88C48] uppercase tracking-wider flex items-center gap-1">
            <span>✨</span> Lý do AI đề xuất:
          </p>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {listing.reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#A88C48] shrink-0 mt-0.5" />
                <span className="leading-snug">{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTAs */}
        <div className="flex gap-2.5 pt-3 border-t border-[#C6A75E]/20 mt-auto">
          <Button
            onClick={() => alert(`Cảm ơn bạn! Tư vấn viên Vinhomes sẽ liên hệ hỗ trợ căn ${listing.name} ngay.`)}
            className="flex-1 rounded-xl bg-[#1F2A44] hover:bg-[#2C3B5E] text-[#E8DCC8] font-extrabold text-xs py-2.5 shadow-md active:scale-[0.98] transition-all"
          >
            Liên hệ tư vấn
          </Button>
          {listing.detail_url && (
            <Button
              variant="outline"
              onClick={() => window.open(listing.detail_url!, '_blank')}
              className="rounded-xl border-[#1F2A44]/40 text-[#1F2A44] hover:bg-[#F7F5F0] text-xs font-semibold py-2.5"
            >
              Chi tiết
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

