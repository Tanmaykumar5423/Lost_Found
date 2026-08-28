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
  Layers
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
        className="group bg-white rounded-2xl shadow-xs hover:shadow-xl border border-slate-200/80 hover:border-blue-200 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
        onClick={() => setShowDetailModal(true)}
      >
        <div>
          {/* Media Header */}
          <div className="relative bg-slate-100 h-52 w-full overflow-hidden flex items-center justify-center">
            {isSensitiveMasked ? (
              <div className="w-full h-full bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center text-white space-y-2">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center ring-1 ring-amber-400/30">
                  <Lock className="w-5 h-5" />
                </div>
                <p className="font-bold text-xs">ZK Protected High-Value Item</p>
                <p className="text-[11px] text-slate-300">
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
              <div className="flex flex-col items-center justify-center text-slate-400 group-hover:scale-110 transition duration-300">
                <span className="text-4xl mb-1">{categoryIcons[item.category] || "📦"}</span>
                <span className="text-[11px] font-semibold text-slate-400">No Image Uploaded</span>
              </div>
            )}

            {/* Top Bar Badges */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-full shadow-md backdrop-blur-md ${
                  isLost
                    ? "bg-rose-600/90 text-white"
                    : "bg-emerald-600/90 text-white"
                }`}
              >
                {isLost ? "🚨 Lost" : "✨ Found"}
              </span>
            </div>

            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              {isHighValue && (
                <span className="inline-flex items-center gap-1 bg-amber-500/95 backdrop-blur-md text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md ring-1 ring-amber-300">
                  <ShieldCheck className="w-3 h-3 text-slate-950" /> High-Value
                </span>
              )}
            </div>

            {/* Quick View Hover Pill */}
            <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
              <span className="inline-flex items-center gap-1.5 bg-white/90 text-slate-900 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-sm transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
                <Eye className="w-3.5 h-3.5 text-blue-600" /> View Full Details
              </span>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-5 space-y-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 line-clamp-1 group-hover:text-blue-600 transition">
                {item.title}
              </h3>
              <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-lg">
                <Tag className="w-3 h-3 text-blue-500" />
                {categoryLabels[item.category] || item.category}
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-lg">
                <MapPin className="w-3 h-3 text-rose-500" />
                {item.campus_zone}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {formatDate(item.created_at || item.incident_time)}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                #{item.id}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div 
          className="p-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {isLost && (
            <button
              onClick={() => setShowPosterModal(true)}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 hover:border-slate-300 transition shadow-2xs"
              title="Download printable bulletin flyer PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Flyer</span>
            </button>
          )}

          <Link
            href={`/dashboard?item=${item.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30"
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
