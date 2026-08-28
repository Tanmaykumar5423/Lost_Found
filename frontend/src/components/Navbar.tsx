"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore, showToast } from "@/hooks/useStore"
import { authService } from "@/services/api"
import {
  Compass,
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
  PlusCircle,
  ChevronDown,
  Building2,
  Lock,
  Award,
} from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout, setUser } = useAuthStore()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Close dropdowns on route change
    setMobileMenuOpen(false)
    setUserDropdownOpen(false)
  }, [pathname])

  useEffect(() => {
    // Close user dropdown on outside click
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    // Re-sync user info and karma score on mount if logged in
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
  const karmaTier =
    karma >= 200
      ? { title: "Campus Custodian", color: "from-amber-400 to-yellow-600", text: "text-amber-700", bg: "bg-amber-50 border-amber-200" }
      : karma >= 150
      ? { title: "Campus Hero", color: "from-purple-400 to-indigo-600", text: "text-purple-700", bg: "bg-purple-50 border-purple-200" }
      : karma >= 100
      ? { title: "Good Samaritan", color: "from-emerald-400 to-teal-600", text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" }
      : { title: "New Guardian", color: "from-blue-400 to-cyan-600", text: "text-blue-700", bg: "bg-blue-50 border-blue-200" }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition duration-200">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 bg-clip-text text-transparent tracking-tight leading-none">
                    CLFIS
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                    AI
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline-block leading-tight">
                  Campus Lost & Found
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/feed"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition duration-150 ${
                isActive("/feed")
                  ? "bg-blue-50 text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Search className="w-4 h-4 text-blue-500" />
              <span>Browse Feed</span>
            </Link>

            <Link
              href="/report/lost"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition duration-150 ${
                isActive("/report/lost")
                  ? "bg-rose-50 text-rose-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>Report Lost</span>
            </Link>

            <Link
              href="/report/found"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition duration-150 ${
                isActive("/report/found")
                  ? "bg-emerald-50 text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Report Found</span>
            </Link>

            {isAuthenticated && (
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition duration-150 ${
                  isActive("/dashboard")
                    ? "bg-purple-50 text-purple-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-purple-500" />
                <span>Dashboard</span>
              </Link>
            )}

            {isAuthenticated && (user?.role === "SECURITY_ADMIN" || user?.role === "STAFF") && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition duration-150 ${
                  isActive("/admin")
                    ? "bg-amber-50 text-amber-900 shadow-xs"
                    : "text-amber-800 hover:bg-amber-50/80"
                }`}
              >
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Security Desk</span>
              </Link>
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {/* Karma badge */}
                <div
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-extrabold shadow-2xs ${karmaTier.bg} ${karmaTier.text}`}
                  title={`${karma} Karma Points (${karmaTier.title})`}
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>{karma} pts</span>
                  <span className="hidden lg:inline text-[10px] font-semibold text-slate-500 ml-1">
                    • {karmaTier.title}
                  </span>
                </div>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition border border-slate-200"
                    aria-expanded={userDropdownOpen}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block mr-1" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in-up">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900 leading-tight">
                          {user.full_name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                            {user.role}
                          </span>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                            ⭐ {karma} Karma
                          </span>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400" />
                          My Dashboard & AI Matches
                        </Link>
                        <Link
                          href="/report/lost"
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                        >
                          <AlertCircle className="w-4 h-4 text-rose-500" />
                          Report Lost Item
                        </Link>
                        <Link
                          href="/report/found"
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                        >
                          <Sparkles className="w-4 h-4 text-emerald-500" />
                          Report Found Item (+25 pts)
                        </Link>
                        {(user.role === "SECURITY_ADMIN" || user.role === "STAFF") && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-amber-900 bg-amber-50/60 hover:bg-amber-100/60 transition"
                          >
                            <Shield className="w-4 h-4 text-amber-600" />
                            Security Desk Console
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
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
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-slate-700 hover:text-blue-600 px-3 py-2 text-xs font-bold transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Join CLFIS</span>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 animate-fade-in-up">
          <Link
            href="/feed"
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold ${
              isActive("/feed") ? "bg-blue-50 text-blue-700" : "text-slate-700"
            }`}
          >
            <Search className="w-4 h-4 text-blue-600" />
            <span>Browse Public Feed</span>
          </Link>

          <Link
            href="/report/lost"
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold ${
              isActive("/report/lost") ? "bg-rose-50 text-rose-700" : "text-slate-700"
            }`}
          >
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>Report Lost Item</span>
          </Link>

          <Link
            href="/report/found"
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold ${
              isActive("/report/found") ? "bg-emerald-50 text-emerald-700" : "text-slate-700"
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Report Found Item (+25 Karma)</span>
          </Link>

          {isAuthenticated && (
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold ${
                isActive("/dashboard") ? "bg-purple-50 text-purple-700" : "text-slate-700"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-purple-600" />
              <span>My Dashboard</span>
            </Link>
          )}

          {isAuthenticated && (user?.role === "SECURITY_ADMIN" || user?.role === "STAFF") && (
            <Link
              href="/admin"
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold ${
                isActive("/admin") ? "bg-amber-50 text-amber-900" : "text-amber-800"
              }`}
            >
              <Shield className="w-4 h-4 text-amber-600" />
              <span>Security Desk</span>
            </Link>
          )}

          {isAuthenticated && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-700">
                  {karma} Karma Points ({karmaTier.title})
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs font-bold text-rose-600 hover:underline"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
