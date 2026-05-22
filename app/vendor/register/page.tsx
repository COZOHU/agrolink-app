"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Store, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useStore } from "@/lib/store"

export default function VendorRegisterPage() {
  const router = useRouter()
  const { currentUser, isAuthenticated, registerVendor, getVendorByUserId } = useStore()
  
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    businessName: "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    location: "",
    description: "",
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required"
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    }
    
    if (!formData.location.trim()) {
      newErrors.location = "Location is required"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isAuthenticated || !currentUser) {
      toast.error("Please sign in first")
      router.push("/auth/signup")
      return
    }
    
    if (currentUser.role !== "vendor") {
      toast.error("You need to sign up as a vendor to register")
      router.push("/auth/signup")
      return
    }
    
    const existingVendor = getVendorByUserId(currentUser.id)
    if (existingVendor) {
      toast.error("You are already registered as a vendor")
      router.push("/vendor/dashboard")
      return
    }
    
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      const result = await registerVendor(formData)
      
      if (result.success) {
        toast.success("Vendor registration successful!")
        router.push("/vendor/dashboard")
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }
  
  // If not logged in or not a vendor, show sign-up prompt
  if (!isAuthenticated || !currentUser || currentUser.role !== "vendor") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <Store className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Become a Vendor</CardTitle>
            <CardDescription>
              Start selling your farm produce to millions of customers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              To become a vendor, please create an account and select "Sell Products" during registration.
            </p>
            <div className="flex flex-col gap-2">
              <Link href="/auth/signup">
                <Button className="w-full">Create Vendor Account</Button>
              </Link>
              <Link href="/auth/signin">
                <Button variant="outline" className="w-full">
                  Already have an account? Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Store className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Complete Your Vendor Profile</CardTitle>
          <CardDescription>
            Tell us about your business to start selling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                placeholder="e.g., Green Farm Cooperative"
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
              />
              {errors.businessName && <p className="text-sm text-destructive">{errors.businessName}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Business Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="business@example.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Business Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+234 123 456 7890"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Lagos, Nigeria"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
              {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Business Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Tell customers about your farm and products..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Registration
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
