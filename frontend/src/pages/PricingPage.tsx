import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import LanguageSwitcher from '../components/LanguageSwitcher'

const plans = [
  {
    key: 'free',
    price: '$0',
    highlighted: false,
  },
  {
    key: 'starter',
    price: '$4.99',
    highlighted: false,
  },
  {
    key: 'pro',
    price: '$9.99',
    highlighted: true,
  },
]

export default function PricingPage() {
  const { t } = useTranslation()

  const handlePurchase = (planKey: string) => {
    // TODO: Integrate with Creem checkout
    alert(`Purchasing ${planKey} plan - Creem integration coming soon!`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <header className="px-4 py-4 flex justify-between items-center max-w-4xl mx-auto">
        <Link to="/" className="text-xl font-bold text-emerald-700">
          👣 {t('app.title')}
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-surface-600 hover:text-emerald-600 transition">
            {t('common.home')}
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Pricing Content */}
      <main className="px-4 py-12 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-surface-900 mb-4">
            {t('pricing.title')}
          </h1>
          <p className="text-lg text-surface-600">
            {t('pricing.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={clsx(
                'relative bg-white rounded-2xl p-6 border-2 transition',
                plan.highlighted
                  ? 'border-emerald-500 shadow-lg scale-105'
                  : 'border-surface-200 hover:border-surface-300'
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                    {t(`pricing.${plan.key}.popular`)}
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-surface-900 mb-2">
                  {t(`pricing.${plan.key}.title`)}
                </h3>
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  {t(`pricing.${plan.key}.price`)}
                </div>
                <p className="text-surface-500">
                  {t(`pricing.${plan.key}.description`)}
                </p>
              </div>

              <ul className="space-y-3 mb-6">
                {(t(`pricing.${plan.key}.features`, { returnObjects: true }) as string[]).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-surface-700">
                    <span className="text-emerald-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePurchase(plan.key)}
                className={clsx(
                  'w-full py-3 px-4 font-semibold rounded-xl transition',
                  plan.highlighted
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                )}
              >
                {t(`pricing.${plan.key}.cta`)}
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-8 text-center text-sm text-surface-500">
        {t('footer.poweredBy')} <a href="https://densematrix.ai" className="text-emerald-600 hover:underline">{t('footer.company')}</a>
      </footer>
    </div>
  )
}
