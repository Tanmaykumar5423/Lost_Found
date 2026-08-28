"use client"

import React from "react"
import { useToastStore } from "@/hooks/useStore"
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react"

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success"
        const isError = toast.type === "error"
        const isWarning = toast.type === "warning"

        const bgClass = isSuccess
          ? "bg-emerald-50/95 border-emerald-300 text-emerald-950 shadow-emerald-500/10"
          : isError
          ? "bg-rose-50/95 border-rose-300 text-rose-950 shadow-rose-500/10"
          : isWarning
          ? "bg-amber-50/95 border-amber-300 text-amber-950 shadow-amber-500/10"
          : "bg-blue-50/95 border-blue-300 text-blue-950 shadow-blue-500/10"

        const iconColor = isSuccess
          ? "text-emerald-600"
          : isError
          ? "text-rose-600"
          : isWarning
          ? "text-amber-600"
          : "text-blue-600"

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 animate-fade-in-up ${bgClass}`}
            role="alert"
          >
            <div className={`mt-0.5 flex-shrink-0 ${iconColor}`}>
              {isSuccess && <CheckCircle2 className="w-5 h-5" />}
              {isError && <AlertCircle className="w-5 h-5" />}
              {isWarning && <AlertTriangle className="w-5 h-5" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5" />}
            </div>

            <div className="flex-1 min-w-0">
              {toast.title && (
                <h4 className="text-xs font-bold uppercase tracking-wider mb-0.5">
                  {toast.title}
                </h4>
              )}
              <p className="text-xs font-medium leading-relaxed">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 transition p-0.5 rounded-lg hover:bg-slate-200/50"
              aria-label="Close toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
