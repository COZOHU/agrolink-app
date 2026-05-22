"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore, CATEGORIES, UNITS } from "@/lib/store"

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const { products, updateProduct } = useStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [form, setForm] = useState({
    name: "", description: "", price: "", unit: "kg", category: "",
    stock: "", organic: false, images: [] as string[], status: "active" as "active" | "draft" | "out_of_stock",
  })

  const product = products.find(p => p.id === params.id)

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name, description: product.description,
        price: product.price.toString(), unit: product.unit,
        category: product.category, stock: product.stock.toString(),
        organic: product.organic, images: product.images, status: product.status,
      })
    }
  }, [product])

  if (!product) return (
    <div className="p-6 text-center">
      <p className="text-muted-foreground mb-4">Product not found.</p>
      <Link href="/vendor/products"><Button>Back to Products</Button></Link>
    </div>
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement
    if (target.type === "checkbox") setForm({ ...form, [target.name]: target.checked })
    else setForm({ ...form, [target.name]: target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError("")
    const result = await updateProduct(product.id, {
      name: form.name, description: form.description,
      price: parseFloat(form.price), unit: form.unit,
      category: form.category, stock: parseInt(form.stock),
      organic: form.organic, images: form.images, status: form.status,
    })
    setLoading(false)
    if (result.success) { setSuccess(true); setTimeout(() => router.push("/vendor/products"), 1500) }
    else setError("Failed to update product.")
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/vendor/products">
          <Button variant="outline" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground text-sm">Update your product details</p>
        </div>
      </div>
      {success && <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-medium">✅ Product updated! Redirecting...</div>}
      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <textarea id="description" name="description" rows={3} value={form.description} onChange={handleChange} required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select id="status" name="status" value={form.status} onChange={handleChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Pricing & Stock</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₦) *</Label>
                <Input id="price" name="price" type="number" min="1" value={form.price} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <select id="unit" name="unit" value={form.unit} onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input id="stock" name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Category & Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select id="category" name="category" value={form.category} onChange={handleChange} required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="organic" name="organic" checked={form.organic} onChange={handleChange} className="rounded" />
              <Label htmlFor="organic" className="cursor-pointer">Organic product</Label>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Product Images</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="Paste image URL..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
              <Button type="button" variant="outline" disabled={form.images.length >= 5}
                onClick={() => { if (imageUrl) { setForm({ ...form, images: [...form.images, imageUrl] }); setImageUrl("") } }}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {form.images.map((url, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded border text-sm">
                <span className="flex-1 truncate text-muted-foreground">{url}</span>
                <button type="button" onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })} className="text-red-500">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="flex gap-3">
          <Link href="/vendor/products" className="flex-1">
            <Button variant="outline" className="w-full" type="button">Cancel</Button>
          </Link>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
