/**
 * Payment API functions — Merge into src/services/api.ts
 */

// ==================== Types ====================

interface Product {
  sku: string
  name: string
  price_cents: number
  generations: number
  discount_percent: number | null
}

interface CreateCheckoutRequest {
  product_sku: string
  device_id: string
  optional_email?: string
  success_url: string
  cancel_url: string
}

interface CreateCheckoutResponse {
  checkout_url: string
  session_id: string
}

interface TokenInfo {
  token: string
  remaining_generations: number
  total_generations: number
  expires_at: string
  product_sku: string
}

// ==================== Payment API ====================

export async function getProducts(): Promise<Product[]> {
  const response = await api.get<Product[]>('/payment/products')
  return response.data
}

export async function createCheckout(
  request: CreateCheckoutRequest
): Promise<CreateCheckoutResponse> {
  const response = await api.post<CreateCheckoutResponse>(
    '/payment/create-checkout',
    request
  )
  return response.data
}

// ==================== Tokens API ====================

export async function getTokenInfo(token: string): Promise<TokenInfo> {
  const response = await api.get<TokenInfo>(`/tokens/info/${token}`)
  return response.data
}

export async function validateToken(token: string): Promise<boolean> {
  try {
    const response = await api.post<{ valid: boolean }>('/tokens/validate', { token })
    return response.data.valid
  } catch {
    return false
  }
}

export async function getTokensByDevice(deviceId: string): Promise<TokenInfo[]> {
  try {
    const response = await api.get<{ tokens: TokenInfo[] }>(
      `/tokens/by-device/${deviceId}`
    )
    return response.data.tokens
  } catch {
    return []
  }
}
