"use client"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Package, CheckCircle, Truck, Clock, XCircle, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"

const STEPS = [
  { status: "pending", label: "Order Placed", icon: Clock, desc: "Your order has been received" },
  { status: "confirmed", label: "Confirmed", icon: CheckCircle, desc: "Vendor confirmed your order" },
  { status: "processing", label: "Processing", icon: Package, desc: "Your order is being prepared" },
  { status: "shipped", label: "Shipped", icon: Truck, desc: "Your order is on its way" },
  { status: "delivered", label: "Delivered", icon: CheckCircle, desc: "Order delivered successfully" },
]
const STATUS_ORDER = ["pending","confirmed","processing","shipped","delivered"]

export default function OrderTrackingPage() {
  const params = useParams()
  const router = useRouter()
  const { orders, products, vendors, isAuthenticated } = useStore()

  if (!isAuthenticated) { router.push("/auth/signin"); return null }

  const order = orders.find(o => o.id === params.id)
  if (!order) return (
    <div className="container mx-auto px-4 py-16 text-center">
      <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
      <Link href="/orders"><Button>View My Orders</Button></Link>
    </div>
  )

  const currentIdx = STATUS_ORDER.indexOf(order.status)
  const isCancelled = order.status === "cancelled"

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/orders"><Button variant="outline" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" /> My Orders</Button></Link>
        <div>
          <h1 className="text-xl font-bold">Order Tracking</h1>
          <p className="text-sm text-muted-foreground">#{order.id.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">{isCancelled ? "❌ Order Cancelled" : `Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`}</CardTitle></CardHeader>
        <CardContent>
          {isCancelled ? (
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <XCircle className="h-5 w-5 text-red-500" /><p className="text-sm text-red-700">This order has been cancelled</p>
            </div>
          ) : (
            <div>
              {STEPS.map((step, index) => {
                const isCompleted = STATUS_ORDER.indexOf(step.status) <= currentIdx
                const Icon = step.icon
                return (
                  <div key={step.status} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center border-2 ${isCompleted ? "bg-primary border-primary text-primary-foreground" : "border-muted text-muted-foreground"}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {index < STEPS.length - 1 && <div className={`w-0.5 h-8 ${STATUS_ORDER.indexOf(STEPS[index + 1].status) <= currentIdx ? "bg-primary" : "bg-muted"}`} />}
                    </div>
                    <div className="pb-6 pt-1">
                      <p className={`font-medium text-sm ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                      <p className="text-xs text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Items Ordered</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {order.items.map(item => {
            const product = products.find(p => p.id === item.productId)
            const vendor = product ? vendors.find(v => v.id === product.vendorId) : null
            return (
              <div key={item.productId} className="flex gap-3 py-2 border-b last:border-0">
                <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {product?.images[0] ? <Image src={product.images[0]} alt={product.name} width={56} height={56} className="object-cover w-full h-full" />
                    : <div className="w-full h-full flex items-center justify-center"><Package className="h-5 w-5 text-muted-foreground" /></div>}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{product?.name || "Unknown Product"}</p>
                  <p className="text-xs text-muted-foreground">{vendor?.farmName} · Qty: {item.quantity}</p>
                  <p className="text-sm font-medium text-primary mt-0.5">₦{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4" /> Delivery Address</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{order.shippingDetails.fullName}</p>
            <p className="text-muted-foreground">{order.shippingDetails.address}</p>
            <p className="text-muted-foreground">{order.shippingDetails.city}, {order.shippingDetails.state}</p>
            <p className="flex items-center gap-1 text-muted-foreground"><Phone className="h-3 w-3" />{order.shippingDetails.phone}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Payment Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₦{order.subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{order.deliveryFee === 0 ? "Free" : `₦${order.deliveryFee.toLocaleString()}`}</span></div>
            <div className="flex justify-between font-bold border-t pt-2"><span>Total Paid</span><span className="text-primary">₦{order.total.toLocaleString()}</span></div>
            <p className="text-xs text-muted-foreground capitalize">Via {order.paymentMethod}</p>
          </CardContent>
        </Card>
      </div>
      <div className="flex gap-3">
        <Link href="/marketplace" className="flex-1"><Button variant="outline" className="w-full">Continue Shopping</Button></Link>
        <Link href="/orders" className="flex-1"><Button className="w-full">All Orders</Button></Link>
      </div>
    </div>
  )
}
