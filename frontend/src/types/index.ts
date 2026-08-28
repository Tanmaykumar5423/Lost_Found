export type UserRole = "STUDENT" | "STAFF" | "SECURITY_ADMIN"

export interface User {
  id: number
  email: string
  full_name: string
  role: UserRole
  karma_score: number
  created_at: string
}

export type ItemType = "LOST" | "FOUND"

export type ItemCategory = 
  | "ELECTRONICS" 
  | "WALLETS_CARDS" 
  | "KEYS" 
  | "CLOTHING" 
  | "DOCUMENTS" 
  | "OTHER"

export type ItemStatus = 
  | "OPEN" 
  | "MATCH_PENDING" 
  | "HANDOVER_SCHEDULED" 
  | "RESOLVED" 
  | "UNCLAIMED_VAULT"

export interface Item {
  id: number
  user_id?: number
  type: ItemType
  title: string
  description: string
  category: ItemCategory
  campus_zone: string
  incident_time: string
  image_urls: string[]
  ocr_tokens?: string[]
  is_high_value: boolean
  private_details?: string
  status: ItemStatus
  latitude?: number
  longitude?: number
  created_at: string
}

export type MatchStatus = "HIGH_CONFIDENCE" | "POTENTIAL" | "REJECTED" | "VERIFIED"

export interface Match {
  id: number
  lost_item_id: number
  found_item_id: number
  visual_score: number
  text_score: number
  category_score: number
  spatial_decay: number
  temporal_decay: number
  ocr_bonus: number
  total_score: number
  status: MatchStatus
  created_at: string
  lost_item?: Item
  found_item?: Item
}

export interface Claim {
  id: number
  match_id: number
  claimant_id: number
  challenge_question: string
  claimant_answer: string
  is_challenge_approved: boolean
  handshake_qr_token?: string
  handover_by_user_id?: number
  resolved_at?: string
  created_at: string
}

export interface QRHandshakeResponse {
  qr_token: string
  expires_in_minutes: number
  item_id: number
  claim_id: number
}

export interface SystemStats {
  total_items: number
  lost_items: number
  found_items: number
  resolved_items: number
  vault_items: number
  total_matches: number
  high_confidence_matches: number
  resolution_rate: number
}
