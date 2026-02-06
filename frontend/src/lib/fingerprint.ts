import FingerprintJS from '@fingerprintjs/fingerprintjs'

let cachedFingerprint: string | null = null

export async function getFingerprint(): Promise<string> {
  if (cachedFingerprint) return cachedFingerprint

  try {
    const fp = await FingerprintJS.load()
    const result = await fp.get()
    cachedFingerprint = result.visitorId
    return cachedFingerprint
  } catch (error) {
    // Fallback to random ID if fingerprinting fails
    cachedFingerprint = 'fp_' + Math.random().toString(36).substring(2, 15)
    return cachedFingerprint
  }
}
