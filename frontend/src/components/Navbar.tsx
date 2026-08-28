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
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Building2,
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
    <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-[#1a1a1a] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Unfold Brand Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="unslate_co--site-logo group">
              CLFIS<span className="text-[#e63946] group-hover:text-white transition">.</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/feed"
              className={`px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition duration-150 rounded-full ${
                isActive("/feed")
                  ? "text-white bg-[#191919] border border-[#333333]"
                  : "text-[#888888] hover:text-white hover:bg-[#141414]"
              }`}
            >
              Browse Feed
            </Link>

            <Link
              href="/report/lost"
              className={`px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition duration-150 rounded-full ${
                isActive("/report/lost")
                  ? "text-[#e63946] bg-[#e63946]/10 border border-[#e63946]/30"
                  : "text-[#888888] hover:text-[#e63946] hover:bg-[#141414]"
              }`}
            >
              Report Lost
            </Link>

            <Link
              href="/report/found"
              className={`px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition duration-150 rounded-full ${
                isActive("/report/found")
                  ? "text-emerald-400 bg-emerald-950/40 border border-emerald-800/40"
                  : "text-[#888888] hover:text-emerald-400 hover:bg-[#141414]"
              }`}
            >
              Report Found
            </Link>

            {isAuthenticated && (
              <Link
                href="/dashboard"
                className={`px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition duration-150 rounded-full ${
                  isActive("/dashboard")
                    ? "text-purple-400 bg-purple-950/40 border border-purple-800/40"
                    : "text-[#888888] hover:text-purple-400 hover:bg-[#141414]"
                }`}
              >
                Dashboard
              </Link>
            )}

            {isAuthenticated && (user?.role === "SECURITY_ADMIN" || user?.role === "STAFF") && (
              <Link
                href="/admin"
                className={`px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition duration-150 rounded-full ${
                  isActive("/admin")
                    ? "text-amber-400 bg-amber-950/40 border border-amber-800/40"
                    : "text-[#888888] hover:text-amber-400 hover:bg-[#141414]"
                }`}
              >
                Security Desk
              </Link>
            )}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {/* Karma Pill */}
                <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-mono font-bold">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>{karma} Karma</span>
                </div>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-[#191919] transition border border-[#262626]"
                    aria-expanded={userDropdownOpen}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#e63946] to-purple-600 text-white font-bold text-xs flex items-center justify-center">
                      {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[#888888] hidden sm:block mr-1" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-[#0d0d0d] rounded-2xl shadow-2xl border border-[#262626] py-2 z-50 animate-fade-in-up text-[#f0f0f0]">
                      <div className="px-4 py-3 border-b border-[#1f1f1f]">
                        <p className="text-xs font-bold text-white leading-tight">
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

                      <div className="py-1 text-xs">
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
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-[#e63946] hover:bg-[#191919] transition"
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
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="text-[#cccccc] hover:text-white px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="btn-unfold-red !py-2.5 !px-5 !text-[10px]"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-[#cccccc] hover:bg-[#191919] transition"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0d0d0d] border-b border-[#262626] px-4 pt-3 pb-6 space-y-2 animate-fade-in-up">
          <Link
            href="/feed"
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider ${
              isActive("/feed") ? "bg-[#191919] text-white" : "text-[#888888]"
            }`}
          >
            <Search className="w-4 h-4 text-[#3b82f6]" />
            <span>Browse Feed</span>
          </Link>

          <Link
            href="/report/lost"
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider ${
              isActive("/report/lost") ? "bg-[#191919] text-[#e63946]" : "text-[#888888]"
            }`}
          >
            <AlertCircle className="w-4 h-4 text-[#e63946]" />
            <span>Report Lost Property</span>
          </Link>

          <Link
            href="/report/found"
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider ${
              isActive("/report/found") ? "bg-[#191919] text-emerald-400" : "text-[#888888]"
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Report Found (+25 Karma)</span>
          </Link>

          {isAuthenticated && (
            <Link
              href="/dashboard"
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider ${
                isActive("/dashboard") ? "bg-[#191919] text-purple-400" : "text-[#888888]"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-purple-400" />
              <span>My Dashboard</span>
            </Link>
          )}

          {isAuthenticated && (user?.role === "SECURITY_ADMIN" || user?.role === "STAFF") && (
            <Link
              href="/admin"
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider ${
                isActive("/admin") ? "bg-[#191919] text-amber-400" : "text-[#888888]"
              }`}
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Security Desk</span>
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
