import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react'
import { OTPInput, type SlotProps } from 'input-otp'
import { toast } from 'sonner'
import { AuthLayout } from '@/layouts/auth-layout'
import { Button } from '@/components/ui/button'
import { cn, sleep } from '@/lib/utils'

function Slot(props: SlotProps) {
  return (
    <div
      className={cn(
        'flex size-12 items-center justify-center rounded-lg border border-input bg-card text-lg font-semibold text-foreground shadow-sm transition-all',
        props.isActive && 'border-ring ring-2 ring-ring/30',
      )}
    >
      {props.char}
      {props.hasFakeCaret && <div className="h-5 w-px animate-pulse bg-foreground" />}
    </div>
  )
}

export default function OtpVerificationPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [seconds, setSeconds] = useState(45)
  const navigate = useNavigate()
  const location = useLocation()
  const email = (location.state as { email?: string } | null)?.email ?? 'you@school.edu'

  useEffect(() => {
    if (seconds <= 0) return
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  async function handleVerify() {
    if (code.length !== 6) return
    setLoading(true)
    await sleep(700)
    setLoading(false)
    toast.success('Identity verified')
    navigate('/reset-password')
  }

  return (
    <AuthLayout title="Verify your identity" subtitle={`Enter the 6-digit code sent to ${email}`}>
      <div className="flex flex-col items-center gap-6">
        <OTPInput
          maxLength={6}
          value={code}
          onChange={setCode}
          containerClassName="flex items-center gap-2"
          render={({ slots }) => (
            <div className="flex gap-2">
              {slots.map((slot, idx) => (
                <Slot key={idx} {...slot} />
              ))}
            </div>
          )}
        />

        <Button size="lg" className="w-full" disabled={code.length !== 6 || loading} onClick={handleVerify}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
          Verify code
        </Button>

        <p className="text-sm text-muted-foreground">
          {seconds > 0 ? (
            <>Resend code in {seconds}s</>
          ) : (
            <button className="font-medium text-primary hover:underline" onClick={() => setSeconds(45)}>
              Resend code
            </button>
          )}
        </p>
      </div>

      <Link to="/login" className="mt-8 flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Back to sign in
      </Link>
    </AuthLayout>
  )
}
