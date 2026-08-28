"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore, showToast } from "@/hooks/useStore"
import { authService } from "@/services/api"
import {
  Search,
  AlertCircle,
  Sparkles,
  LayoutDashboard,
  Shield,
  Trophy,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout, setUser } = useAuthStore()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMobileMenuOpen(false)
    setUserDropdownOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token")
      const storedUser = localStorage.getItem("user")
      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser))
          authService.getProfile()
            .then((res) => {
              setUser(res.data)
              localStorage.setItem("user", JSON.stringify(res.data))
            })
            .catch(() => {})
        } catch {}
      }
    }
  }, [setUser])

  const handleLogout = () => {
    logout()
    showToast.info("You have been safely signed out.")
    router.push("/login")
  }

  const isActive = (path: string) => pathname === path
  const karma = user?.karma_score ?? 100

  return (
    <header className="sticky top-0 z-50 w-full bg-black/95 backdrop-blur-md border-b border-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* 1. LEFT: Brand logo (CLFIS.) with proper padding and baseline alignment */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="inline-flex items-baseline group py-1">
              <span className="text-2xl sm:text-3xl font-black tracking-wider text-white font-sans">
                CLFIS
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[#e63946] group-hover:text-white transition-colors">
                .
              </span>
            </Link>
          </div>

          {/* 2. CENTER: Desktop navigation menu links with subtle hover states, proper gap spacing, and clean typography */}
          <nav className="hidden md:flex items-center justify-center gap-6 lg:gap-8 flex-1 px-6">
            <Link
              href="/feed"
              className={`text-sm font-semibold tracking-wide transition-colors duration-150 whitespace-nowrap ${
                isActive("/feed")
                  ? "text-white font-bold border-b-2 border-[#e63946] pb-1"
                  : "text-[#b0b0b0] hover:text-white pb-1"
              }`}
            >
              Browse Feed
            </Link>

            <Link
              href="/report/lost"
              className={`text-sm font-semibold tracking-wide transition-colors duration-150 whitespace-nowrap ${
                isActive("/report/lost")
                  ? "text-[#e63946] font-bold border-b-2 border-[#e63946] pb-1"
                  : "text-[#b0b0b0] hover:text-[#e63946] pb-1"
              }`}
            >
              Report Lost
            </Link>

            <Link
              href="/report/found"
              className={`text-sm font-semibold tracking-wide transition-colors duration-150 whitespace-nowrap ${
                isActive("/report/found")
                  ? "text-emerald-400 font-bold border-b-2 border-emerald-400 pb-1"
                  : "text-[#b0b0b0] hover:text-emerald-400 pb-1"
              }`}
            >
              Report Found
            </Link>

            {isAuthenticated && (
              <Link
                href="/dashboard"
                className={`text-sm font-semibold tracking-wide transition-colors duration-150 whitespace-nowrap ${
                  isActive("/dashboard")
                    ? "text-purple-400 font-bold border-b-2 border-purple-400 pb-1"
                    : "text-[#b0b0b0] hover:text-purple-400 pb-1"
                }`}
              >
                Dashboard
              </Link>
            )}

            {isAuthenticated && (user?.role === "SECURITY_ADMIN" || user?.role === "STAFF") && (
              <Link
                href="/admin"
                className={`text-sm font-semibold tracking-wide transition-colors duration-150 whitespace-nowrap ${
                  isActive("/admin")
                    ? "text-amber-400 font-bold border-b-2 border-amber-400 pb-1"
                    : "text-[#b0b0b0] hover:text-amber-400 pb-1"
                }`}
              >
                Security Desk
              </Link>
            )}
          </nav>

          {/* 3. RIGHT: Auth actions (Sign In link, and a styled button for REGISTER) */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6 flex-shrink-0">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-mono font-bold whitespace-nowrap">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>{karma} pts</span>
                </div>

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-[#191919] transition border border-[#2e2e2e]"
                    aria-expanded={userDropdownOpen}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#e63946] to-purple-600 text-white font-bold text-xs flex items-center justify-center">
                      {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[#888888] mr-1" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-[#0d0d0d] rounded-2xl shadow-2xl border border-[#2a2a2a] py-2 z-50 animate-fade-in-up text-[#f0f0f0]">
                      <div className="px-4 py-3 border-b border-[#1f1f1f]">
                        <p className="text-xs font-bold text-white leading-tight truncate">
                          {user.full_name}
                        </p>
                        <p className="text-[11px] text-[#888888] truncate mt-0.5 font-mono">{user.email}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold bg-[#1f1f1f] text-white px-2 py-0.5 rounded-md">
                            {user.role}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800/40">
                            ⭐ {karma} pts
                          </span>
                        </div>
                      </div>

                      <div className="py-1 text-xs font-body">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 px-4 py-2.5 text-[#cccccc] hover:bg-[#191919] hover:text-white transition"
                        >
                          <LayoutDashboard className="w-4 h-4 text-[#888888]" />
                          My Dashboard & AI Matches
                        </Link>
                        <Link
                          href="/report/lost"
                          className="flex items-center gap-2 px-4 py-2.5 text-[#cccccc] hover:bg-[#191919] hover:text-[#e63946] transition"
                        >
                          <AlertCircle className="w-4 h-4 text-[#e63946]" />
                          Report Lost Item
                        </Link>
                        <Link
                          href="/report/found"
                          className="flex items-center gap-2 px-4 py-2.5 text-[#cccccc] hover:bg-[#191919] hover:text-emerald-400 transition"
                        >
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                          Report Found Item (+25 Karma)
                        </Link>
                        {(user.role === "SECURITY_ADMIN" || user.role === "STAFF") && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2 px-4 py-2.5 text-amber-400 hover:bg-[#191919] transition"
                          >
                            <Shield className="w-4 h-4" />
                            Security Desk Console
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-[#1f1f1f]">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-[#e63946] hover:bg-[#191919] transition font-body"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 lg:gap-6">
                <Link
                  href="/login"
                  className="text-sm font-semibold tracking-wide text-[#b0b0b0] hover:text-white whitespace-nowrap transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-[#e63946] hover:bg-[#d62828] text-white px-5 py-2 text-xs font-black uppercase tracking-[0.15em] rounded-full whitespace-nowrap transition shadow-lg shadow-[#e63946]/30 transform hover:-translate-y-0.5"
                >
                  REGISTER
                </Link>
              </div>
            )}
          </div>

          {/* 4. MOBILE: Hamburger button (hidden on md+, cleanly aligned to far right on mobile) */}
          <div className="md:hidden flex items-center flex-shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-white hover:bg-[#191919] transition border border-[#2a2a2a] focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer (Only shown when open on viewports < md) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0d0d0d] border-b border-[#262626] px-4 pt-3 pb-6 space-y-2 animate-fade-in-up">
          <Link
            href="/feed"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
              isActive("/feed") ? "bg-[#191919] text-white" : "text-[#d1d5db] hover:text-white hover:bg-[#141414]"
            }`}
          >
            <Search className="w-4 h-4 text-[#3b82f6]" />
            <span>Browse Feed</span>
          </Link>

          <Link
            href="/report/lost"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
              isActive("/report/lost") ? "bg-[#191919] text-[#e63946]" : "text-[#d1d5db] hover:text-[#e63946] hover:bg-[#141414]"
            }`}
          >
            <AlertCircle className="w-4 h-4 text-[#e63946]" />
            <span>Report Lost Property</span>
          </Link>

          <Link
            href="/report/found"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
              isActive("/report/found") ? "bg-[#191919] text-emerald-400" : "text-[#d1d5db] hover:text-emerald-400 hover:bg-[#141414]"
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Report Found (+25 Karma)</span>
          </Link>

          {isAuthenticated && (
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
                isActive("/dashboard") ? "bg-[#191919] text-purple-400" : "text-[#d1d5db] hover:text-purple-400 hover:bg-[#141414]"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-purple-400" />
              <span>My Dashboard</span>
            </Link>
          )}

          {isAuthenticated && (user?.role === "SECURITY_ADMIN" || user?.role === "STAFF") && (
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
                isActive("/admin") ? "bg-[#191919] text-amber-400" : "text-[#d1d5db] hover:text-amber-400 hover:bg-[#141414]"
              }`}
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Security Desk Console</span>
            </Link>
          )}

          {!isAuthenticated && (
            <div className="pt-3 border-t border-[#1f1f1f] flex flex-col gap-2.5">
              <Link
                href="/login"
                className="w-full text-center py-2.5 text-sm font-semibold text-[#d1d5db] hover:text-white rounded-xl bg-[#141414] border border-[#222222]"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="w-full text-center py-2.5 text-xs font-black uppercase tracking-wider text-white rounded-xl bg-[#e63946]"
              >
                REGISTER
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
