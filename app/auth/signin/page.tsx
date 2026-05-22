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

export default function SignInPage() {
  const router = useRouter()
  const { signIn } = useStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ email: "", password: "", role: "buyer" as "buyer" | "vendor" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError("")
    const result = await signIn(form.email, form.password, form.role)
    setLoading(false)
    if (result.success) router.push(form.role === "vendor" ? "/vendor/dashboard" : "/marketplace")
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
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your AgroLink account</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Signing in as</Label>
              <div className="grid grid-cols-2 gap-3">
                {(["buyer", "vendor"] as const).map(r => (
                  <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${form.role === r ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}>
                    {r === "buyer" ? "🛒 Buyer" : "🌾 Vendor"}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Your password"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs space-y-1">
              <p className="font-semibold">Demo Vendor Accounts (any password):</p>
              <p>greenvalley@example.com</p>
              <p>sunrise@example.com</p>
              <p>harvestking@example.com</p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-primary hover:underline font-medium">Sign up</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
