"use client"
import { TrendingUp, Package, ShoppingBag, Heart, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store"

export default function VendorAnalyticsPage() {
  const { currentUser, vendors, products, orders, likedProducts } = useStore()
  const vendor = vendors.find(v => v.userId === currentUser?.id)
  const vendorProducts = products.filter(p => p.vendorId === vendor?.id)
  const vendorOrders = orders.filter(o => o.items.some(item => vendorProducts.find(p => p.id === item.productId)))

  const totalRevenue = vendorOrders.filter(o => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.items.filter(item => vendorProducts.find(p => p.id === item.productId))
      .reduce((s, item) => s + item.price * item.quantity, 0), 0)

  const totalLikes = vendorProducts.filter(p => likedProducts.includes(p.id)).length

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  const now = new Date()
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const revenue = vendorOrders.filter(o => {
      const od = new Date(o.createdAt)
      return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear() && o.status !== "cancelled"
    }).reduce((sum, o) => sum + o.items.filter(item => vendorProducts.find(p => p.id === item.productId))
      .reduce((s, item) => s + item.price * item.quantity, 0), 0)
    return { month: months[d.getMonth()], revenue }
  })
  const maxRevenue = Math.max(...monthlyData.map(m => m.revenue), 1)

  const statusCounts = {
    delivered: vendorOrders.filter(o => o.status === "delivered").length,
    pending: vendorOrders.filter(o => ["pending","confirmed"].includes(o.status)).length,
    processing: vendorOrders.filter(o => ["processing","shipped"].includes(o.status)).length,
    cancelled: vendorOrders.filter(o => o.status === "cancelled").length,
  }
  const lowStock = vendorProducts.filter(p => p.stock < 10 && p.stock > 0)
  const outOfStock = vendorProducts.filter(p => p.stock === 0)

  const stats = [
    { label: "Total Revenue", value: `₦${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" },
    { label: "Total Orders", value: vendorOrders.length, icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Products Listed", value: vendorProducts.length, icon: Package, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Total Likes", value: totalLikes, icon: Heart, color: "text-red-500", bg: "bg-red-50" },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm">Track your store performance</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(stat => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.bg}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue — Last 6 Months</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 h-36">
            {monthlyData.map(({ month, revenue }) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-muted-foreground">{revenue > 0 ? `₦${(revenue/1000).toFixed(0)}k` : "₦0"}</span>
                <div className="w-full rounded-t-md transition-all" style={{ height: `${Math.max((revenue / maxRevenue) * 90, 4)}px`, backgroundColor: revenue > 0 ? "hsl(142 71% 45%)" : "hsl(var(--muted))" }} />
                <span className="text-xs font-medium">{month}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Order Status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Delivered", count: statusCounts.delivered, color: "bg-green-500" },
              { label: "Pending / Confirmed", count: statusCounts.pending, color: "bg-yellow-500" },
              { label: "Processing / Shipped", count: statusCounts.processing, color: "bg-blue-500" },
              { label: "Cancelled", count: statusCounts.cancelled, color: "bg-red-500" },
            ].map(({ label, count, color }) => (
              <div key={label} className="space-y-1">
                <div className="flex justify-between text-sm"><span>{label}</span><span className="font-medium">{count}</span></div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full`} style={{ width: vendorOrders.length > 0 ? `${(count / vendorOrders.length) * 100}%` : "0%" }} />
                </div>
              </div>
            ))}
            {vendorOrders.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Inventory Overview</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total In Stock", value: vendorProducts.reduce((s, p) => s + p.stock, 0), alert: false },
                { label: "Products Listed", value: vendorProducts.length, alert: false },
                { label: "Low Stock", value: lowStock.length, alert: lowStock.length > 0 },
                { label: "Out of Stock", value: outOfStock.length, alert: outOfStock.length > 0 },
              ].map(({ label, value, alert }) => (
                <div key={label} className={`p-3 rounded-lg border ${alert ? "border-orange-200 bg-orange-50" : "border-border bg-muted/30"}`}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={`text-2xl font-bold ${alert ? "text-orange-600" : ""}`}>{value}</p>
                </div>
              ))}
            </div>
            {(lowStock.length > 0 || outOfStock.length > 0) && (
              <div className="space-y-1 pt-2 border-t">
                {outOfStock.map(p => <p key={p.id} className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{p.name} — out of stock</p>)}
                {lowStock.map(p => <p key={p.id} className="text-xs text-orange-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{p.name} — {p.stock} left</p>)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
