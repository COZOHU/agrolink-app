"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, MapPin, Star, Package, BadgeCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStore } from "@/lib/store"

export default function VendorsPage() {
  const { vendors, products } = useStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("rating")

  const activeVendors = useMemo(() => {
    let filtered = vendors.filter(v => v.status === "approved")

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        v =>
          v.farmName.toLowerCase().includes(query) ||
          v.location.toLowerCase().includes(query) ||
          v.description.toLowerCase().includes(query)
      )
    }

    switch (sortBy) {
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "products":
        filtered.sort((a, b) => {
          const aProducts = products.filter(p => p.vendorId === a.id).length
          const bProducts = products.filter(p => p.vendorId === b.id).length
          return bProducts - aProducts
        })
        break
      case "name":
        filtered.sort((a, b) => a.farmName.localeCompare(b.farmName))
        break
    }

    return filtered
  }, [vendors, products, searchQuery, sortBy])

  const getVendorProductCount = (vendorId: string) => {
    return products.filter(p => p.vendorId === vendorId && p.status === "active").length
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-primary/10 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Our Verified Vendors
          </h1>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect directly with trusted farmers and agricultural producers in your region
          </p>
          
          <div className="max-w-2xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search vendors by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Button size="lg" className="h-12">
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">{activeVendors.length}</span> verified vendors
          </p>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="products">Most Products</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Vendors Grid */}
        {activeVendors.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No vendors found</h3>
              <p>Try adjusting your search criteria</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeVendors.map(vendor => {
              const productCount = getVendorProductCount(vendor.id)
              
              return (
                <Card key={vendor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={vendor.coverImage || "/placeholder.svg?height=200&width=400"}
                      alt={vendor.farmName}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-16 w-16 rounded-full border-4 border-white overflow-hidden bg-white">
                          <Image
                            src={vendor.avatar || "/placeholder.svg?height=64&width=64"}
                            alt={vendor.farmName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="text-white">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg">{vendor.farmName}</h3>
                            {vendor.verified && (
                              <BadgeCheck className="h-5 w-5 text-blue-400" />
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-white/80">
                            <MapPin className="h-4 w-4" />
                            {vendor.location}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                      {vendor.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {vendor.specialties.slice(0, 3).map(specialty => (
                        <Badge key={specialty} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                      {vendor.specialties.length > 3 && (
                        <Badge variant="outline">+{vendor.specialties.length - 3}</Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{vendor.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground">
                          ({vendor.totalReviews} reviews)
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Package className="h-4 w-4" />
                        {productCount} products
                      </div>
                    </div>

                    <Link href={`/vendors/${vendor.id}`}>
                      <Button className="w-full mt-4">
                        View Store
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Become a Vendor CTA */}
        <Card className="mt-12 p-8 text-center bg-primary/5 border-primary/20">
          <h2 className="text-2xl font-bold mb-2">Are You a Farmer?</h2>
          <p className="text-muted-foreground mb-4 max-w-xl mx-auto">
            Join our marketplace and connect directly with buyers. Sell your fresh produce, 
            set your own prices, and grow your business.
          </p>
          <Link href="/vendor/register">
            <Button size="lg">
              Become a Vendor
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}
