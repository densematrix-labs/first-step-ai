import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import LanguageSwitcher from '../components/LanguageSwitcher'

interface Step {
  action: string
  duration: string
  completion_criteria: string
  tip?: string
}

export default function HomePage() {
  const { t, i18n } = useTranslation()
  const [task, setTask] = useState('')
  const [step, setStep] = useState<Step | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const examples = [
    t('app.examples.1'),
    t('app.examples.2'),
    t('app.examples.3'),
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task.trim()) return

    setLoading(true)
    setError(null)
    setStep(null)

    try {
      const response = await fetch('/api/v1/next-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: task.trim(),
          language: i18n.language,
          history: [],
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get next step')
      }

      const data = await response.json()
      setStep(data.step)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleExampleClick = (example: string) => {
    setTask(example)
  }

  const handleReset = () => {
    setTask('')
    setStep(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <header className="px-4 py-4 flex justify-between items-center max-w-4xl mx-auto">
        <Link to="/" className="text-xl font-bold text-emerald-700">
          👣 {t('app.title')}
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/pricing" className="text-surface-600 hover:text-emerald-600 transition">
            {t('common.pricing')}
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-12 max-w-2xl mx-auto">
        {!step ? (
          <div className="animate-fade-in">
            {/* Hero */}
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-bold text-surface-900 mb-4">
                {t('app.tagline')}
              </h1>
              <p className="text-lg text-surface-600 max-w-md mx-auto">
                {t('app.description')}
              </p>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="mb-8">
              <div className="relative">
                <textarea
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder={t('app.placeholder')}
                  className="w-full p-4 pr-4 text-lg border-2 border-surface-200 rounded-2xl focus:border-emerald-500 focus:ring-0 outline-none resize-none transition"
                  rows={3}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !task.trim()}
                className={clsx(
                  'w-full mt-4 py-4 px-6 text-lg font-semibold rounded-xl transition',
                  loading || !task.trim()
                    ? 'bg-surface-200 text-surface-400 cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]'
                )}
              >
                {loading ? t('app.button.loading') : t('app.button.getStep')}
              </button>
            </form>

            {/* Examples */}
            <div className="text-center">
              <p className="text-sm text-surface-500 mb-3">{t('app.examples.title')}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {examples.map((example, i) => (
                  <button
                    key={i}
                    onClick={() => handleExampleClick(example)}
                    className="px-4 py-2 text-sm bg-white border border-surface-200 rounded-full hover:border-emerald-500 hover:text-emerald-600 transition"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-center">
                {error}
              </div>
            )}
          </div>
        ) : (
          /* Step Result */
          <div className="animate-slide-up">
            <div className="bg-white rounded-2xl shadow-lg border border-surface-100 overflow-hidden">
              {/* Step Header */}
              <div className="bg-emerald-600 text-white px-6 py-4">
                <h2 className="text-xl font-semibold">{t('step.title')}</h2>
              </div>

              {/* Step Content */}
              <div className="p-6 space-y-6">
                {/* Action */}
                <div>
                  <p className="text-xl md:text-2xl font-medium text-surface-900 leading-relaxed">
                    {step.action}
                  </p>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-3 text-surface-600">
                  <span className="text-2xl">⏱️</span>
                  <div>
                    <p className="text-sm text-surface-500">{t('step.duration')}</p>
                    <p className="font-medium">{step.duration}</p>
                  </div>
                </div>

                {/* Completion Criteria */}
                <div className="flex items-start gap-3 text-surface-600">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="text-sm text-surface-500">{t('step.howToKnow')}</p>
                    <p className="font-medium">{step.completion_criteria}</p>
                  </div>
                </div>

                {/* Tip */}
                {step.tip && (
                  <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl">
                    <span className="text-2xl">💡</span>
                    <div>
                      <p className="text-sm text-amber-700 font-medium">{t('step.tip')}</p>
                      <p className="text-amber-800">{step.tip}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 px-6 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition"
              >
                {t('app.button.done')}
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-3 px-6 bg-surface-100 text-surface-700 font-semibold rounded-xl hover:bg-surface-200 transition"
              >
                {t('app.button.tryAnother')}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-4 py-8 text-center text-sm text-surface-500">
        {t('footer.poweredBy')} <a href="https://densematrix.ai" className="text-emerald-600 hover:underline">{t('footer.company')}</a>
      </footer>
    </div>
  )
}
