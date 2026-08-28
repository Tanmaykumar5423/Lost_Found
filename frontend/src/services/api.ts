import axios from "axios"
import { User, Item, Match, Claim, QRHandshakeResponse, SystemStats } from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Attach bearer token if stored in localStorage
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

export const authService = {
  register: (email: string, password: string, fullName: string) =>
    apiClient.post<{ access_token: string; token_type: string; user: User }>("/auth/register", {
      email,
      password,
      full_name: fullName,
    }),

  login: (email: string, password: string) =>
    apiClient.post<{ access_token: string; token_type: string; user: User }>("/auth/login", {
      email,
      password,
    }),

  getProfile: () => apiClient.get<User>("/auth/me"),
}

export const itemService = {
  reportItem: (formData: FormData) =>
    apiClient.post<Item>("/items/report", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getFeed: (skip = 0, limit = 20, filters?: Record<string, any>) =>
    apiClient.get<Item[]>("/items/feed", {
      params: { skip, limit, ...filters },
    }),

  getItem: (id: number) => apiClient.get<Item>(`/items/${id}`),

  getUserItems: () => apiClient.get<Item[]>("/items/user/items"),
}

export const matchService = {
  findMatches: (lostItemId: number) =>
    apiClient.post<Match[]>(`/matches/find/${lostItemId}`),

  getUserMatches: () => apiClient.get<Match[]>("/matches/user/matches"),

  getMatch: (id: number) => apiClient.get<Match>(`/matches/${id}`),

  getItemMatches: (itemId: number) =>
    apiClient.get<Match[]>(`/matches/item/${itemId}`),
}

export const claimService = {
  createChallenge: (matchId: number, question: string, answer: string) =>
    apiClient.post<Claim>("/claims/challenge/create", {
      match_id: matchId,
      challenge_question: question,
      claimant_answer: answer,
    }),

  respondToChallenge: (claimId: number, answer: string) =>
    apiClient.post<Claim>("/claims/challenge/respond", {
      claim_id: claimId,
      answer,
    }),

  approveChallenge: (claimId: number) =>
    apiClient.post<QRHandshakeResponse>("/claims/challenge/approve", {
      claim_id: claimId,
    }),

  verifyHandshake: (qrToken: string) =>
    apiClient.post<{ status: string; message: string; claim_id: number; resolved_at: string }>(
      "/claims/handshake/verify",
      { qr_token: qrToken }
    ),

  getClaim: (id: number) => apiClient.get<Claim>(`/claims/${id}`),

  getClaimsByMatch: (matchId: number) =>
    apiClient.get<Claim[]>(`/claims/by-match/${matchId}`),
}

export const adminService = {
  getUnclaimedItems: () => apiClient.get<Item[]>("/admin/vault/unclaimed"),

  processVault: (action: "donation" | "auction") =>
    apiClient.post<{ status: string; action: string; processed_count: number; message: string }>(
      "/admin/vault/process",
      { action }
    ),

  getRecentScans: () => apiClient.get<{ total_scans: number; scans: any[] }>("/admin/qr-scans"),

  getSystemStats: () => apiClient.get<SystemStats>("/admin/stats"),
}

export default apiClient
