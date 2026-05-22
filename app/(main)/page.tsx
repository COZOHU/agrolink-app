"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ShieldCheck, Truck, DollarSign, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useStore, CATEGORIES } from "@/lib/store"

export default function HomePage() {
  const { products, vendors } = useStore()
  
  // Get product counts by category
  const getCategoryProductCount = (categoryId: string) => {
    return products.filter(p => p.category === categoryId).length
  }
  
  // Get latest products (up to 8)
  const latestProducts = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)
  
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-secondary via-background to-accent py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="text-sm">
                Direct from Nigerian Farms
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
                Fresh <span className="text-primary">Farm-to-Table</span> Produce
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                Connect directly with verified Nigerian farmers and producers for the freshest 
                fruits, vegetables, grains, and livestock products.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/marketplace">
                  <Button size="lg" className="gap-2">
                    Shop Now <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/vendor/register">
                  <Button size="lg" variant="outline">
                    Become a Vendor
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80"
                alt="Fresh farm produce"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
        
        {/* Features */}
        <div className="container mx-auto px-4 mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Verified Vendors Only</h3>
                <p className="text-sm text-muted-foreground">All sellers are authenticated</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg bg-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Fast Delivery</h3>
                <p className="text-sm text-muted-foreground">Within 24-48 hours in Lagos</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-lg bg-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Fair Prices</h3>
                <p className="text-sm text-muted-foreground">Direct from producers</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Shop by Category</h2>
            <Link href="/marketplace" className="text-primary hover:underline text-sm font-medium">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CATEGORIES.map((category) => (
              <Link key={category.id} href={`/marketplace?category=${category.id}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 h-full overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-4xl">{category.icon}</span>
                      <Badge variant="secondary">
                        {getCategoryProductCount(category.id)} products
                      </Badge>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {category.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {category.subcategories.slice(0, 4).map((sub) => (
                        <Badge key={sub} variant="outline" className="text-xs">
                          {sub}
                        </Badge>
                      ))}
                      {category.subcategories.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{category.subcategories.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Latest Products Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Latest Products</h2>
            <Link href="/marketplace" className="text-primary hover:underline text-sm font-medium">
              View All
            </Link>
          </div>
          
          {latestProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {latestProducts.map((product) => {
                const vendor = vendors.find(v => v.id === product.vendorId)
                return (
                  <Link key={product.id} href={`/product/${product.id}`}>
                    <Card className="group hover:shadow-lg transition-all duration-300 h-full overflow-hidden">
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
                      </div>
                      <CardContent className="p-3 md:p-4">
                        <h3 className="font-medium text-sm md:text-base truncate group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate mb-2">
                          {vendor?.businessName || "Unknown Vendor"}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-primary font-bold">
                            ₦{product.price.toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            /{product.unit}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No products yet</h3>
              <p className="text-muted-foreground mb-6">
                The marketplace is waiting for vendors to add products. Are you a farmer? 
                Register as a vendor to start selling!
              </p>
              <Link href="/vendor/register">
                <Button>Become a Vendor</Button>
              </Link>
            </Card>
          )}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Are you a farmer or producer?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of Nigerian vendors selling on AgroLink and reach millions of customers
          </p>
          <Link href="/vendor/register">
            <Button size="lg" variant="secondary" className="gap-2">
              Become a Vendor <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
