"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  MapPin, Star, Package, ShoppingCart, Heart,
  ArrowLeft, Shield, Calendar, Phone, Mail
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useStore } from "@/lib/store"

export default function VendorStorePage() {
  const params = useParams()
  const { vendors, products, likedProducts, toggleLike, addToCart } = useStore()
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<"products" | "about">("products")
  const [addedToCart, setAddedToCart] = useState<string | null>(null)

  const vendor = vendors.find(v => v.id === params.id)
  const vendorProducts = products
    .filter(p => p.vendorId === params.id && p.status === "active")
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  const handleAddToCart = (productId: string, e: React.MouseEvent) => {
    e.preventDefault()
    addToCart(productId, 1)
    setAddedToCart(productId)
    setTimeout(() => setAddedToCart(null), 2000)
  }

  if (!vendor) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Vendor Not Found</h2>
        <p className="text-muted-foreground mb-6">
          This vendor may no longer be active on AgroLink.
        </p>
        <Link href="/vendors">
          <Button>Browse All Vendors</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">

      {/* Cover Image */}
      <div className="relative h-48 md:h-64 w-full overflow-hidden bg-muted">
        {vendor.coverImage ? (
          <Image
            src={vendor.coverImage}
            alt={vendor.farmName}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute top-4 left-4">
          <Link href="/vendors">
            <Button size="sm" variant="secondary" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> All Vendors
            </Button>
          </Link>
        </div>
      </div>

      {/* Vendor Header */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-12 mb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            {/* Avatar */}
            <div className="h-24 w-24 rounded-2xl border-4 border-background overflow-hidden bg-card shadow-lg flex-shrink-0">
              {vendor.avatar ? (
                <Image
                  src={vendor.avatar}
                  alt={vendor.farmName}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl">
                  {vendor.farmName.charAt(0)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{vendor.farmName}</h1>
                {vendor.verified && (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1">
                    <Shield className="h-3 w-3" /> Verified
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {vendor.location}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-foreground">{vendor.rating}</span>
                  ({vendor.totalReviews} reviews)
                </span>
                <span className="flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" /> {vendorProducts.length} products
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Since {new Date(vendor.joinedAt).getFullYear()}
                </span>
              </div>
              {vendor.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {vendor.specialties.map(s => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b mb-6">
          {(["products", "about"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "products" ? `Products (${vendorProducts.length})` : "About"}
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="pb-12">
            <div className="relative mb-6 max-w-sm">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {vendorProducts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Package className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {search ? "No products match your search" : "No products yet"}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {search ? "Try a different search term" : "This vendor hasn't added any products yet"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {vendorProducts.map(product => {
                  const isLiked = likedProducts.includes(product.id)
                  return (
                    <Link key={product.id} href={`/product/${product.id}`}>
                      <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                        <div className="aspect-square relative overflow-hidden bg-muted">
                          {product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                          <button
                            onClick={e => { e.preventDefault(); toggleLike(product.id) }}
                            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors"
                          >
                            <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                          </button>
                          {product.organic && (
                            <Badge className="absolute top-2 left-2 text-xs bg-green-600">Organic</Badge>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors mb-1">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium">{product.rating}</span>
                            <span className="text-xs text-muted-foreground">({product.reviews})</span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-primary font-bold text-sm">
                              ₦{product.price.toLocaleString()}
                            </span>
                            <span className="text-xs text-muted-foreground">/{product.unit}</span>
                          </div>
                          <button
                            onClick={e => handleAddToCart(product.id, e)}
                            className={`w-full py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                              addedToCart === product.id
                                ? "bg-green-500 text-white"
                                : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                            }`}
                          >
                            <ShoppingCart className="h-3 w-3" />
                            {addedToCart === product.id ? "Added!" : "Add to Cart"}
                          </button>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* About Tab */}
        {activeTab === "about" && (
          <div className="pb-12 max-w-2xl space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">About {vendor.farmName}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {vendor.description || "No description provided."}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  {[
                    { label: "Location", value: vendor.location, icon: MapPin },
                    { label: "Member Since", value: new Date(vendor.joinedAt).getFullYear().toString(), icon: Calendar },
                    { label: "Total Sales", value: vendor.totalSales.toLocaleString(), icon: ShoppingCart },
                    { label: "Rating", value: `${vendor.rating} / 5.0`, icon: Star },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex items-start gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="text-sm font-medium">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-3">
                <h3 className="font-semibold">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{vendor.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{vendor.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{vendor.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {vendor.specialties.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {vendor.specialties.map(s => (
                      <Badge key={s} variant="secondary">{s}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
