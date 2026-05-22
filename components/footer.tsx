import Link from "next/link"
import { Store, Phone, Mail, MapPin } from "lucide-react"
import { CATEGORIES } from "@/lib/store"

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Store className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">AgroLink</span>
            </Link>
            <p className="text-sm text-background/70">
              Connecting Nigerian farmers directly to consumers for fresh, quality agricultural products.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-background/70 hover:text-background transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="text-sm text-background/70 hover:text-background transition-colors">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/vendors" className="text-sm text-background/70 hover:text-background transition-colors">
                  Vendors
                </Link>
              </li>
              <li>
                <Link href="/vendor/register" className="text-sm text-background/70 hover:text-background transition-colors">
                  Become a Vendor
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              {CATEGORIES.map((category) => (
                <li key={category.id}>
                  <Link 
                    href={`/marketplace?category=${category.id}`} 
                    className="text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-background/70">
                <Phone className="h-4 w-4" />
                <span>+234 123 456 7890</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-background/70">
                <Mail className="h-4 w-4" />
                <span>support@agrolink.ng</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-background/70">
                <MapPin className="h-4 w-4" />
                <span>Lagos, Nigeria</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-background/20 mt-8 pt-8 text-center text-sm text-background/60">
          <p>&copy; {new Date().getFullYear()} AgroLink. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
