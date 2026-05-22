"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Package, CheckCircle, CreditCard, Smartphone, Banknote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, products, isAuthenticated, currentUser, createOrder, clearCart } = useStore()
  const [step, setStep] = useState<"address" | "payment" | "success">("address")
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [address, setAddress] = useState({
    fullName: currentUser?.name || "", email: currentUser?.email || "",
    phone: currentUser?.phone || "", address: "", city: "", state: "", notes: "",
  })

  const cartItems = cart.map(item => ({ ...item, product: products.find(p => p.id === item.productId) })).filter(i => i.product)
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product!.price * item.quantity), 0)
  const deliveryFee = subtotal > 10000 ? 0 : 1500
  const total = subtotal + deliveryFee

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) { router.push("/auth/signin"); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 2000))
    createOrder({
      items: cartItems.map(item => ({ productId: item.productId, quantity: item.quantity, price: item.product!.price })),
      shippingDetails: address, paymentMethod, subtotal, deliveryFee, total,
    })
    clearCart()
    setLoading(false)
    setStep("success")
  }

  if (cartItems.length === 0 && step !== "success") return (
    <div className="container mx-auto px-4 py-16 text-center">
      <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
      <Link href="/marketplace"><Button>Browse Marketplace</Button></Link>
    </div>
  )

  if (step === "success") return (
    <div className="container mx-auto px-4 py-16 text-center max-w-md">
      <div className="flex justify-center mb-6">
        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
      <p className="text-muted-foreground mb-6">Your order is confirmed and being processed by the vendor.</p>
      <div className="space-y-3">
        <Link href="/orders" className="block"><Button className="w-full">Track My Orders</Button></Link>
        <Link href="/marketplace" className="block"><Button variant="outline" className="w-full">Continue Shopping</Button></Link>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/cart"><Button variant="outline" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" /> Cart</Button></Link>
        <h1 className="text-2xl font-bold">Checkout</h1>
      </div>
      <div className="flex items-center gap-2 mb-8">
        {(["address", "payment"] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${step === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</div>
            <span className={`text-sm ${step === s ? "font-medium" : "text-muted-foreground"}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
            {i < 1 && <span className="text-muted-foreground mx-1">→</span>}
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {step === "address" && (
            <Card>
              <CardHeader><CardTitle>Delivery Address</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2"><Label>Full Name *</Label><Input value={address.fullName} onChange={e => setAddress({ ...address, fullName: e.target.value })} required /></div>
                  <div className="space-y-2"><Label>Email *</Label><Input type="email" value={address.email} onChange={e => setAddress({ ...address, email: e.target.value })} required /></div>
                  <div className="space-y-2"><Label>Phone *</Label><Input value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} required /></div>
                  <div className="col-span-2 space-y-2"><Label>Street Address *</Label><Input placeholder="House no, street name" value={address.address} onChange={e => setAddress({ ...address, address: e.target.value })} required /></div>
                  <div className="space-y-2"><Label>City *</Label><Input placeholder="Lagos" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} required /></div>
                  <div className="space-y-2"><Label>State *</Label><Input placeholder="Lagos State" value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} required /></div>
                  <div className="col-span-2 space-y-2">
                    <Label>Delivery Notes (Optional)</Label>
                    <textarea rows={2} placeholder="Any special instructions..." value={address.notes} onChange={e => setAddress({ ...address, notes: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                  </div>
                </div>
                <Button className="w-full" onClick={() => {
                  if (!address.fullName || !address.address || !address.city || !address.state) { alert("Please fill all required fields"); return }
                  setStep("payment")
                }}>Continue to Payment</Button>
              </CardContent>
            </Card>
          )}
          {step === "payment" && (
            <Card>
              <CardHeader><CardTitle>Payment Method</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { id: "card", label: "Debit / Credit Card", Icon: CreditCard, desc: "Visa, Mastercard, Verve" },
                  { id: "transfer", label: "Bank Transfer", Icon: Banknote, desc: "Direct bank transfer" },
                  { id: "ussd", label: "USSD / Mobile Money", Icon: Smartphone, desc: "*737#, *901# etc." },
                ].map(({ id, label, Icon, desc }) => (
                  <button key={id} onClick={() => setPaymentMethod(id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-colors ${paymentMethod === id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${paymentMethod === id ? "bg-primary/10" : "bg-muted"}`}>
                      <Icon className={`h-5 w-5 ${paymentMethod === id ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-medium text-sm">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <div className={`h-4 w-4 rounded-full border-2 ${paymentMethod === id ? "border-primary bg-primary" : "border-muted-foreground"}`} />
                  </button>
                ))}
                <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">🔒 Demo mode — no real payment will be processed.</div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep("address")} className="flex-1">Back</Button>
                  <Button onClick={handlePlaceOrder} disabled={loading} className="flex-1">
                    {loading ? "Processing..." : `Pay ₦${total.toLocaleString()}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        <Card className="h-fit sticky top-6">
          <CardHeader><CardTitle className="text-base">Order Summary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {cartItems.map(item => (
              <div key={item.productId} className="flex gap-3">
                <div className="h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  {item.product?.images[0] && <Image src={item.product.images[0]} alt={item.product.name} width={48} height={48} className="object-cover w-full h-full" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.product?.name}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-medium">₦{((item.product?.price || 0) * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>₦{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Delivery</span><span>{deliveryFee === 0 ? <span className="text-green-600">Free</span> : `₦${deliveryFee.toLocaleString()}`}</span></div>
              <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span className="text-primary">₦{total.toLocaleString()}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
