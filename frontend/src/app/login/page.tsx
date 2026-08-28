"use client"

import React, { useState } from "react"
import { authService } from "@/services/api"
import { useAuthStore, showToast } from "@/hooks/useStore"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Building2,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  AlertCircle
} from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await authService.login(email.trim(), password)
      login(response.data.user, response.data.access_token)
      showToast.success(`Welcome back, ${response.data.user.full_name}!`)
      router.push("/dashboard")
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        "Login failed. Please check your credentials or campus email domain."
      setError(msg)
      showToast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const fillDemoAccount = (demoEmail: string, roleName: string) => {
    setEmail(demoEmail)
    setPassword("password123")
    showToast.info(`Filled credentials for ${roleName}. Click Sign In!`)
  }

  return (
    <div className="max-w-md mx-auto my-8 animate-fade-in-up">
      <div className="bg-white/95 backdrop-blur-md p-8 sm:p-9 rounded-3xl shadow-xl border border-slate-200/80 space-y-6">
        {/* Brand Crest Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Campus SSO Sign In
          </h1>
          <p className="text-xs text-slate-500">
            Sign in with your university account to manage lost & found items
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-sm">
          {/* Email Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Campus Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                placeholder="your.name@college.edu"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-3 rounded-xl transition shadow-lg shadow-blue-500/25 hover:shadow-xl text-xs flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Campus Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Accounts Quick-Fill Panel */}
        <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-2.5 text-xs">
          <p className="font-extrabold text-slate-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>1-Click Demo Profiles (Password: password123):</span>
          </p>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount("student@college.edu", "Alex Morgan (Student)")}
              className="w-full bg-white border border-slate-200 hover:border-blue-300 text-left p-2.5 rounded-xl transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <div>
                  <span className="font-bold text-slate-800 block text-xs">🎓 Student (Alex)</span>
                  <span className="text-[10px] text-slate-400">Lost laptop & keys candidate</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-blue-600 group-hover:underline">Fill</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount("finder@college.edu", "Samantha (Finder)")}
              className="w-full bg-white border border-slate-200 hover:border-emerald-300 text-left p-2.5 rounded-xl transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="font-bold text-slate-800 block text-xs">🔍 Finder (Samantha)</span>
                  <span className="text-[10px] text-slate-400">Reported items & karma earner</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 group-hover:underline">Fill</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount("admin@college.edu", "Security Officer Desk")}
              className="w-full bg-white border border-slate-200 hover:border-amber-300 text-left p-2.5 rounded-xl transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <div>
                  <span className="font-bold text-slate-800 block text-xs">🛡️ Security Officer</span>
                  <span className="text-[10px] text-slate-400">Vault & QR Scanner access</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-amber-600 group-hover:underline">Fill</span>
            </button>
          </div>
        </div>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-600 font-extrabold hover:underline">
            Register with campus email
          </Link>
        </div>
      </div>
    </div>
  )
}
