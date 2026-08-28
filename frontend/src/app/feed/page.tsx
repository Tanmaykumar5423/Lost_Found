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
  SlidersHorizontal,
  X,
  Grid,
  List,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  Building2,
  RefreshCw,
  PlusCircle,
} from "lucide-react"

const CATEGORIES = [
  { id: "", label: "All Categories", icon: "📦" },
  { id: "ELECTRONICS", label: "Electronics", icon: "💻" },
  { id: "WALLETS_CARDS", label: "Wallets & Cards", icon: "💳" },
  { id: "KEYS", label: "Keys & Chains", icon: "🔑" },
  { id: "CLOTHING", label: "Clothing", icon: "👕" },
  { id: "DOCUMENTS", label: "Documents & IDs", icon: "📄" },
  { id: "OTHER", label: "Other Items", icon: "🏷️" },
]

export default function FeedPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
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
    <div className="space-y-8 animate-fade-in-up">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 mb-2">
            <span>Live Campus Ledger</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Campus Public Feed
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time lost & found property reports across academic zones with Zero-Knowledge protection.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Link
            href="/report/lost"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition shadow-md shadow-rose-500/20"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Report Lost</span>
          </Link>
          <Link
            href="/report/found"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-md shadow-emerald-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Report Found</span>
          </Link>
        </div>
      </div>

      {/* Type Toggle Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setFilters({ ...filters, type: "" })}
          className={`px-4 py-2 text-xs font-extrabold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            filters.type === ""
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <span>All Listings</span>
        </button>

        <button
          onClick={() => setFilters({ ...filters, type: "LOST" })}
          className={`px-4 py-2 text-xs font-extrabold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            filters.type === "LOST"
              ? "bg-rose-600 text-white shadow-xs"
              : "bg-rose-50 text-rose-700 hover:bg-rose-100"
          }`}
        >
          <span>🚨 Lost Items</span>
        </button>

        <button
          onClick={() => setFilters({ ...filters, type: "FOUND" })}
          className={`px-4 py-2 text-xs font-extrabold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            filters.type === "FOUND"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          }`}
        >
          <span>✨ Found Items</span>
        </button>
      </div>

      {/* Rich Search & Filter Panel */}
      <div className="bg-white/90 backdrop-blur-md p-5 sm:p-6 rounded-3xl shadow-xs border border-slate-200/80 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items by keywords, brand, color, stickers or location..."
            className="w-full text-sm font-medium border border-slate-300 rounded-2xl pl-11 pr-10 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-2xs"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Chip Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          {CATEGORIES.map((cat) => {
            const isSelected = filters.category === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setFilters({ ...filters, category: cat.id })}
                className={`text-xs px-3.5 py-2 rounded-xl font-bold transition whitespace-nowrap flex items-center gap-1.5 border ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>

        {/* Zone Filter & View Mode Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <div className="w-full sm:w-72">
            <select
              value={filters.campus_zone}
              onChange={(e) => setFilters({ ...filters, campus_zone: e.target.value })}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
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
            <span className="text-xs font-bold text-slate-500">
              Showing <span className="text-blue-600">{items.length}</span> items
            </span>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Items */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-xs animate-pulse"
            >
              <div className="bg-slate-200 h-48 rounded-xl w-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-full"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
              <div className="h-8 bg-slate-200 rounded-lg w-full"></div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-12 sm:p-16 text-center border border-slate-200/80 space-y-4 max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-2xl font-black">
            🔍
          </div>
          <h3 className="text-xl font-black text-slate-900">No Listings Found</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            No active reports match your current search or zone filters. Try adjusting filters or create a new report.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 text-xs font-bold border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50"
              >
                Clear All Filters
              </button>
            )}
            <Link
              href="/report/lost"
              className="px-4 py-2.5 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20"
            >
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
