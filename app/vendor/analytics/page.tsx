"use client"

import { TrendingUp, Package, ShoppingBag, DollarSign, Heart, BarChart3 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"

export default function VendorAnalyticsPage() {
  const { currentUser, getVendorByUserId, getProductsByVendor, getOrdersByVendor, products } = useStore()
  
  const vendor = currentUser ? getVendorByUserId(currentUser.id) : null
  const vendorProducts = vendor ? getProductsByVendor(vendor.id) : []
  const vendorOrders = vendor ? getOrdersByVendor(vendor.id) : []
  
  // Calculate analytics
  const totalProducts = vendorProducts.length
  const totalOrders = vendorOrders.length
  const totalLikes = vendorProducts.reduce((sum, p) => sum + p.likes.length, 0)
  const totalStock = vendorProducts.reduce((sum, p) => sum + p.stock, 0)
  
  const totalRevenue = vendorOrders.reduce((sum, order) => {
    const vendorItems = order.items.filter(item => {
      const product = products.find(p => p.id === item.productId)
      return product?.vendorId === vendor?.id
    })
    return sum + vendorItems.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0)
  }, 0)
  
  const deliveredOrders = vendorOrders.filter(o => o.status === "delivered").length
  const pendingOrders = vendorOrders.filter(o => o.status === "pending" || o.status === "confirmed").length
  
  // Products by category
  const productsByCategory = vendorProducts.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  // Top performing products
  const topProducts = [...vendorProducts]
    .sort((a, b) => b.likes.length - a.likes.length)
    .slice(0, 5)
  
  // Revenue by month (simulated for demo)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
  const monthlyData = months.map((month, index) => ({
    month,
    revenue: Math.floor(totalRevenue / 6 * (0.5 + Math.random())),
    orders: Math.floor(totalOrders / 6 * (0.5 + Math.random()))
  }))
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Track your store performance
        </p>
      </div>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">₦{totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalOrders}</p>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalProducts}</p>
                <p className="text-xs text-muted-foreground">Products Listed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalLikes}</p>
                <p className="text-xs text-muted-foreground">Total Likes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart (Placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue for the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((data) => (
                <div key={data.month} className="flex items-center gap-4">
                  <span className="w-10 text-sm text-muted-foreground">{data.month}</span>
                  <div className="flex-1 h-8 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min(100, (data.revenue / (totalRevenue / 3)) * 100)}%` }}
                    />
                  </div>
                  <span className="w-24 text-sm font-medium text-right">
                    ₦{data.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Order Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Status</CardTitle>
            <CardDescription>Current order fulfillment status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span>Delivered</span>
                </div>
                <span className="font-bold">{deliveredOrders}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span>Pending/Confirmed</span>
                </div>
                <span className="font-bold">{pendingOrders}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span>Processing/Shipped</span>
                </div>
                <span className="font-bold">
                  {vendorOrders.filter(o => o.status === "processing" || o.status === "shipped").length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Products</CardTitle>
            <CardDescription>Most liked products</CardDescription>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">₦{product.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">{product.likes.length}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No products yet</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Inventory Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inventory Overview</CardTitle>
            <CardDescription>Stock levels across products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Items in Stock</span>
                <span className="font-bold">{totalStock}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Products Listed</span>
                <span className="font-bold">{totalProducts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Low Stock Items</span>
                <span className="font-bold text-destructive">
                  {vendorProducts.filter(p => p.stock < 10).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Out of Stock</span>
                <span className="font-bold text-destructive">
                  {vendorProducts.filter(p => p.stock === 0).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
