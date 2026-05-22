"use client"
import Link from "next/link"
import Image from "next/image"
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"

export default function CartPage() {
  const { cart, products, removeFromCart, updateCartQuantity, clearCart } = useStore()
  const cartItems = cart.map(item => ({ ...item, product: products.find(p => p.id === item.productId) })).filter(i => i.product)
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product!.price * item.quantity), 0)
  const deliveryFee = subtotal > 10000 ? 0 : 1500
  const total = subtotal + deliveryFee

  if (cartItems.length === 0) return (
    <div className="container mx-auto px-4 py-16 text-center">
      <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
      <p className="text-muted-foreground mb-6">Browse our marketplace and add some products</p>
      <Link href="/marketplace"><Button>Shop Now</Button></Link>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Shopping Cart ({cartItems.length})</h1>
        <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700">Clear cart</button>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {cartItems.map(item => (
            <Card key={item.productId}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {item.product?.images[0] ? (
                      <Image src={item.product.images[0]} alt={item.product.name} width={80} height={80} className="object-cover w-full h-full" />
                    ) : <div className="w-full h-full flex items-center justify-center"><Package className="h-8 w-8 text-muted-foreground" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.productId}`}>
                      <h3 className="font-medium hover:text-primary truncate">{item.product?.name}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mb-2">₦{item.product?.price.toLocaleString()} / {item.product?.unit}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateCartQuantity(item.productId, item.quantity - 1)} className="h-7 w-7 rounded-md border flex items-center justify-center hover:bg-accent"><Minus className="h-3 w-3" /></button>
                        <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                        <button onClick={() => updateCartQuantity(item.productId, item.quantity + 1)} disabled={item.quantity >= (item.product?.stock || 0)} className="h-7 w-7 rounded-md border flex items-center justify-center hover:bg-accent disabled:opacity-50"><Plus className="h-3 w-3" /></button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-primary">₦{(item.product!.price * item.quantity).toLocaleString()}</span>
                        <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div>
          <Card className="sticky top-6">
            <CardHeader><CardTitle className="text-base">Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>₦{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span>{deliveryFee === 0 ? <span className="text-green-600">Free</span> : `₦${deliveryFee.toLocaleString()}`}</span>
              </div>
              {deliveryFee > 0 && <p className="text-xs text-muted-foreground">Add ₦{(10000 - subtotal).toLocaleString()} more for free delivery</p>}
              <div className="flex justify-between font-bold border-t pt-3">
                <span>Total</span>
                <span className="text-primary text-lg">₦{total.toLocaleString()}</span>
              </div>
              <Link href="/checkout"><Button className="w-full gap-2">Checkout <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link href="/marketplace"><Button variant="outline" className="w-full">Continue Shopping</Button></Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
