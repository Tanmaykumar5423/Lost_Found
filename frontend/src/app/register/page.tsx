"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authService } from "@/services/api"
import { useAuthStore, showToast } from "@/hooks/useStore"
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
} from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuthStore()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      showToast.error("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      showToast.error("Password must be at least 8 characters")
      return
    }

    setLoading(true)
    try {
      const res = await authService.register(email.trim(), password, fullName.trim())
      login(res.data.user, res.data.access_token)
      showToast.success(`Account created! Welcome to CLFIS, ${res.data.user.full_name}!`)
      router.push("/dashboard")
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        "Registration failed. Make sure to use your verified campus email domain (@college.edu)."
      setError(msg)
      showToast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = () => {
    if (!password) return 0
    let score = 0
    if (password.length >= 8) score += 25
    if (/[A-Z]/.test(password)) score += 25
    if (/[0-9]/.test(password)) score += 25
    if (/[^A-Za-z0-9]/.test(password)) score += 25
    return score
  }

  const strength = getPasswordStrength()

  return (
    <div className="max-w-md mx-auto my-12 animate-fade-in-up">
      <div className="unfold-card p-8 sm:p-9 space-y-6 border border-[#262626]">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="unslate_co--site-logo text-3xl">
            CLFIS<span>.</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Create Campus Account
          </h1>
          <p className="text-xs text-[#888888] font-body">
            Sign up with your university email address to report & claim items
          </p>
        </div>

        {error && (
          <div className="bg-[#e63946]/10 border border-[#e63946]/30 text-[#e63946] text-xs p-3.5 rounded-2xl flex items-center gap-2 font-body">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-sm font-body">
          {/* Full Name */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888] mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:ring-2 focus:ring-[#e63946]"
                placeholder="Alex Morgan"
              />
            </div>
          </div>

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
                className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:ring-2 focus:ring-[#e63946] font-mono"
                placeholder="alex.morgan@college.edu"
              />
            </div>
            <p className="text-[10px] font-mono text-[#666666] mt-1">
              Must end with campus domain (e.g. @college.edu)
            </p>
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
                minLength={8}
                className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white focus:ring-2 focus:ring-[#e63946] font-mono"
                placeholder="Min. 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {password && (
              <div className="mt-2 space-y-1 font-mono">
                <div className="w-full bg-[#1f1f1f] h-1 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      strength <= 25
                        ? "bg-[#e63946] w-1/4"
                        : strength <= 50
                        ? "bg-amber-500 w-2/4"
                        : strength <= 75
                        ? "bg-blue-500 w-3/4"
                        : "bg-emerald-500 w-full"
                    }`}
                  ></div>
                </div>
                <p className="text-[10px] text-[#666666] text-right">
                  {strength <= 25 ? "Weak" : strength <= 50 ? "Fair" : strength <= 75 ? "Good" : "Strong"}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888] mb-1.5">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:ring-2 focus:ring-[#e63946] font-mono"
                placeholder="Repeat password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-unfold-primary w-full !py-3.5 !text-xs flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Creating Campus Profile...</span>
            ) : (
              <>
                <span>Create Account & Start</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#1f1f1f] text-xs text-[#888888] font-body">
          Already have an account?{" "}
          <Link href="/login" className="text-[#e63946] font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
