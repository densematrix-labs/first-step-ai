import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function PaymentSuccessPage() {
  const { t } = useTranslation()

  // TODO: Fetch actual token count from API

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold text-surface-900 mb-4">
          {t('success.title')}
        </h1>
        <p className="text-lg text-surface-600 mb-8">
          {t('success.description')}
        </p>
        
        <div className="bg-white rounded-2xl p-6 border border-surface-200 mb-8">
          <div className="text-4xl font-bold text-emerald-600 mb-2">
            15
          </div>
          <p className="text-surface-500">{t('success.steps')}</p>
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
