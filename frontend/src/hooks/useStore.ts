import { create } from "zustand"

interface AuthStore {
  user: any | null
  token: string | null
  isAuthenticated: boolean
  login: (user: any, token: string) => void
  logout: () => void
  setUser: (user: any) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: (user, token) => {
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    set({ user: null, token: null, isAuthenticated: false })
  },
  setUser: (user) => set({ user }),
}))

interface ItemsStore {
  items: any[]
  currentItem: any | null
  setItems: (items: any[]) => void
  setCurrentItem: (item: any) => void
}

export const useItemsStore = create<ItemsStore>((set) => ({
  items: [],
  currentItem: null,
  setItems: (items) => set({ items }),
  setCurrentItem: (item) => set({ currentItem: item }),
}))

interface MatchesStore {
  matches: any[]
  setMatches: (matches: any[]) => void
}

export const useMatchesStore = create<MatchesStore>((set) => ({
  matches: [],
  setMatches: (matches) => set({ matches }),
}))

export interface ToastMessage {
  id: string
  type: "success" | "error" | "info" | "warning"
  message: string
  title?: string
}

interface ToastStore {
  toasts: ToastMessage[]
  addToast: (toast: Omit<ToastMessage, "id">) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9)
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 4000)
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },
}))

export const showToast = {
  success: (message: string, title?: string) =>
    useToastStore.getState().addToast({ type: "success", message, title }),
  error: (message: string, title?: string) =>
    useToastStore.getState().addToast({ type: "error", message, title }),
  info: (message: string, title?: string) =>
    useToastStore.getState().addToast({ type: "info", message, title }),
  warning: (message: string, title?: string) =>
    useToastStore.getState().addToast({ type: "warning", message, title }),
}

