"use client"

import Link from "next/link"
import { Package, ShoppingBag, TrendingUp, Star, PlusCircle, ArrowRight, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store"

export default function VendorDashboardPage() {
  const { currentUser, vendors, products, orders } = useStore()

  const vendor = vendors.find(v => v.userId === currentUser?.id)
  const vendorProducts = products.filter(p => p.vendorId === vendor?.id)
  const vendorOrders = orders.filter(o =>
    o.items.some(item => vendorProducts.find(p => p.id === item.productId))
  )

  const totalRevenue = vendorOrders
    .filter(o => o.status !== "cancelled")
    .reduce((sum, o) => {
      const vendorItemsTotal = o.items
        .filter(item => vendorProducts.find(p => p.id === item.productId))
        .reduce((s, item) => s + item.price * item.quantity, 0)
      return sum + vendorItemsTotal
    }, 0)

  const lowStockProducts = vendorProducts.filter(p => p.stock < 10 && p.stock > 0)
  const outOfStockProducts = vendorProducts.filter(p => p.stock === 0)

  const stats = [
    { title: "Total Products", value: vendorProducts.length, icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
    { title: "Total Orders", value: vendorOrders.length, icon: ShoppingBag, color: "text-green-500", bg: "bg-green-50" },
    { title: "Total Revenue", value: `₦${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50" },
    { title: "Avg Rating", value: vendor?.rating ? vendor.rating.toFixed(1) : "N/A", icon: Star, color: "text-yellow-500", bg: "bg-yellow-50" },
  ]

  if (!vendor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <Package className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Vendor Profile Found</h2>
        <p className="text-muted-foreground mb-6">You need to register as a vendor to access this dashboard.</p>
        <Link href="/vendor/register">
          <Button>Register as Vendor</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {vendor.farmName}</h1>
          <p className="text-muted-foreground text-sm">{vendor.location} · {vendor.status === "approved" ? "✅ Verified Vendor" : "⏳ Pending Approval"}</p>
        </div>
        <Link href="/vendor/products/add">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.bg}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Alerts */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-700 font-medium mb-2">
              <AlertCircle className="h-4 w-4" /> Stock Alerts
            </div>
            {outOfStockProducts.map(p => (
              <p key={p.id} className="text-sm text-red-600">❌ <strong>{p.name}</strong> is out of stock</p>
            ))}
            {lowStockProducts.map(p => (
              <p key={p.id} className="text-sm text-orange-600">⚠️ <strong>{p.name}</strong> — only {p.stock} left</p>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent Products</CardTitle>
            <Link href="/vendor/products" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {vendorProducts.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-3">No products yet</p>
                <Link href="/vendor/products/add">
                  <Button size="sm" variant="outline" className="gap-1">
                    <PlusCircle className="h-3 w-3" /> Add your first product
                  </Button>
                </Link>
              </div>
            ) : (
              vendorProducts.slice(0, 5).map(product => (
                <div key={product.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">₦{product.price.toLocaleString()} · Stock: {product.stock}</p>
                  </div>
                  <Badge variant={product.status === "active" ? "default" : "secondary"} className="text-xs">
                    {product.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent Orders</CardTitle>
            <Link href="/vendor/orders" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {vendorOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No orders yet</p>
            ) : (
              vendorOrders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">₦{order.total.toLocaleString()}</p>
                    <Badge variant="outline" className="text-xs">{order.status}</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
