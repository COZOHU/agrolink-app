"use client"

import { useState } from "react"
import { Settings, Store, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useStore } from "@/lib/store"

export default function VendorSettingsPage() {
  const { currentUser, getVendorByUserId, vendors } = useStore()
  
  const vendor = currentUser ? getVendorByUserId(currentUser.id) : null
  
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    businessName: vendor?.businessName || "",
    email: vendor?.email || "",
    phone: vendor?.phone || "",
    location: vendor?.location || "",
    description: vendor?.description || "",
  })
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsLoading(true)
    
    // Simulate update
    setTimeout(() => {
      toast.success("Settings updated successfully!")
      setIsLoading(false)
    }, 1000)
  }
  
  if (!vendor) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Store className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Vendor Profile Not Found</h2>
        <p className="text-muted-foreground">
          Please complete your vendor registration first.
        </p>
      </div>
    )
  }
  
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your vendor profile settings
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Business Information</CardTitle>
          <CardDescription>Update your business details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Business Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Business Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Business Description</Label>
              <Textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">Vendor ID</span>
            <span className="font-mono text-sm">{vendor.id.slice(0, 12)}...</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">Member Since</span>
            <span>{new Date(vendor.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Verification Status</span>
            <span className={vendor.verified ? "text-green-600" : "text-yellow-600"}>
              {vendor.verified ? "Verified" : "Pending"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
