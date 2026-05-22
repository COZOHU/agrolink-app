"use client"
import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingBag, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useStore } from "@/lib/store"

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700", confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700", shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-700",
}

export default function OrdersPage() {
  const router = useRouter()
  const { orders, products, currentUser, isAuthenticated } = useStore()

  useEffect(() => { if (!isAuthenticated) router.push("/auth/signin") }, [isAuthenticated, router])

  const myOrders = orders
    .filter(o => o.userId === currentUser?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Orders</h1>
          <p className="text-muted-foreground text-sm">{myOrders.length} order{myOrders.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/marketplace"><Button variant="outline">Continue Shopping</Button></Link>
      </div>
      {myOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground text-sm mb-6">Your purchases will appear here</p>
            <Link href="/marketplace"><Button>Shop Now</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {myOrders.map(order => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex gap-1 mb-3 flex-wrap">
                    {order.items.slice(0, 3).map(item => {
                      const product = products.find(p => p.id === item.productId)
                      return product ? <span key={item.productId} className="text-xs bg-muted px-2 py-1 rounded">{product.name} ×{item.quantity}</span> : null
                    })}
                    {order.items.length > 3 && <span className="text-xs bg-muted px-2 py-1 rounded">+{order.items.length - 3} more</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">₦{order.total.toLocaleString()}</span>
                    <span className="text-xs text-primary flex items-center gap-1">Track Order <ArrowRight className="h-3 w-3" /></span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
