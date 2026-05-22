"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Heart, ShoppingCart, ArrowLeft, Star, Package,
  MapPin, Shield, Truck, Share2, Plus, Minus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useStore } from "@/lib/store"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { products, vendors, likedProducts, toggleLike, addToCart, isAuthenticated } = useStore()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [addedToCart, setAddedToCart] = useState(false)

  const product = products.find(p => p.id === params.id)
  const vendor = product ? vendors.find(v => v.id === product.vendorId) : null
  const isLiked = product ? likedProducts.includes(product.id) : false

  // Related products — same category, different product
  const relatedProducts = products
    .filter(p => p.category === product?.category && p.id !== product?.id && p.status === "active")
    .slice(0, 4)

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">This product may have been removed or doesn&apos;t exist.</p>
        <Link href="/marketplace">
          <Button>Back to Marketplace</Button>
        </Link>
      </div>
    )
  }

  const handleAddToCart = () => {
    addToCart(product.id, quantity)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2500)
  }

  const handleBuyNow = () => {
    addToCart(product.id, quantity)
    router.push("/cart")
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  const images = product.images.length > 0
    ? product.images
    : ["https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&h=600&fit=crop"]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href="/marketplace" className="hover:text-foreground">Marketplace</Link>
          <span>/</span>
          <Link href={`/marketplace?category=${product.category.toLowerCase()}`} className="hover:text-foreground">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-32">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div className="space-y-3">
            <div className="aspect-square relative rounded-2xl overflow-hidden bg-muted">
              <Image
                src={images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {product.organic && (
                <Badge className="absolute top-4 left-4 bg-green-600 text-white">🌿 Organic</Badge>
              )}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="destructive" className="text-lg px-4 py-2">Out of Stock</Badge>
                </div>
              )}
              <button
                onClick={() => toggleLike(product.id)}
                className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors"
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
              </button>
            </div>
            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`h-16 w-16 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === i ? "border-primary" : "border-transparent"}`}
                  >
                    <Image src={img} alt={`${product.name} ${i + 1}`} width={64} height={64} className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{product.category}</Badge>
                {product.organic && <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Organic</Badge>}
                <Badge variant={product.status === "active" ? "default" : "destructive"}>
                  {product.status === "active" ? "In Stock" : product.status.replace("_", " ")}
                </Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(star => (
                    <Star key={star} className={`h-4 w-4 ${star <= Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                  ))}
                  <span className="text-sm font-medium ml-1">{product.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
                <button onClick={() => toggleLike(product.id)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-500 transition-colors">
                  <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                  {isLiked ? "Liked" : "Like"}
                </button>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">₦{product.price.toLocaleString()}</span>
                <span className="text-muted-foreground">per {product.unit}</span>
              </div>
            </div>

            {/* Stock indicator */}
            <div className="flex items-center gap-2 text-sm">
              <div className={`h-2 w-2 rounded-full ${product.stock > 10 ? "bg-green-500" : product.stock > 0 ? "bg-orange-400" : "bg-red-500"}`} />
              <span className={product.stock === 0 ? "text-red-600" : product.stock < 10 ? "text-orange-600" : "text-green-600"}>
                {product.stock === 0 ? "Out of stock" : product.stock < 10 ? `Only ${product.stock} left` : `${product.stock} in stock`}
              </span>
            </div>

            {/* Quantity selector */}
            {product.stock > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Quantity</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="h-9 w-9 rounded-lg border flex items-center justify-center hover:bg-accent disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="h-9 w-9 rounded-lg border flex items-center justify-center hover:bg-accent disabled:opacity-50"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Total: <span className="font-semibold text-primary">₦{(product.price * quantity).toLocaleString()}</span>
                  </span>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              {product.stock > 0 ? (
                <>
                  <Button
                    onClick={handleAddToCart}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {addedToCart ? "✓ Added!" : "Add to Cart"}
                  </Button>
                  <Button onClick={handleBuyNow} className="flex-1">
                    Buy Now
                  </Button>
                </>
              ) : (
                <Button disabled className="flex-1">Out of Stock</Button>
              )}
              <button
                onClick={handleShare}
                className="h-10 w-10 rounded-lg border flex items-center justify-center hover:bg-accent transition-colors flex-shrink-0"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 py-4 border-y">
              {[
                { icon: Shield, label: "Verified Vendor" },
                { icon: Truck, label: "24-48hr Delivery" },
                { icon: Package, label: "Fresh Produce" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 text-center">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>

            {/* Vendor card */}
            {vendor && (
              <div className="p-4 rounded-xl border bg-card">
                <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Sold by</p>
                <div className="flex items-center gap-3">
                  {vendor.avatar ? (
                    <Image src={vendor.avatar} alt={vendor.farmName} width={44} height={44} className="rounded-full object-cover h-11 w-11" />
                  ) : (
                    <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {vendor.farmName.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{vendor.farmName}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{vendor.location}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">{vendor.rating}</span>
                      <span className="text-xs text-muted-foreground">({vendor.totalReviews} reviews)</span>
                    </div>
                  </div>
                  <Link href={`/vendors/${vendor.id}`}>
                    <Button size="sm" variant="outline">View Store</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-4">Product Description</h2>
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                {[
                  { label: "Category", value: product.category },
                  { label: "Unit", value: product.unit },
                  { label: "Stock", value: `${product.stock} units` },
                  { label: "Type", value: product.organic ? "Organic" : "Conventional" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground mb-1">{label}</p>
                    <p className="font-medium text-sm">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Related Products</h2>
              <Link href={`/marketplace?category=${product.category.toLowerCase()}`} className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map(rel => {
                const relVendor = vendors.find(v => v.id === rel.vendorId)
                const relLiked = likedProducts.includes(rel.id)
                return (
                  <Link key={rel.id} href={`/product/${rel.id}`}>
                    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                      <div className="aspect-square relative overflow-hidden bg-muted">
                        {rel.images[0] ? (
                          <Image src={rel.images[0]} alt={rel.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-10 w-10 text-muted-foreground" />
                          </div>
                        )}
                        <button
                          onClick={e => { e.preventDefault(); toggleLike(rel.id) }}
                          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/80 hover:bg-white flex items-center justify-center"
                        >
                          <Heart className={`h-3.5 w-3.5 ${relLiked ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                        </button>
                      </div>
                      <CardContent className="p-3">
                        <p className="font-medium text-sm truncate group-hover:text-primary">{rel.name}</p>
                        <p className="text-xs text-muted-foreground truncate mb-1">{relVendor?.farmName}</p>
                        <p className="font-bold text-primary text-sm">₦{rel.price.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/{rel.unit}</span></p>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
