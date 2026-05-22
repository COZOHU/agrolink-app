"use client"

import { useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useStore } from "@/lib/store"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const router = useRouter()
  const { cart, products, currentUser, updateCartQuantity, removeFromCart } = useStore()

  const cartItems = useMemo(() => {
    return cart.map(item => {
      const product = products.find(p => p.id === item.productId)
      return {
        ...item,
        product,
      }
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

  const handleCheckout = () => {
    if (!currentUser) {
      router.push("/auth/signin?redirect=/cart")
      return
    }
    router.push("/checkout")
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto text-center py-12">
            <CardContent>
              <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Looks like you haven&apos;t added any products to your cart yet.
              </p>
              <Link href="/marketplace">
                <Button size="lg">
                  Start Shopping
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
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
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => {
              if (!item.product) return null
              
              return (
                <Card key={item.productId}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative h-24 w-24 rounded-lg overflow-hidden flex-shrink-0">
                        <Link href={`/products/${item.product.id}`}>
                          <Image
                            src={item.product.images[0] || "/placeholder.svg"}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </Link>
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <Link href={`/products/${item.product.id}`}>
                              <h3 className="font-semibold hover:text-primary transition-colors">
                                {item.product.name}
                              </h3>
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {item.product.category} - {item.product.unit}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => removeFromCart(item.productId)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center border rounded-lg">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateCartQuantity(item.productId, Math.max(1, item.quantity - 1))}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-10 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateCartQuantity(item.productId, Math.min(item.product!.stock, item.quantity + 1))}
                              disabled={item.quantity >= item.product.stock}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="text-right">
                            <p className="font-bold text-primary">
                              NGN {(item.product.price * item.quantity).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              NGN {item.product.price.toLocaleString()} each
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            <div className="flex justify-between items-center pt-4">
              <Link href="/marketplace">
                <Button variant="outline">
                  Continue Shopping
                </Button>
              </Link>
              <p className="text-muted-foreground">
                {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in cart
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>NGN {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `NGN ${deliveryFee.toLocaleString()}`
                    )}
                  </span>
                </div>
                {deliveryFee > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Free delivery on orders over NGN 10,000
                  </p>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">NGN {total.toLocaleString()}</span>
                </div>

                <Button className="w-full" size="lg" onClick={handleCheckout}>
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <div className="text-center text-xs text-muted-foreground">
                  Secure checkout powered by AgroLink
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
