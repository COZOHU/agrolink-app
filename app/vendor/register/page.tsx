"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Leaf, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useStore } from "@/lib/store"

export default function VendorRegisterPage() {
  const router = useRouter()
  const { registerVendor, isAuthenticated, currentUser } = useStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    farmName: "",
    email: "",
    phone: "",
    location: "",
    description: "",
    specialties: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated || !currentUser) {
      router.push("/auth/signin")
      return
    }
    setLoading(true)
    setError("")
    const result = await registerVendor({
      farmName: form.farmName,
      email: form.email,
      phone: form.phone,
      location: form.location,
      description: form.description,
      specialties: form.specialties.split(",").map(s => s.trim()).filter(Boolean),
    })
    setLoading(false)
    if (result.success) {
      router.push("/vendor/dashboard")
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Leaf className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Become a Vendor</CardTitle>
          <CardDescription>Start selling your farm produce to millions of customers</CardDescription>
        </CardHeader>
        <CardContent>
          {!isAuthenticated && (
            <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
              You need to <Link href="/auth/signin" className="underline font-medium">sign in</Link> or{" "}
              <Link href="/auth/signup" className="underline font-medium">create an account</Link> before registering as a vendor.
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="farmName">Farm / Business Name</Label>
              <Input id="farmName" name="farmName" placeholder="e.g. Green Valley Farm" value={form.farmName} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Business Email</Label>
              <Input id="email" name="email" type="email" placeholder="farm@example.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" placeholder="+234 800 000 0000" value={form.phone} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" placeholder="e.g. Ibadan, Oyo State" value={form.location} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialties">Specialties (comma separated)</Label>
              <Input id="specialties" name="specialties" placeholder="e.g. Vegetables, Fruits, Organic" value={form.specialties} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Business Description</Label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Tell buyers about your farm and products..."
                value={form.description}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading ? "Creating account..." : "Create Vendor Account"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-primary hover:underline font-medium">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
