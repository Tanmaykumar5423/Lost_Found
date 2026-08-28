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
    <div className="max-w-md mx-auto my-12 animate-fade-in-up">
      <div className="unfold-card p-8 sm:p-9 space-y-6 border border-[#262626]">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="unslate_co--site-logo text-3xl">
            CLFIS<span>.</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Campus SSO Sign In
          </h1>
          <p className="text-xs text-[#888888] font-body">
            Sign in with your university account to manage lost & found items
          </p>
        </div>

        {error && (
          <div className="bg-[#e63946]/10 border border-[#e63946]/30 text-[#e63946] text-xs p-3.5 rounded-2xl flex items-center gap-2 font-body">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-sm">
          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888] mb-1.5">
              Campus Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:ring-2 focus:ring-[#e63946] font-mono"
                placeholder="your.name@college.edu"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888] mb-1.5">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl pl-10 pr-10 py-3 text-xs text-white focus:ring-2 focus:ring-[#e63946] font-mono"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-unfold-primary w-full !py-3.5 !text-xs flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo profiles */}
        <div className="bg-[#0a0a0a] border border-[#222222] p-4 rounded-2xl space-y-2.5 text-xs font-body">
          <p className="font-bold text-[#888888] flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em]">
            <Sparkles className="w-3.5 h-3.5 text-[#e63946]" />
            <span>1-Click Demo Profiles (pass: password123):</span>
          </p>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount("student@college.edu", "Alex Morgan (Student)")}
              className="w-full bg-[#141414] border border-[#262626] hover:border-[#444444] text-left p-2.5 rounded-xl transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-400" />
                <div>
                  <span className="font-bold text-white block text-xs">🎓 Student (Alex)</span>
                  <span className="text-[10px] text-[#666666]">Lost laptop & keys candidate</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-blue-400 group-hover:underline">Fill</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount("finder@college.edu", "Samantha (Finder)")}
              className="w-full bg-[#141414] border border-[#262626] hover:border-[#444444] text-left p-2.5 rounded-xl transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="font-bold text-white block text-xs">🔍 Finder (Samantha)</span>
                  <span className="text-[10px] text-[#666666]">Reported items & karma earner</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 group-hover:underline">Fill</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount("admin@college.edu", "Security Officer Desk")}
              className="w-full bg-[#141414] border border-[#262626] hover:border-[#444444] text-left p-2.5 rounded-xl transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="font-bold text-white block text-xs">🛡️ Security Officer</span>
                  <span className="text-[10px] text-[#666666]">Vault & QR Scanner access</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-amber-400 group-hover:underline">Fill</span>
            </button>
          </div>
        </div>

        <div className="text-center pt-2 border-t border-[#1f1f1f] text-xs text-[#888888] font-body">
          Don't have an account?{" "}
          <Link href="/register" className="text-[#e63946] font-bold hover:underline">
            Register with campus email
          </Link>
        </div>
      </div>
    </div>
  )
}
