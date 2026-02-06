/**
 * Pricing Page Template — Customize products, features, and styling.
 * Copy to: src/pages/PricingPage.tsx
 * Customize: `products` array, `features` list, i18n keys.
 */
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { createCheckout } from '@/services/api'
import { getDeviceId } from '@/lib/fingerprint'
import { useToast } from '@/hooks/use-toast'

// ← Customize: define your product tiers
const products = [
  {
    sku: 'pack_3',
    name: '3 Credits',
    price_cents: 799,
    generations: 3,
    discount_percent: null,
    popular: true,
  },
  {
    sku: 'pack_10',
    name: '10 Credits',
    price_cents: 1999,
    generations: 10,
    discount_percent: 33,
    popular: false,
  },
]

// ← Customize: list what's included
const features = [
  'Feature 1 description',
  'Feature 2 description',
  'Feature 3 description',
]

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export default function PricingPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)

  const handlePurchase = async (sku: string) => {
    setLoading(sku)
    try {
      const deviceId = await getDeviceId()
      const response = await createCheckout({
        product_sku: sku,
        device_id: deviceId,
        success_url: `${window.location.origin}/payment/success`,
        cancel_url: `${window.location.origin}/pricing`,
      })
      window.location.href = response.checkout_url
    } catch {
      toast({
        title: 'Payment Error',
        description: 'Failed to create checkout session. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="container py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t('pricing.title')}</h1>
        <p className="text-xl text-muted-foreground">{t('pricing.subtitle')}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {products.map((product) => (
          <Card
            key={product.sku}
            className={`relative ${
              product.popular ? 'border-primary shadow-lg scale-105' : ''
            }`}
          >
            {product.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Popular
                </span>
              </div>
            )}

            <CardHeader className="text-center">
              <CardTitle className="text-xl">{product.name}</CardTitle>
              <CardDescription>
                {product.generations} generations
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  {formatCurrency(product.price_cents)}
                </span>
                {product.discount_percent && (
                  <span className="ml-2 text-sm text-green-600 font-medium">
                    Save {product.discount_percent}%
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {formatCurrency(Math.round(product.price_cents / product.generations))}{' '}
                per generation
              </p>
            </CardHeader>

            <CardContent>
              <Button
                className="w-full mb-6"
                variant={product.popular ? 'default' : 'outline'}
                disabled={loading !== null}
                onClick={() => handlePurchase(product.sku)}
              >
                {loading === product.sku ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Buy Now'
                )}
              </Button>

              <div className="space-y-3">
                <p className="text-sm font-medium">Includes:</p>
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
