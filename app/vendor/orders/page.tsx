"use client"
import { useState } from "react"
import { ShoppingBag, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useStore } from "@/lib/store"

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700", confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700", shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-700",
}
const NEXT_STATUS: Record<string, string> = {
  pending: "confirmed", confirmed: "processing", processing: "shipped", shipped: "delivered",
}

export default function VendorOrdersPage() {
  const { currentUser, vendors, products, orders, updateOrderStatus } = useStore()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")

  const vendor = vendors.find(v => v.userId === currentUser?.id)
  const vendorProducts = products.filter(p => p.vendorId === vendor?.id)
  const vendorOrders = orders
    .filter(o => o.items.some(item => vendorProducts.find(p => p.id === item.productId)))
    .filter(o => {
      const matchSearch = o.id.includes(search) || o.shippingDetails.fullName.toLowerCase().includes(search.toLowerCase())
      return matchSearch && (filter === "all" || o.status === filter)
    })

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-muted-foreground text-sm">Manage orders for your products</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {["all","pending","confirmed","processing","shipped","delivered","cancelled"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${filter === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by order ID or customer name..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {vendorOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No orders yet</h3>
            <p className="text-muted-foreground text-sm mt-1">Orders will appear here when customers purchase your products</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {vendorOrders.map(order => {
            const myItems = order.items.filter(item => vendorProducts.find(p => p.id === item.productId))
            const myTotal = myItems.reduce((s, item) => s + item.price * item.quantity, 0)
            const nextStatus = NEXT_STATUS[order.status]
            return (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="space-y-1 mb-3">
                    {myItems.map(item => {
                      const product = vendorProducts.find(p => p.id === item.productId)
                      return (
                        <div key={item.productId} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{product?.name} × {item.quantity}</span>
                          <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div>
                      <p className="text-sm font-bold text-primary">₦{myTotal.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{order.shippingDetails.fullName} · {order.shippingDetails.city}</p>
                    </div>
                    {nextStatus && order.status !== "cancelled" && (
                      <Button size="sm" onClick={() => updateOrderStatus(order.id, nextStatus as any)}>
                        Mark as {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
