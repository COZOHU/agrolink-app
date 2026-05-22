"use client"

import { use, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  MapPin, 
  Minus, 
  Plus, 
  Share2, 
  Truck, 
  Shield, 
  RotateCcw,
  BadgeCheck,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useStore } from "@/lib/store"
import { notFound } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { products, vendors, currentUser, addToCart, toggleLike, likedProducts } = useStore()
  const { toast } = useToast()
  
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const product = products.find(p => p.id === id)
  const vendor = product ? vendors.find(v => v.id === product.vendorId) : null
  const isLiked = likedProducts.includes(id)

  if (!product) {
    notFound()
  }

  // Related products from same vendor or category
  const relatedProducts = products
    .filter(p => p.id !== id && (p.vendorId === product.vendorId || p.category === product.category) && p.status === "active")
    .slice(0, 4)

  const handleAddToCart = () => {
    if (!currentUser) {
      window.location.href = "/auth/signin"
      return
    }
    addToCart(product.id, quantity)
    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.name} added to your cart`,
    })
  }

  const handleToggleLike = () => {
    if (!currentUser) {
      window.location.href = "/auth/signin"
      return
    }
    toggleLike(product.id)
    toast({
      title: isLiked ? "Removed from wishlist" : "Added to wishlist",
      description: isLiked ? `${product.name} removed from your wishlist` : `${product.name} added to your wishlist`,
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied",
        description: "Product link copied to clipboard",
      })
    }
  }

  const nextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link href="/marketplace" className="hover:text-primary">Marketplace</Link>
          <span>/</span>
          <Link href={`/marketplace?category=${product.category}`} className="hover:text-primary">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
              <Image
                src={product.images[selectedImageIndex] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
              />
              {product.organic && (
                <Badge className="absolute top-4 left-4 bg-green-600">
                  Organic
                </Badge>
              )}
              {product.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === selectedImageIndex ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge variant="secondary" className="mb-2">
                  {product.category}
                </Badge>
                <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleLike}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium">{product.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({product.reviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="mt-6">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">
                  NGN {product.price.toLocaleString()}
                </span>
                <span className="text-muted-foreground">per {product.unit}</span>
              </div>
              {product.stock > 0 ? (
                <Badge variant="outline" className="mt-2 text-green-600 border-green-600">
                  In Stock ({product.stock} available)
                </Badge>
              ) : (
                <Badge variant="destructive" className="mt-2">
                  Out of Stock
                </Badge>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground mt-6">
              {product.description}
            </p>

            {/* Vendor Info */}
            {vendor && (
              <Link href={`/vendors/${vendor.id}`}>
                <Card className="mt-6 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden">
                      <Image
                        src={vendor.avatar || "/placeholder.svg"}
                        alt={vendor.farmName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{vendor.farmName}</span>
                        {vendor.verified && (
                          <BadgeCheck className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {vendor.location}
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 ml-2" />
                        {vendor.rating.toFixed(1)}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Visit Store
                    </Button>
                  </div>
                </Card>
              </Link>
            )}

            {/* Quantity & Add to Cart */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="flex-1"
                  disabled={product.stock === 0}
                  onClick={() => {
                    handleAddToCart()
                    window.location.href = "/cart"
                  }}
                >
                  Buy Now
                </Button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t">
              <div className="text-center">
                <Truck className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Free Delivery</p>
                <p className="text-xs text-muted-foreground">On orders over NGN 10,000</p>
              </div>
              <div className="text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Quality Assured</p>
                <p className="text-xs text-muted-foreground">100% fresh produce</p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Easy Returns</p>
                <p className="text-xs text-muted-foreground">7-day return policy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="details" className="mb-12">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.reviews})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Product Description</h3>
              <p className="text-muted-foreground">
                {product.description}
              </p>
              <Separator className="my-6" />
              <h4 className="font-semibold mb-2">Key Features</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Fresh from the farm</li>
                <li>Carefully selected and quality checked</li>
                {product.organic && <li>100% Organic - No pesticides or chemicals</li>}
                <li>Sustainably grown</li>
                <li>Direct from local farmers</li>
              </ul>
            </Card>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Product Specifications</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Unit</span>
                  <span className="font-medium">{product.unit}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Organic</span>
                  <span className="font-medium">{product.organic ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Stock</span>
                  <span className="font-medium">{product.stock} available</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Vendor</span>
                  <span className="font-medium">{vendor?.farmName}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">{vendor?.location}</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card className="p-6">
              <div className="flex items-center gap-6 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold">{product.rating.toFixed(1)}</div>
                  <div className="flex items-center justify-center my-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Based on {product.reviews} reviews
                  </div>
                </div>
                <Separator orientation="vertical" className="h-24" />
                <div className="flex-1">
                  <p className="text-muted-foreground">
                    Customer reviews will be displayed here. Be the first to review this product!
                  </p>
                  <Button className="mt-4">Write a Review</Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(relProduct => (
                <Card key={relProduct.id} className="group overflow-hidden">
                  <div className="relative aspect-square">
                    <Link href={`/products/${relProduct.id}`}>
                      <Image
                        src={relProduct.images[0] || "/placeholder.svg"}
                        alt={relProduct.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </Link>
                  </div>
                  <CardContent className="p-4">
                    <Link href={`/products/${relProduct.id}`}>
                      <h3 className="font-semibold hover:text-primary transition-colors line-clamp-1">
                        {relProduct.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{relProduct.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-lg font-bold text-primary mt-2">
                      NGN {relProduct.price.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
