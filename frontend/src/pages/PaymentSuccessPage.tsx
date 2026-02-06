/**
 * Payment Success Page — Shows after Creem checkout redirect.
 * Copy to: src/pages/PaymentSuccessPage.tsx
 * Customize: redirect links, token display format.
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Copy, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTokenStore } from '@/stores/tokenStore'
import { getTokensByDevice } from '@/services/api'
import { getDeviceId } from '@/lib/fingerprint'
import { useToast } from '@/hooks/use-toast'

export default function PaymentSuccessPage() {
  const { toast } = useToast()
  const { addToken, tokens } = useTokenStore()
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTokens() {
      try {
        const deviceId = await getDeviceId()
        const serverTokens = await getTokensByDevice(deviceId)

        for (const serverToken of serverTokens) {
          const exists = tokens.some((t) => t.token === serverToken.token)
          if (!exists) {
            addToken({
              token: serverToken.token,
              remaining_generations: serverToken.remaining_generations,
              expires_at: serverToken.expires_at,
            })
            setToken(serverToken.token)
          }
        }

        if (!token && serverTokens.length > 0) {
          setToken(serverTokens[0].token)
        }
      } catch (error) {
        console.error('Failed to fetch tokens:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTokens()
  }, [addToken, tokens])

  const handleCopy = async () => {
    if (token) {
      await navigator.clipboard.writeText(token)
      toast({ title: 'Copied!', description: 'Token copied to clipboard' })
    }
  }

  const truncate = (t: string, n = 12) =>
    t.length > n * 2 ? `${t.slice(0, n)}...${t.slice(-n)}` : t

  return (
    <div className="container py-20">
      <div className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground mb-8">
          Your credits have been added to your account.
        </p>

        {loading ? (
          <Card className="mb-8">
            <CardContent className="py-6 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Loading your tokens...</span>
            </CardContent>
          </Card>
        ) : token ? (
          <Card className="mb-8">
            <CardContent className="py-6">
              <p className="text-sm text-muted-foreground mb-2">
                Your Token (save for future use)
              </p>
              <div className="flex items-center justify-center gap-2 bg-muted rounded-lg p-3">
                <code className="text-sm font-mono">{truncate(token)}</code>
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Use this token to restore credits on any device
              </p>
            </CardContent>
          </Card>
        ) : null}

        <div className="space-y-3">
          {/* ← Customize: change link destination */}
          <Button asChild size="lg" className="w-full">
            <Link to="/generate">
              Start Using <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link to="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
