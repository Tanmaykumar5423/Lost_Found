"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Item } from "@/types"
import { formatDate } from "@/lib/utils"
import PosterGeneratorModal from "./PosterGenerator"
import ItemDetailModal from "./ItemDetailModal"
import {
  MapPin,
  Calendar,
  Tag,
  ShieldCheck,
  Printer,
  Sparkles,
  Search,
  Eye,
  Lock,
  ArrowRight,
} from "lucide-react"

interface ItemCardProps {
  item: Item
  onClaim?: (item: Item) => void
}

export default function ItemCard({ item }: ItemCardProps) {
  const [showPosterModal, setShowPosterModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const isLost = item.type === "LOST"
  const isHighValue = item.is_high_value
  const hasImages = item.image_urls && item.image_urls.length > 0
  const isSensitiveMasked = isHighValue && (!hasImages || item.image_urls.length === 0)

  const categoryLabels: Record<string, string> = {
    ELECTRONICS: "Electronics",
    WALLETS_CARDS: "Wallets & IDs",
    KEYS: "Keys & Chains",
    CLOTHING: "Clothing",
    DOCUMENTS: "Documents",
    OTHER: "Other",
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
      <div 
        className="unfold-card group overflow-hidden flex flex-col justify-between cursor-pointer border border-[#222222] hover:border-[#444444]"
        onClick={() => setShowDetailModal(true)}
      >
        <div>
          {/* Media Header */}
          <div className="relative bg-[#141414] h-52 w-full overflow-hidden flex items-center justify-center">
            {isSensitiveMasked ? (
              <div className="w-full h-full bg-[#0a0a0a]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center text-white space-y-2">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center ring-1 ring-amber-400/30">
                  <Lock className="w-5 h-5" />
                </div>
                <p className="font-bold text-xs">ZK Protected High-Value Item</p>
                <p className="text-[11px] text-[#888888]">
                  Image hidden for Zero-Knowledge verification
                </p>
              </div>
            ) : hasImages ? (
              <img
                src={item.image_urls[0]}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-[#555555] group-hover:scale-110 transition duration-300">
                <span className="text-4xl mb-1">{categoryIcons[item.category] || "📦"}</span>
                <span className="text-[11px] font-semibold text-[#666666]">No Image Uploaded</span>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] rounded-full shadow-md backdrop-blur-md ${
                  isLost
                    ? "bg-[#e63946] text-white"
                    : "bg-emerald-600 text-white"
                }`}
              >
                {isLost ? "Lost" : "Found"}
              </span>
            </div>

            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              {isHighValue && (
                <span className="inline-flex items-center gap-1 bg-amber-500/90 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md font-mono">
                  <ShieldCheck className="w-3 h-3 text-black" /> High-Value
                </span>
              )}
            </div>

            {/* Quick View Hover Pill */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
              <span className="inline-flex items-center gap-1.5 bg-white text-black text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-xl">
                <Eye className="w-3.5 h-3.5 text-[#e63946]" /> Inspect Details
              </span>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-5 space-y-3">
            <div>
              <h3 className="font-bold text-base text-white line-clamp-1 group-hover:text-[#e63946] transition">
                {item.title}
              </h3>
              <p className="text-xs text-[#888888] font-body line-clamp-2 mt-1 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-2 border-t border-[#1f1f1f] flex flex-wrap gap-2 text-[11px] font-body">
              <span className="inline-flex items-center gap-1 bg-[#161616] text-[#cccccc] px-2.5 py-1 rounded-lg border border-[#262626]">
                <Tag className="w-3 h-3 text-[#e63946]" />
                {categoryLabels[item.category] || item.category}
              </span>
              <span className="inline-flex items-center gap-1 bg-[#161616] text-[#cccccc] px-2.5 py-1 rounded-lg border border-[#262626]">
                <MapPin className="w-3 h-3 text-blue-400" />
                {item.campus_zone}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#666666] pt-1 font-body">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#666666]" />
                {formatDate(item.created_at || item.incident_time)}
              </span>
              <span className="text-[10px] font-mono text-[#555555]">
                #{item.id}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div 
          className="p-3.5 bg-[#0a0a0a] border-t border-[#1a1a1a] flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {isLost && (
            <button
              onClick={() => setShowPosterModal(true)}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-[#cccccc] bg-[#141414] border border-[#262626] rounded-xl hover:bg-[#1f1f1f] hover:text-white transition"
              title="Download bulletin flyer PDF"
            >
              <Printer className="w-3.5 h-3.5 text-[#888888]" />
              <span>Flyer</span>
            </button>
          )}

          <Link
            href={`/dashboard?item=${item.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-[11px] font-bold uppercase tracking-[0.1em] bg-white text-black hover:bg-[#e63946] hover:text-white rounded-xl transition shadow-md"
          >
            <span>{isLost ? "View AI Matches" : "Claim & Verify"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {showPosterModal && (
        <PosterGeneratorModal
          item={item}
          onClose={() => setShowPosterModal(false)}
        />
      )}

      {showDetailModal && (
        <ItemDetailModal
          item={item}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </>
  )
}
