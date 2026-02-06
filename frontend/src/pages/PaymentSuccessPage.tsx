import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { getFingerprint } from '../lib/fingerprint'

export default function PaymentSuccessPage() {
  const { t } = useTranslation()
  const [tokens, setTokens] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const deviceId = await getFingerprint()
        const response = await fetch(`/api/v1/tokens/by-device/${deviceId}`)
        if (response.ok) {
          const data = await response.json()
          setTokens(data.remaining_generations || 0)
        }
      } catch (error) {
        console.error('Failed to fetch tokens:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTokens()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center animate-fade-in">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold text-surface-900 mb-4">
          {t('success.title')}
        </h1>
        <p className="text-lg text-surface-600 mb-8">
          {t('success.description')}
        </p>
        
        <div className="bg-white rounded-2xl p-6 border border-surface-200 mb-8 shadow-sm">
          {loading ? (
            <div className="text-surface-400">Loading...</div>
          ) : (
            <>
              <div className="text-4xl font-bold text-emerald-600 mb-2">
                {tokens ?? 0}
              </div>
              <p className="text-surface-500">{t('success.steps')}</p>
            </>
          )}
        </div>

        <Link
          to="/"
          className="inline-block w-full py-4 px-6 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition"
        >
          {t('success.cta')}
        </Link>
      </div>
    </div>
  )
}
