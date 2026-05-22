"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Filter, Grid, List, Heart, ShoppingCart, Star, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useStore } from "@/lib/store"

const categories = [
  "All Categories",
  "Fruits",
  "Vegetables",
  "Grains",
  "Dairy",
  "Meat",
  "Poultry",
  "Fish",
  "Herbs",
  "Spices",
  "Organic",
]

export default function MarketplacePage() {
  const { products, vendors, currentUser, addToCart, toggleLike, likedProducts } = useStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [showOrganic, setShowOrganic] = useState(false)
  const [showInStock, setShowInStock] = useState(false)

  // Get all active products from all vendors
  const allProducts = useMemo(() => {
    return products.filter(p => p.status === "active")
  }, [products])

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    // Price filter
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])

    // Organic filter
    if (showOrganic) {
      filtered = filtered.filter(p => p.organic)
    }

    // In stock filter
    if (showInStock) {
      filtered = filtered.filter(p => p.stock > 0)
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "newest":
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return filtered
  }, [allProducts, searchQuery, selectedCategory, sortBy, priceRange, showOrganic, showInStock])

  const getVendor = (vendorId: string) => vendors.find(v => v.id === vendorId)

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

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={10000}
          step={100}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>NGN {priceRange[0].toLocaleString()}</span>
          <span>NGN {priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">Filters</h3>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="organic"
            checked={showOrganic}
            onCheckedChange={(checked) => setShowOrganic(checked as boolean)}
          />
          <label htmlFor="organic" className="text-sm cursor-pointer">
            Organic Only
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="instock"
            checked={showInStock}
            onCheckedChange={(checked) => setShowInStock(checked as boolean)}
          />
          <label htmlFor="instock" className="text-sm cursor-pointer">
            In Stock Only
          </label>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-primary/10 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Fresh Farm Products Marketplace
          </h1>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover fresh, locally-sourced agricultural products directly from verified farmers and vendors
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for products, categories, or vendors..."
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
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <Card className="p-4 sticky top-4">
              <FilterSidebar />
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <p className="text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filteredProducts.length}</span> products
              </p>

              <div className="flex items-center gap-4">
                {/* Mobile Filter */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterSidebar />
                    </div>
                  </SheetContent>
                </Sheet>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {filteredProducts.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No products found</h3>
                  <p>Try adjusting your search or filter criteria</p>
                </div>
              </Card>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => {
                  const vendor = getVendor(product.vendorId)
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
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {product.description}
                        </p>
                        
                        {vendor && (
                          <Link
                            href={`/vendors/${vendor.id}`}
                            className="flex items-center gap-1 text-xs text-muted-foreground mt-2 hover:text-primary"
                          >
                            <MapPin className="h-3 w-3" />
                            {vendor.farmName}
                          </Link>
                        )}

                        <div className="flex items-center gap-1 mt-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">
                            ({product.reviews} reviews)
                          </span>
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

                        {product.stock === 0 && (
                          <Badge variant="destructive" className="mt-2 w-full justify-center">
                            Out of Stock
                          </Badge>
                        )}
                        {product.stock > 0 && product.stock <= 10 && (
                          <Badge variant="secondary" className="mt-2 w-full justify-center">
                            Only {product.stock} left
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map(product => {
                  const vendor = getVendor(product.vendorId)
                  const isLiked = likedProducts.includes(product.id)
                  
                  return (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="flex flex-col sm:flex-row">
                        <div className="relative w-full sm:w-48 h-48 flex-shrink-0">
                          <Link href={`/products/${product.id}`}>
                            <Image
                              src={product.images[0] || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </Link>
                          {product.organic && (
                            <Badge className="absolute top-2 left-2 bg-green-600">
                              Organic
                            </Badge>
                          )}
                        </div>
                        <CardContent className="flex-1 p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <Link href={`/products/${product.id}`}>
                                <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                                  {product.name}
                                </h3>
                              </Link>
                              <p className="text-muted-foreground mt-1">
                                {product.description}
                              </p>
                              
                              {vendor && (
                                <Link
                                  href={`/vendors/${vendor.id}`}
                                  className="flex items-center gap-1 text-sm text-muted-foreground mt-2 hover:text-primary"
                                >
                                  <MapPin className="h-4 w-4" />
                                  {vendor.farmName} - {vendor.location}
                                </Link>
                              )}

                              <div className="flex items-center gap-1 mt-2">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{product.rating.toFixed(1)}</span>
                                <span className="text-sm text-muted-foreground">
                                  ({product.reviews} reviews)
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-2xl font-bold text-primary">
                                NGN {product.price.toLocaleString()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                per {product.unit}
                              </p>
                              
                              <div className="flex gap-2 mt-4">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleToggleLike(product.id)}
                                >
                                  <Heart
                                    className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
                                  />
                                </Button>
                                <Button
                                  onClick={() => handleAddToCart(product.id)}
                                  disabled={product.stock === 0}
                                >
                                  <ShoppingCart className="h-4 w-4 mr-2" />
                                  Add to Cart
                                </Button>
                              </div>

                              {product.stock === 0 && (
                                <Badge variant="destructive" className="mt-2">
                                  Out of Stock
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
