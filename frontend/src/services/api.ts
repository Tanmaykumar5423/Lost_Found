import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authService = {
  register: (email: string, password: string, fullName: string) =>
    apiClient.post("/auth/register", { email, password, full_name: fullName }),
  
  login: (email: string, password: string) =>
    apiClient.post("/auth/login", { email, password }),
  
  getProfile: () => apiClient.get("/auth/me"),
}

export const itemService = {
  reportItem: (formData: FormData) =>
    apiClient.post("/items/report", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  
  getFeed: (skip = 0, limit = 20, filters?: any) =>
    apiClient.get("/items/feed", { params: { skip, limit, ...filters } }),
  
  getItem: (id: number) => apiClient.get(`/items/${id}`),
  
  getUserItems: () => apiClient.get("/items/"),
}

export const matchService = {
  findMatches: (lostItemId: number) =>
    apiClient.post(`/matches/find`, { lost_item_id: lostItemId }),
  
  getMatch: (id: number) => apiClient.get(`/matches/${id}`),
  
  getItemMatches: (itemId: number) =>
    apiClient.get(`/matches/item/${itemId}`),
}

export const claimService = {
  createChallenge: (matchId: number, question: string, answer: string) =>
    apiClient.post("/claims/challenge/create", {
      match_id: matchId,
      challenge_question: question,
      claimant_answer: answer,
    }),
  
  respondToChallenge: (claimId: number, answer: string) =>
    apiClient.post("/claims/challenge/respond", { claim_id: claimId, answer }),
  
  approveChallenge: (claimId: number) =>
    apiClient.post("/claims/challenge/approve", { claim_id: claimId }),
  
  verifyHandshake: (qrToken: string, adminUserId: number) =>
    apiClient.post("/claims/handshake/verify", {
      qr_token: qrToken,
      admin_user_id: adminUserId,
    }),
}

export const adminService = {
  getUnclaimedItems: () => apiClient.get("/admin/vault/unclaimed"),
  
  processVault: (action: string) =>
    apiClient.post("/admin/vault/process", { action }),
  
  getSystemStats: () => apiClient.get("/admin/stats"),
}

export default apiClient
