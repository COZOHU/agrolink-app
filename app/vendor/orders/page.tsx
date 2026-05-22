"use client"

import { useState } from "react"
import { ShoppingBag, Package, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useStore, Order } from "@/lib/store"

const statusColors: Record<Order["status"], string> = {
  pending: "bg-yellow-500",
  confirmed: "bg-blue-500",
  processing: "bg-purple-500",
  shipped: "bg-indigo-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
}

export default function VendorOrdersPage() {
  const { currentUser, getVendorByUserId, getOrdersByVendor, products, updateOrderStatus } = useStore()
  
  const vendor = currentUser ? getVendorByUserId(currentUser.id) : null
  const orders = vendor ? getOrdersByVendor(vendor.id) : []
  
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  // Get vendor-specific items from orders
  const getVendorItems = (order: Order) => {
    return order.items.filter(item => {
      const product = products.find(p => p.id === item.productId)
      return product?.vendorId === vendor?.id
    }).map(item => ({
      ...item,
      product: products.find(p => p.id === item.productId)
    }))
  }
  
  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.shippingAddress.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  
  const handleStatusChange = (orderId: string, status: Order["status"]) => {
    updateOrderStatus(orderId, status)
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">
          Manage orders for your products
        </p>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const vendorItems = getVendorItems(order)
            const vendorTotal = vendorItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
            
            return (
              <Card key={order.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">
                        Order #{order.id.slice(0, 8)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()} at{" "}
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[order.status]}>
                        {order.status}
                      </Badge>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value as Order["status"])}
                      >
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Items */}
                    <div className="space-y-2">
                      {vendorItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{item.product?.name || "Unknown Product"}</p>
                              <p className="text-xs text-muted-foreground">
                                ₦{item.price.toLocaleString()} x {item.quantity}
                              </p>
                            </div>
                          </div>
                          <p className="font-medium">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Customer Info */}
                    <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm font-medium mb-1">Customer</p>
                        <p className="text-sm text-muted-foreground">{order.shippingAddress.name}</p>
                        <p className="text-sm text-muted-foreground">{order.shippingAddress.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Shipping Address</p>
                        <p className="text-sm text-muted-foreground">
                          {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state}
                        </p>
                      </div>
                    </div>
                    
                    {/* Total */}
                    <div className="flex justify-between items-center pt-4 border-t">
                      <span className="font-medium">Your Earnings</span>
                      <span className="text-lg font-bold text-primary">
                        ₦{vendorTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery || statusFilter !== "all" 
                ? "No orders found" 
                : "No orders yet"}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== "all" 
                ? "Try adjusting your search or filters" 
                : "Orders will appear here when customers buy your products"}
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
