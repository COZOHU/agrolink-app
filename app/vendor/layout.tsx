"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Package, ShoppingBag, BarChart2, Settings, LogOut, Leaf, PlusCircle } from "lucide-react"
import { useStore } from "@/lib/store"

const navItems = [
  { href: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendor/products", label: "My Products", icon: Package },
  { href: "/vendor/products/add", label: "Add Product", icon: PlusCircle },
  { href: "/vendor/orders", label: "Orders", icon: ShoppingBag },
  { href: "/vendor/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/vendor/settings", label: "Settings", icon: Settings },
]

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, currentUser, signOut } = useStore()

  useEffect(() => {
    if (pathname === "/vendor/register") return
    if (!isAuthenticated) {
      router.push("/auth/signin")
    }
  }, [isAuthenticated, pathname, router])

  const handleSignOut = () => {
    signOut()
    router.push("/")
  }

  if (pathname === "/vendor/register") {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card hidden md:flex flex-col">
        <div className="p-6 border-b">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">AgroLink</span>
          </Link>
          <p className="text-xs text-muted-foreground mt-1">Vendor Dashboard</p>
        </div>

        {currentUser && (
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {currentUser.name?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            <span className="font-bold">AgroLink Vendor</span>
          </Link>
        </div>
        {children}
      </main>
    </div>
  )
}
