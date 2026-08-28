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
  Eye,
  Layers
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

  const categoryIcons: Record<string, string> = {
    ELECTRONICS: "💻",
    WALLETS_CARDS: "💳",
    KEYS: "🔑",
    CLOTHING: "👕",
    DOCUMENTS: "📄",
    OTHER: "📦",
  }

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div 
          className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8 animate-fade-in-up flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  isLost
                    ? "bg-rose-100 text-rose-700 ring-1 ring-rose-200"
                    : "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                }`}
              >
                {isLost ? "🚨 Lost Item" : "✨ Found Item"}
              </span>

              {isHighValue && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full ring-1 ring-amber-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> High-Value
                </span>
              )}

              <span className="text-xs font-semibold text-slate-400">#{item.id}</span>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-200/60 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Scrollable Content */}
          <div className="overflow-y-auto p-6 space-y-6 flex-1">
            {/* Image Preview / Masked Area */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-video flex items-center justify-center border border-slate-200/80 shadow-inner group">
              {isMasked ? (
                <div className="w-full h-full bg-slate-900/90 text-white flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center ring-1 ring-amber-400/30">
                    <Lock className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-base">Protected High-Value Item</h4>
                  <p className="text-xs text-slate-300 max-w-md leading-relaxed">
                    Image preview is masked under Zero-Knowledge protocols to prevent unauthorized claims. Verified owners can unlock matches via the challenge portal.
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
                        className="pointer-events-auto p-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-sm transition"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-[11px] font-bold bg-slate-900/80 text-white px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                        {activeImageIndex + 1} / {item.image_urls.length}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveImageIndex((prev) => (prev < item.image_urls.length - 1 ? prev + 1 : 0))
                        }}
                        className="pointer-events-auto p-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-sm transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <span className="text-4xl">{categoryIcons[item.category] || "📦"}</span>
                  <span className="text-xs font-semibold">No Reference Photo Uploaded</span>
                </div>
              )}
            </div>

            {/* Title & Metadata Grid */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">
                  {item.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1 font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    {item.campus_zone}
                  </span>
                  <span className="inline-flex items-center gap-1 font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">
                    <Tag className="w-3.5 h-3.5 text-blue-600" />
                    {categoryLabels[item.category] || item.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(item.incident_time || item.created_at)}
                  </span>
                </div>
              </div>

              {/* Description Box */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" /> Description & Details
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
              </div>

              {/* AI Extracted OCR Tokens (if available) */}
              {item.ocr_tokens && item.ocr_tokens.length > 0 && (
                <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> AI OCR Text Recognition
                  </h4>
                  <p className="text-[11px] text-indigo-700">
                    Text extracted automatically from images to assist in multimodal keyword matching:
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.ocr_tokens.map((token, i) => (
                      <span
                        key={i}
                        className="bg-white/80 border border-indigo-200 text-indigo-900 text-xs px-2 py-0.5 rounded-md font-mono"
                      >
                        {token}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Coordinates / Map info */}
              {(item.latitude && item.longitude) && (
                <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200/60">
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" /> PostGIS Geolocation:
                  </span>
                  <span className="font-mono text-slate-600">
                    {item.latitude.toFixed(4)}° N, {item.longitude.toFixed(4)}° E
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
            {isLost ? (
              <button
                type="button"
                onClick={() => setShowPoster(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition shadow-sm"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                Generate Bulletin Flyer PDF
              </button>
            ) : (
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Handover earns +25 Karma
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl transition"
              >
                Close
              </button>

              <Link
                href={`/dashboard?item=${item.id}`}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shadow-md hover:shadow-blue-500/25"
                onClick={onClose}
              >
                {isLost ? "View AI Candidates" : "Claim & Verify"}
                <ExternalLink className="w-3.5 h-3.5" />
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
