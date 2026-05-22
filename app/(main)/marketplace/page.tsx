"use client"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Heart, ShoppingCart, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useStore, CATEGORIES } from "@/lib/store"

export default function MarketplacePage() {
  const { products, vendors, likedProducts, toggleLike, addToCart } = useStore()
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [sort, setSort] = useState("newest")
  const [addedToCart, setAddedToCart] = useState<string | null>(null)

  const activeProducts = products.filter(p => p.status === "active")
  const filtered = activeProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === "all" || p.category.toLowerCase() === category.toLowerCase()
    return matchSearch && matchCat
  }).sort((a, b) => {
    if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    if (sort === "price_low") return a.price - b.price
    if (sort === "price_high") return b.price - a.price
    return b.rating - a.rating
  })

  const handleAddToCart = (productId: string, e: React.MouseEvent) => {
    e.preventDefault()
    addToCart(productId, 1)
    setAddedToCart(productId)
    setTimeout(() => setAddedToCart(null), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-1">Marketplace</h1>
          <p className="text-muted-foreground">{activeProducts.length} products from verified Nigerian vendors</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="newest">Newest First</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button onClick={() => setCategory("all")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${category === "all" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"}`}>
            All
          </button>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCategory(c.name)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${category === c.name ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"}`}>
              {c.icon} {c.name}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">Try a different search or category</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(product => {
              const vendor = vendors.find(v => v.id === product.vendorId)
              const isLiked = likedProducts.includes(product.id)
              return (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 h-full overflow-hidden">
                    <div className="aspect-square relative overflow-hidden bg-muted">
                      {product.images[0] ? (
                        <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Package className="h-12 w-12 text-muted-foreground" /></div>
                      )}
                      <button onClick={e => { e.preventDefault(); toggleLike(product.id) }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors">
                        <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                      </button>
                      {product.organic && <Badge className="absolute top-2 left-2 text-xs bg-green-600">Organic</Badge>}
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">{product.name}</h3>
                      <p className="text-xs text-muted-foreground truncate mb-2">{vendor?.farmName || "Unknown Vendor"}</p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-primary font-bold text-sm">₦{product.price.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">/{product.unit}</span>
                      </div>
                      <button onClick={e => handleAddToCart(product.id, e)}
                        className={`w-full py-1.5 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1 ${addedToCart === product.id ? "bg-green-500 text-white" : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"}`}>
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
    </div>
  )
}
