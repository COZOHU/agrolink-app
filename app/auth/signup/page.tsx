"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useStore } from "@/lib/store"

export default function SignUpPage() {
  const router = useRouter()
  const { signUp, verifyEmail } = useStore()
  const [step, setStep] = useState<"form" | "verify">("form")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [demoCode, setDemoCode] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: "",
    role: "buyer" as "buyer" | "vendor",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) return setError("Passwords do not match")
    if (form.password.length < 6) return setError("Password must be at least 6 characters")
    setLoading(true); setError("")
    const result = await signUp(form)
    setLoading(false)
    if (result.success) { setDemoCode(result.verificationCode || ""); setStep("verify") }
    else setError(result.message)
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError("")
    const result = await verifyEmail(form.email, verificationCode)
    setLoading(false)
    if (result.success) router.push(form.role === "vendor" ? "/vendor/register" : "/marketplace")
    else setError(result.message)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Leaf className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">{step === "form" ? "Create Account" : "Verify Email"}</CardTitle>
          <CardDescription>
            {step === "form" ? "Join AgroLink to start buying or selling" : `Enter the code sent to ${form.email}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
          {step === "form" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>I am a</Label>
                <div className="grid grid-cols-2 gap-3">
                  {(["buyer", "vendor"] as const).map(r => (
                    <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${form.role === r ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}>
                      {r === "buyer" ? "🛒 Buyer" : "🌾 Vendor / Farmer"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" placeholder="John Adeyemi" value={form.name} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" placeholder="+234 800 000 0000" value={form.phone} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              {demoCode && (
                <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-center">
                  <p className="text-sm text-green-700 font-medium">Your Demo Verification Code:</p>
                  <p className="text-3xl font-bold tracking-widest text-green-800 mt-1">{demoCode}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="code">Enter 6-Digit Code</Label>
                <Input id="code" placeholder="123456" maxLength={6} value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value)} required className="text-center text-2xl tracking-widest" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verifying..." : "Verify & Continue"}
              </Button>
              <button type="button" onClick={() => setStep("form")} className="w-full text-sm text-muted-foreground hover:text-foreground">
                ← Back to sign up
              </button>
            </form>
          )}
          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
