"use client"

import { useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Package, Clock, CheckCircle, Truck, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store"
import { useRouter } from "next/navigation"

const statusConfig = {
  pending: { icon: Clock, color: "bg-yellow-500", label: "Pending" },
  confirmed: { icon: CheckCircle, color: "bg-blue-500", label: "Confirmed" },
  processing: { icon: Package, color: "bg-purple-500", label: "Processing" },
  shipped: { icon: Truck, color: "bg-cyan-500", label: "Shipped" },
  delivered: { icon: CheckCircle, color: "bg-green-500", label: "Delivered" },
  cancelled: { icon: XCircle, color: "bg-red-500", label: "Cancelled" },
}

export default function OrdersPage() {
  const router = useRouter()
  const { orders, products, currentUser } = useStore()

  // Redirect if not logged in
  if (!currentUser) {
    router.push("/auth/signin?redirect=/orders")
    return null
  }

  const userOrders = useMemo(() => {
    return orders
      .filter(o => o.userId === currentUser.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [orders, currentUser])

  const getProduct = (productId: string) => products.find(p => p.id === productId)

  if (userOrders.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto text-center py-12">
            <CardContent>
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-6">
                You haven&apos;t placed any orders yet. Start shopping to see your orders here.
              </p>
              <Link href="/marketplace">
                <Button size="lg">Start Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        <div className="space-y-6">
          {userOrders.map(order => {
            const status = statusConfig[order.status]
            const StatusIcon = status.icon

            return (
              <Card key={order.id}>
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <Badge className={`${status.color} text-white`}>
                      <StatusIcon className="h-4 w-4 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item, index) => {
                      const product = getProduct(item.productId)
                      if (!product) return null

                      return (
                        <div key={index} className="flex gap-4">
                          <div className="relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={product.images[0] || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <Link href={`/products/${product.id}`}>
                              <h4 className="font-medium hover:text-primary transition-colors">
                                {product.name}
                              </h4>
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} x NGN {item.price.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              NGN {(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="border-t mt-4 pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Delivery Address</p>
                        <p className="text-sm">
                          {order.shippingDetails.address}, {order.shippingDetails.city}, {order.shippingDetails.state}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Order Total</p>
                        <p className="text-xl font-bold text-primary">
                          NGN {order.total.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {order.status === "delivered" && (
                    <div className="mt-4">
                      <Button variant="outline" size="sm">
                        Write a Review
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
