"use client"

import React, { useEffect, useState } from "react"
import { itemService } from "@/services/api"
import { Item } from "@/types"
import ItemCard from "@/components/ItemCard"
import { CAMPUS_ZONES } from "@/components/LocationPicker"
import Link from "next/link"
import {
  Search,
  Filter,
  X,
  Sparkles,
  AlertCircle,
  Building2,
} from "lucide-react"

const CATEGORIES = [
  { id: "", label: "All Categories" },
  { id: "ELECTRONICS", label: "Electronics" },
  { id: "WALLETS_CARDS", label: "Wallets & Cards" },
  { id: "KEYS", label: "Keys & Chains" },
  { id: "CLOTHING", label: "Clothing" },
  { id: "DOCUMENTS", label: "Documents & IDs" },
  { id: "OTHER", label: "Other" },
]

export default function FeedPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState({
    category: "",
    campus_zone: "",
    type: "",
  })

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true)
        const response = await itemService.getFeed(0, 50, {
          category: filters.category || undefined,
          campus_zone: filters.campus_zone || undefined,
          type: filters.type || undefined,
          search: search.trim() || undefined,
        })
        setItems(response.data)
      } catch (error) {
        console.error("Failed to fetch feed items:", error)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(() => {
      fetchItems()
    }, 200)

    return () => clearTimeout(timer)
  }, [filters, search])

  const clearFilters = () => {
    setSearch("")
    setFilters({ category: "", campus_zone: "", type: "" })
  }

  const hasActiveFilters = search || filters.category || filters.campus_zone || filters.type

  return (
    <div className="space-y-10 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#1f1f1f] pb-6">
        <div>
          <span className="subheading-section">Live Campus Ledger</span>
          <h1 className="heading-section mt-1">Campus Public Feed</h1>
          <p className="text-xs text-[#888888] font-body mt-1">
            Real-time lost & found property reports across academic zones with Zero-Knowledge protection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/report/lost" className="btn-unfold-red !py-2.5 !px-5 !text-[10px]">
            Report Lost
          </Link>
          <Link href="/report/found" className="btn-unfold-outline !py-2.5 !px-5 !text-[10px]">
            Report Found (+25 Karma)
          </Link>
        </div>
      </div>

      {/* Type Toggle Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1f1f1f] pb-3 overflow-x-auto">
        <button
          onClick={() => setFilters({ ...filters, type: "" })}
          className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] rounded-full transition whitespace-nowrap ${
            filters.type === ""
              ? "bg-white text-black font-extrabold"
              : "bg-[#141414] text-[#888888] hover:text-white"
          }`}
        >
          All Listings
        </button>

        <button
          onClick={() => setFilters({ ...filters, type: "LOST" })}
          className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] rounded-full transition whitespace-nowrap ${
            filters.type === "LOST"
              ? "bg-[#e63946] text-white"
              : "bg-[#141414] text-[#888888] hover:text-[#e63946]"
          }`}
        >
          🚨 Lost Items
        </button>

        <button
          onClick={() => setFilters({ ...filters, type: "FOUND" })}
          className={`px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] rounded-full transition whitespace-nowrap ${
            filters.type === "FOUND"
              ? "bg-emerald-600 text-white"
              : "bg-[#141414] text-[#888888] hover:text-emerald-400"
          }`}
        >
          ✨ Found Items
        </button>
      </div>

      {/* Search & Filter Panel */}
      <div className="unfold-card p-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#666666] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items by keywords, brand, color, stickers or location..."
            className="w-full text-xs font-body bg-[#0a0a0a] border border-[#262626] rounded-xl pl-11 pr-10 py-3.5 text-white focus:ring-2 focus:ring-[#e63946] focus:border-transparent font-medium"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#666666] hover:text-white rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          {CATEGORIES.map((cat) => {
            const isSelected = filters.category === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setFilters({ ...filters, category: cat.id })}
                className={`text-[10px] uppercase font-bold tracking-[0.15em] px-3.5 py-1.5 rounded-full transition whitespace-nowrap border ${
                  isSelected
                    ? "bg-white text-black border-white font-extrabold"
                    : "bg-[#0a0a0a] text-[#888888] border-[#222222] hover:text-white hover:border-[#444444]"
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Zone Selector & Result Count */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-[#1a1a1a]">
          <div className="w-full sm:w-72">
            <select
              value={filters.campus_zone}
              onChange={(e) => setFilters({ ...filters, campus_zone: e.target.value })}
              className="w-full border border-[#262626] rounded-xl px-3.5 py-2 bg-[#0a0a0a] text-xs font-body text-[#cccccc] focus:ring-2 focus:ring-[#e63946]"
            >
              <option value="">🏛️ All Campus Zones</option>
              {CAMPUS_ZONES.map((z) => (
                <option key={z.name} value={z.name}>
                  {z.icon} {z.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            <span className="text-xs font-mono text-[#888888]">
              Showing <span className="text-white font-bold">{items.length}</span> listings
            </span>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-bold text-[#e63946] hover:underline flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="unfold-card p-5 space-y-4 animate-pulse"
            >
              <div className="bg-[#191919] h-48 rounded-xl w-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-[#191919] rounded w-3/4"></div>
                <div className="h-3 bg-[#191919] rounded w-full"></div>
                <div className="h-3 bg-[#191919] rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="unfold-card p-14 text-center space-y-4 max-w-lg mx-auto">
          <span className="text-4xl">🔍</span>
          <h3 className="text-xl font-bold text-white">No Listings Found</h3>
          <p className="text-xs text-[#888888] font-body">
            No active reports match your search query or zone filters.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="btn-unfold-outline !py-2.5 !px-5 !text-[10px]"
              >
                Clear Filters
              </button>
            )}
            <Link href="/report/lost" className="btn-unfold-red !py-2.5 !px-5 !text-[10px]">
              Post a Report
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
