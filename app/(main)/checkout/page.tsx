"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { CreditCard, Truck, MapPin, Phone, User, Mail, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

type CheckoutStep = "shipping" | "payment" | "confirmation"

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { cart, products, currentUser, clearCart, createOrder } = useStore()
  
  const [step, setStep] = useState<CheckoutStep>("shipping")
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Shipping details
  const [shippingDetails, setShippingDetails] = useState({
    fullName: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    notes: "",
  })

  // Payment details
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  })

  const cartItems = useMemo(() => {
    return cart.map(item => {
      const product = products.find(p => p.id === item.productId)
      return { ...item, product }
    }).filter(item => item.product)
  }, [cart, products])

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      if (item.product) {
        return total + item.product.price * item.quantity
      }
      return total
    }, 0)
  }, [cartItems])

  const deliveryFee = subtotal > 10000 ? 0 : 1500
  const total = subtotal + deliveryFee

  // Redirect if cart is empty or not logged in
  if (!currentUser) {
    router.push("/auth/signin?redirect=/checkout")
    return null
  }

  if (cartItems.length === 0) {
    router.push("/cart")
    return null
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!shippingDetails.fullName || !shippingDetails.email || !shippingDetails.phone || 
        !shippingDetails.address || !shippingDetails.city || !shippingDetails.state) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }
    setStep("payment")
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (paymentMethod === "card") {
      if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardName) {
        toast({
          title: "Missing Information",
          description: "Please fill in all card details",
          variant: "destructive",
        })
        return
      }
    }

    setIsProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Create order
    createOrder({
      items: cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product!.price,
      })),
      shippingDetails,
      paymentMethod,
      subtotal,
      deliveryFee,
      total,
    })

    clearCart()
    setIsProcessing(false)
    setStep("confirmation")
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    return parts.length ? parts.join(" ") : value
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step === "shipping" || step === "payment" || step === "confirmation"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}>
              {step === "payment" || step === "confirmation" ? <Check className="h-5 w-5" /> : "1"}
            </div>
            <span className="ml-2 font-medium">Shipping</span>
          </div>
          <div className="w-20 h-0.5 mx-4 bg-muted">
            <div className={`h-full ${step === "payment" || step === "confirmation" ? "bg-primary" : ""}`} />
          </div>
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step === "payment" || step === "confirmation"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}>
              {step === "confirmation" ? <Check className="h-5 w-5" /> : "2"}
            </div>
            <span className="ml-2 font-medium">Payment</span>
          </div>
          <div className="w-20 h-0.5 mx-4 bg-muted">
            <div className={`h-full ${step === "confirmation" ? "bg-primary" : ""}`} />
          </div>
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step === "confirmation"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}>
              3
            </div>
            <span className="ml-2 font-medium">Confirmation</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === "shipping" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Shipping Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleShippingSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">
                          <User className="inline h-4 w-4 mr-1" />
                          Full Name *
                        </Label>
                        <Input
                          id="fullName"
                          value={shippingDetails.fullName}
                          onChange={(e) => setShippingDetails({ ...shippingDetails, fullName: e.target.value })}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">
                          <Mail className="inline h-4 w-4 mr-1" />
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={shippingDetails.email}
                          onChange={(e) => setShippingDetails({ ...shippingDetails, email: e.target.value })}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        <Phone className="inline h-4 w-4 mr-1" />
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={shippingDetails.phone}
                        onChange={(e) => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">
                        <MapPin className="inline h-4 w-4 mr-1" />
                        Delivery Address *
                      </Label>
                      <Input
                        id="address"
                        value={shippingDetails.address}
                        onChange={(e) => setShippingDetails({ ...shippingDetails, address: e.target.value })}
                        placeholder="Enter your street address"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={shippingDetails.city}
                          onChange={(e) => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                          placeholder="Enter your city"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          value={shippingDetails.state}
                          onChange={(e) => setShippingDetails({ ...shippingDetails, state: e.target.value })}
                          placeholder="Enter your state"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={shippingDetails.notes}
                        onChange={(e) => setShippingDetails({ ...shippingDetails, notes: e.target.value })}
                        placeholder="Any special instructions for delivery"
                        rows={3}
                      />
                    </div>

                    <Button type="submit" className="w-full" size="lg">
                      Continue to Payment
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {step === "payment" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePaymentSubmit} className="space-y-6">
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-5 w-5" />
                              <span>Debit/Credit Card</span>
                            </div>
                            <div className="flex gap-2">
                              <div className="h-6 w-10 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>
                              <div className="h-6 w-10 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>
                            </div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="bank" id="bank" />
                        <Label htmlFor="bank" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M4 10h3v7H4zm6 0h3v7h-3zm6 0h3v7h-3zM2 19h19v3H2zm8-18l9 4v3H1V5z"/>
                            </svg>
                            <span>Bank Transfer</span>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            <span>Cash on Delivery</span>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>

                    {paymentMethod === "card" && (
                      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                        <div className="space-y-2">
                          <Label htmlFor="cardName">Name on Card</Label>
                          <Input
                            id="cardName"
                            value={cardDetails.cardName}
                            onChange={(e) => setCardDetails({ ...cardDetails, cardName: e.target.value })}
                            placeholder="Enter name on card"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <Input
                            id="cardNumber"
                            value={cardDetails.cardNumber}
                            onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: formatCardNumber(e.target.value) })}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiry">Expiry Date</Label>
                            <Input
                              id="expiry"
                              value={cardDetails.expiryDate}
                              onChange={(e) => setCardDetails({ ...cardDetails, expiryDate: formatExpiryDate(e.target.value) })}
                              placeholder="MM/YY"
                              maxLength={5}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvv">CVV</Label>
                            <Input
                              id="cvv"
                              type="password"
                              value={cardDetails.cvv}
                              onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                              placeholder="123"
                              maxLength={4}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "bank" && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          You will receive bank transfer details after placing your order. 
                          Please complete the transfer within 24 hours to confirm your order.
                        </p>
                      </div>
                    )}

                    {paymentMethod === "cod" && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Pay with cash when your order is delivered. 
                          Please have the exact amount ready for the delivery agent.
                        </p>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setStep("shipping")}
                      >
                        Back
                      </Button>
                      <Button type="submit" className="flex-1" disabled={isProcessing}>
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          `Pay NGN ${total.toLocaleString()}`
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {step === "confirmation" && (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="h-10 w-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
                  <p className="text-muted-foreground mb-6">
                    Thank you for your order. We&apos;ve sent a confirmation email to {shippingDetails.email}
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-muted-foreground">Order Total</p>
                    <p className="text-2xl font-bold text-primary">NGN {total.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button variant="outline" onClick={() => router.push("/orders")}>
                      View Orders
                    </Button>
                    <Button onClick={() => router.push("/marketplace")}>
                      Continue Shopping
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {cartItems.map(item => {
                    if (!item.product) return null
                    return (
                      <div key={item.productId} className="flex gap-3">
                        <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.product.images[0] || "/placeholder.svg"}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          <p className="text-sm font-medium text-primary">
                            NGN {(item.product.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>NGN {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>
                      {deliveryFee === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `NGN ${deliveryFee.toLocaleString()}`
                      )}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">NGN {total.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
