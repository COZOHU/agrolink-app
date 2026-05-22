"use client"

import { use, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Star, Phone, Mail, Calendar, BadgeCheck, ShoppingCart, Heart, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStore } from "@/lib/store"
import { notFound } from "next/navigation"

export default function VendorStorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { vendors, products, currentUser, addToCart, toggleLike, likedProducts } = useStore()

  const vendor = vendors.find(v => v.id === id)

  const vendorProducts = useMemo(() => {
    return products.filter(p => p.vendorId === id && p.status === "active")
  }, [products, id])

  if (!vendor) {
    notFound()
  }

  const handleAddToCart = (productId: string) => {
    if (!currentUser) {
      window.location.href = "/auth/signin"
      return
    }
    addToCart(productId, 1)
  }

  const handleToggleLike = (productId: string) => {
    if (!currentUser) {
      window.location.href = "/auth/signin"
      return
    }
    toggleLike(productId)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Image */}
      <div className="relative h-64 md:h-80">
        <Image
          src={vendor.coverImage || "/placeholder.svg?height=320&width=1200"}
          alt={vendor.farmName}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      </div>

      {/* Vendor Info */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-20 mb-8">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative h-32 w-32 rounded-full border-4 border-background overflow-hidden bg-background mx-auto md:mx-0 -mt-20 md:-mt-24">
                <Image
                  src={vendor.avatar || "/placeholder.svg?height=128&width=128"}
                  alt={vendor.farmName}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold">{vendor.farmName}</h1>
                  {vendor.verified && (
                    <BadgeCheck className="h-6 w-6 text-blue-500" />
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {vendor.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-foreground">{vendor.rating.toFixed(1)}</span>
                    ({vendor.totalReviews} reviews)
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    {vendorProducts.length} products
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Since {new Date(vendor.joinedAt).getFullYear()}
                  </div>
                </div>

                <p className="text-muted-foreground max-w-2xl">
                  {vendor.description}
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {vendor.specialties.map(specialty => (
                    <Badge key={specialty} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 items-center md:items-end">
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Products */}
        <Tabs defaultValue="products" className="mb-12">
          <TabsList>
            <TabsTrigger value="products">Products ({vendorProducts.length})</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({vendor.totalReviews})</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            {vendorProducts.length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                <p className="text-muted-foreground">This vendor hasn&apos;t added any products yet.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {vendorProducts.map(product => {
                  const isLiked = likedProducts.includes(product.id)
                  
                  return (
                    <Card key={product.id} className="group overflow-hidden">
                      <div className="relative aspect-square">
                        <Link href={`/products/${product.id}`}>
                          <Image
                            src={product.images[0] || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        </Link>
                        {product.organic && (
                          <Badge className="absolute top-2 left-2 bg-green-600">
                            Organic
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                          onClick={() => handleToggleLike(product.id)}
                        >
                          <Heart
                            className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
                          />
                        </Button>
                      </div>
                      <CardContent className="p-4">
                        <Link href={`/products/${product.id}`}>
                          <h3 className="font-semibold hover:text-primary transition-colors line-clamp-1">
                            {product.name}
                          </h3>
                        </Link>
                        
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div>
                            <p className="text-lg font-bold text-primary">
                              NGN {product.price.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              per {product.unit}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(product.id)}
                            disabled={product.stock === 0}
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">About {vendor.farmName}</h3>
              <p className="text-muted-foreground mb-6">
                {vendor.description}
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {vendor.specialties.map(specialty => (
                      <Badge key={specialty} variant="outline">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Farm Details</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {vendor.location}
                    </li>
                    <li className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Member since {new Date(vendor.joinedAt).toLocaleDateString()}
                    </li>
                    <li className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      {vendor.totalSales} total sales
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold">{vendor.rating.toFixed(1)}</div>
                  <div className="flex items-center justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(vendor.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {vendor.totalReviews} reviews
                  </div>
                </div>
              </div>
              
              <p className="text-center text-muted-foreground">
                Reviews will be displayed here.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
