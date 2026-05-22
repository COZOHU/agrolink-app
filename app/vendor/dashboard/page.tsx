"use client"

import Link from "next/link"
import { 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  DollarSign,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store"

export default function VendorDashboardPage() {
  const { currentUser, getVendorByUserId, getProductsByVendor, getOrdersByVendor, products } = useStore()
  
  const vendor = currentUser ? getVendorByUserId(currentUser.id) : null
  const vendorProducts = vendor ? getProductsByVendor(vendor.id) : []
  const vendorOrders = vendor ? getOrdersByVendor(vendor.id) : []
  
  // Calculate stats
  const totalProducts = vendorProducts.length
  const totalOrders = vendorOrders.length
  const totalRevenue = vendorOrders.reduce((sum, order) => {
    const vendorItems = order.items.filter(item => {
      const product = products.find(p => p.id === item.productId)
      return product?.vendorId === vendor?.id
    })
    return sum + vendorItems.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0)
  }, 0)
  
  const totalStock = vendorProducts.reduce((sum, p) => sum + p.stock, 0)
  const lowStockProducts = vendorProducts.filter(p => p.stock < 10)
  
  // Recent orders
  const recentOrders = [...vendorOrders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
  
  // Top products by likes
  const topProducts = [...vendorProducts]
    .sort((a, b) => b.likes.length - a.likes.length)
    .slice(0, 5)
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {vendor?.businessName || "Vendor"}
          </p>
        </div>
        <Link href="/vendor/products/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="secondary" className="text-xs">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                Products
              </Badge>
            </div>
            <div className="mt-3">
              <p className="text-2xl md:text-3xl font-bold">{totalProducts}</p>
              <p className="text-xs text-muted-foreground">Total Products</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="secondary" className="text-xs">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                Orders
              </Badge>
            </div>
            <div className="mt-3">
              <p className="text-2xl md:text-3xl font-bold">{totalOrders}</p>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Revenue
              </Badge>
            </div>
            <div className="mt-3">
              <p className="text-2xl md:text-3xl font-bold">₦{totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              {lowStockProducts.length > 0 ? (
                <Badge variant="destructive" className="text-xs">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  Low Stock
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  In Stock
                </Badge>
              )}
            </div>
            <div className="mt-3">
              <p className="text-2xl md:text-3xl font-bold">{totalStock}</p>
              <p className="text-xs text-muted-foreground">Total Inventory</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Orders</CardTitle>
              <CardDescription>Latest orders for your products</CardDescription>
            </div>
            <Link href="/vendor/orders">
              <Button variant="ghost" size="sm">
                View All
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-sm">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">₦{order.total.toLocaleString()}</p>
                      <Badge 
                        variant={order.status === "delivered" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No orders yet</p>
                <p className="text-xs text-muted-foreground">Orders will appear here when customers buy your products</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Top Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Top Products</CardTitle>
              <CardDescription>Most popular products by likes</CardDescription>
            </div>
            <Link href="/vendor/products">
              <Button variant="ghost" size="sm">
                View All
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm truncate max-w-32">{product.name}</p>
                        <p className="text-xs text-muted-foreground">₦{product.price.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Eye className="h-4 w-4" />
                      {product.likes.length}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No products yet</p>
                <Link href="/vendor/products/add">
                  <Button size="sm" className="mt-2">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Product
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-lg text-destructive">Low Stock Alert</CardTitle>
            <CardDescription>The following products are running low on stock</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-2 bg-background rounded">
                  <span className="font-medium text-sm">{product.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">{product.stock} left</Badge>
                    <Link href={`/vendor/products/${product.id}/edit`}>
                      <Button size="sm" variant="outline">Restock</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
