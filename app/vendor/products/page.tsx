"use client"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { PlusCircle, Pencil, Trash2, Package, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useStore } from "@/lib/store"

export default function VendorProductsPage() {
  const { currentUser, vendors, products, deleteProduct } = useStore()
  const [search, setSearch] = useState("")
  const [deleting, setDeleting] = useState<string | null>(null)

  const vendor = vendors.find(v => v.userId === currentUser?.id)
  const vendorProducts = products.filter(p => p.vendorId === vendor?.id)
  const filtered = vendorProducts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return
    setDeleting(id)
    await deleteProduct(id)
    setDeleting(null)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Products</h1>
          <p className="text-muted-foreground text-sm">{vendorProducts.length} products in your store</p>
        </div>
        <Link href="/vendor/products/add">
          <Button className="gap-2"><PlusCircle className="h-4 w-4" /> Add Product</Button>
        </Link>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products yet</h3>
            <p className="text-muted-foreground text-sm mb-4">Start adding products to your store</p>
            <Link href="/vendor/products/add">
              <Button className="gap-2"><PlusCircle className="h-4 w-4" /> Add Your First Product</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map(product => (
            <Card key={product.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {product.images[0] ? (
                      <Image src={product.images[0]} alt={product.name} width={64} height={64} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-medium truncate">{product.name}</h3>
                      <Badge variant={product.status === "active" ? "default" : product.status === "out_of_stock" ? "destructive" : "secondary"}>
                        {product.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {product.category} · ₦{product.price.toLocaleString()} per {product.unit}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Stock: <span className={product.stock < 10 ? "text-orange-500 font-medium" : "font-medium"}>{product.stock} units</span>
                      </span>
                      <div className="flex gap-2">
                        <Link href={`/vendor/products/${product.id}/edit`}>
                          <Button size="sm" variant="outline" className="gap-1 h-8">
                            <Pencil className="h-3 w-3" /> Edit
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline"
                          className="gap-1 h-8 text-red-600 hover:text-red-700 hover:border-red-300"
                          onClick={() => handleDelete(product.id)} disabled={deleting === product.id}>
                          <Trash2 className="h-3 w-3" /> {deleting === product.id ? "..." : "Delete"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
