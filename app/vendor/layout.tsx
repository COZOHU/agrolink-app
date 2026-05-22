"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { 
  Store, 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  BarChart3, 
  Settings, 
  Plus, 
  Menu,
  X,
  LogOut
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"

const sidebarLinks = [
  { href: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendor/products", label: "Products", icon: Package },
  { href: "/vendor/orders", label: "Orders", icon: ShoppingBag },
  { href: "/vendor/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/vendor/settings", label: "Settings", icon: Settings },
]

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname()
  const { currentUser, getVendorByUserId, signOut } = useStore()
  const router = useRouter()
  
  const vendor = currentUser ? getVendorByUserId(currentUser.id) : null
  
  const handleSignOut = () => {
    signOut()
    router.push("/")
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Store className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-primary">AgroLink</span>
        </Link>
      </div>
      
      <Separator />
      
      {vendor && (
        <div className="p-4">
          <p className="font-semibold text-sm truncate">{vendor.businessName}</p>
          <p className="text-xs text-muted-foreground truncate">{vendor.email}</p>
        </div>
      )}
      
      <nav className="flex-1 p-4 space-y-1">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
        
        <Link
          href="/vendor/products/add"
          onClick={onLinkClick}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors mt-4"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </nav>
      
      <Separator />
      
      <div className="p-4">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { currentUser, isAuthenticated, getVendorByUserId } = useStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  useEffect(() => {
    if (!mounted) return
    
    if (!isAuthenticated || !currentUser) {
      router.push("/auth/signin")
      return
    }
    
    if (currentUser.role !== "vendor") {
      router.push("/")
      return
    }
    
    const vendor = getVendorByUserId(currentUser.id)
    const pathname = window.location.pathname
    
    if (!vendor && !pathname.includes("/vendor/register")) {
      router.push("/vendor/register")
    }
  }, [mounted, isAuthenticated, currentUser, router, getVendorByUserId])
  
  if (!mounted) {
    return null
  }
  
  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-card">
        <SidebarContent />
      </aside>
      
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center gap-4 border-b px-4 h-14">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold">Vendor Dashboard</span>
        </header>
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  )
}
