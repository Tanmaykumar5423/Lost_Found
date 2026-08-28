"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Item } from "@/types"
import { formatDate } from "@/lib/utils"
import PosterGeneratorModal from "./PosterGenerator"
import { 
  X, 
  MapPin, 
  Calendar, 
  Tag, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Lock, 
  Printer, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface ItemDetailModalProps {
  item: Item | null
  isOpen: boolean
  onClose: () => void
}

export default function ItemDetailModal({ item, isOpen, onClose }: ItemDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [showPoster, setShowPoster] = useState(false)

  if (!isOpen || !item) return null

  const isLost = item.type === "LOST"
  const isHighValue = item.is_high_value
  const hasImages = item.image_urls && item.image_urls.length > 0
  const isMasked = isHighValue && (!hasImages || item.image_urls.length === 0)

  const categoryLabels: Record<string, string> = {
    ELECTRONICS: "Electronics & Gadgets",
    WALLETS_CARDS: "Wallets, Cards & IDs",
    KEYS: "Keys & Keychains",
    CLOTHING: "Clothing & Accessories",
    DOCUMENTS: "Documents & Books",
    OTHER: "Other Valuables",
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div 
          className="bg-[#0d0d0d] text-[#f0f0f0] rounded-3xl max-w-2xl w-full shadow-2xl border border-[#262626] overflow-hidden my-8 animate-fade-in-up flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f1f1f] bg-[#0a0a0a]">
            <div className="flex items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] ${
                  isLost
                    ? "bg-[#e63946] text-white"
                    : "bg-emerald-600 text-white"
                }`}
              >
                {isLost ? "Lost Item" : "Found Item"}
              </span>

              {isHighValue && (
                <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-400 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" /> High-Value
                </span>
              )}

              <span className="text-xs font-mono text-[#666666]">#{item.id}</span>
            </div>

            <button
              onClick={onClose}
              className="text-[#888888] hover:text-white p-1.5 rounded-full hover:bg-[#1a1a1a] transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto p-6 space-y-6 flex-1">
            {/* Image Preview */}
            <div className="relative rounded-2xl overflow-hidden bg-[#141414] aspect-video flex items-center justify-center border border-[#222222] shadow-inner group">
              {isMasked ? (
                <div className="w-full h-full bg-[#080808] text-white flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-base">Zero-Knowledge Protected Item</h4>
                  <p className="text-xs text-[#888888] font-body max-w-md leading-relaxed">
                    Image preview is masked under Zero-Knowledge protocols to prevent fraud. Verified owners can unlock custody via the challenge portal.
                  </p>
                </div>
              ) : hasImages ? (
                <>
                  <img
                    src={item.image_urls[activeImageIndex] || item.image_urls[0]}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {item.image_urls.length > 1 && (
                    <div className="absolute inset-x-3 bottom-3 flex items-center justify-between pointer-events-none">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : item.image_urls.length - 1))
                        }}
                        className="pointer-events-auto p-1.5 rounded-full bg-black/80 hover:bg-black text-white transition"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-[10px] font-mono font-bold bg-black/80 text-white px-2.5 py-0.5 rounded-full">
                        {activeImageIndex + 1} / {item.image_urls.length}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveImageIndex((prev) => (prev < item.image_urls.length - 1 ? prev + 1 : 0))
                        }}
                        className="pointer-events-auto p-1.5 rounded-full bg-black/80 hover:bg-black text-white transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-[#666666] space-y-2">
                  <span className="text-4xl">📦</span>
                  <span className="text-xs font-semibold">No Photo Attached</span>
                </div>
              )}
            </div>

            {/* Title & Metadata */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-white leading-tight">
                  {item.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-body text-[#888888]">
                  <span className="inline-flex items-center gap-1 bg-[#141414] text-[#cccccc] px-2.5 py-1 rounded-lg border border-[#222222]">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    {item.campus_zone}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-[#141414] text-[#cccccc] px-2.5 py-1 rounded-lg border border-[#222222]">
                    <Tag className="w-3.5 h-3.5 text-[#e63946]" />
                    {categoryLabels[item.category] || item.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[#666666]">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(item.incident_time || item.created_at)}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-[#141414] rounded-2xl p-4 border border-[#222222] space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#e63946]" /> Description & Distinct Marks
                </h4>
                <p className="text-xs text-[#cccccc] font-body leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
              </div>

              {/* OCR Tokens */}
              {item.ocr_tokens && item.ocr_tokens.length > 0 && (
                <div className="bg-[#141414] border border-[#222222] rounded-2xl p-4 space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI OCR Text Recognition
                  </h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.ocr_tokens.map((token, i) => (
                      <span
                        key={i}
                        className="bg-[#1f1f1f] border border-[#333333] text-purple-300 text-xs px-2.5 py-0.5 rounded-md font-mono"
                      >
                        {token}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-[#1f1f1f] bg-[#0a0a0a] flex items-center justify-between gap-3">
            {isLost ? (
              <button
                type="button"
                onClick={() => setShowPoster(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-[#cccccc] bg-[#141414] border border-[#262626] rounded-xl hover:bg-[#1f1f1f] hover:text-white transition"
              >
                <Printer className="w-4 h-4 text-[#888888]" />
                Generate Bulletin PDF
              </button>
            ) : (
              <div className="text-xs text-[#888888] flex items-center gap-1 font-body">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Handover earns +25 Karma
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-[#888888] hover:text-white transition"
              >
                Close
              </button>

              <Link
                href={`/dashboard?item=${item.id}`}
                className="btn-unfold-primary !py-2.5 !px-5 !text-[10px]"
                onClick={onClose}
              >
                {isLost ? "View AI Matches" : "Claim & Verify"}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showPoster && (
        <PosterGeneratorModal
          item={item}
          onClose={() => setShowPoster(false)}
        />
      )}
    </>
  )
}
