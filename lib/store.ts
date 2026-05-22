import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export interface User {
  id: string
  email: string
  name: string
  phone: string
  role: 'buyer' | 'vendor'
  avatar?: string
  createdAt: string
  verified: boolean
}

export interface Vendor {
  id: string
  userId: string
  farmName: string
  email: string
  phone: string
  location: string
  description: string
  avatar?: string
  coverImage?: string
  specialties: string[]
  verified: boolean
  status: 'pending' | 'approved' | 'rejected'
  rating: number
  totalReviews: number
  totalSales: number
  joinedAt: string
}

export interface Product {
  id: string
  vendorId: string
  name: string
  description: string
  price: number
  category: string
  unit: string
  stock: number
  images: string[]
  organic: boolean
  rating: number
  reviews: number
  status: 'active' | 'draft' | 'out_of_stock'
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  productId: string
  quantity: number
}

export interface Order {
  id: string
  userId: string
  items: {
    productId: string
    quantity: number
    price: number
  }[]
  subtotal: number
  deliveryFee: number
  total: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shippingDetails: {
    fullName: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    notes?: string
  }
  paymentMethod: string
  createdAt: string
}

interface StoreState {
  // Auth
  currentUser: User | null
  isAuthenticated: boolean
  pendingVerification: { email: string; code: string; userData: Partial<User & { password: string }> } | null
  
  // Data
  users: User[]
  vendors: Vendor[]
  products: Product[]
  orders: Order[]
  cart: CartItem[]
  likedProducts: string[]
  
  // Auth actions
  signUp: (data: { name: string; email: string; phone: string; password: string; role: 'buyer' | 'vendor' }) => Promise<{ success: boolean; message: string; verificationCode?: string }>
  verifyEmail: (email: string, code: string) => Promise<{ success: boolean; message: string }>
  signIn: (email: string, password: string, role: 'buyer' | 'vendor') => Promise<{ success: boolean; message: string }>
  signOut: () => void
  
  // Vendor actions
  registerVendor: (data: Omit<Vendor, 'id' | 'userId' | 'verified' | 'status' | 'rating' | 'totalReviews' | 'totalSales' | 'joinedAt'>) => Promise<{ success: boolean; message: string }>
  updateVendor: (vendorId: string, updates: Partial<Vendor>) => void
  
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviews'>) => Promise<{ success: boolean; message: string; product?: Product }>
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<{ success: boolean; message: string }>
  deleteProduct: (productId: string) => Promise<{ success: boolean; message: string }>
  
  // Like actions
  toggleLike: (productId: string) => void
  
  // Cart actions
  addToCart: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  updateCartQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  
  // Order actions
  createOrder: (orderData: {
    items: { productId: string; quantity: number; price: number }[]
    shippingDetails: Order['shippingDetails']
    paymentMethod: string
    subtotal: number
    deliveryFee: number
    total: number
  }) => void
  updateOrderStatus: (orderId: string, status: Order['status']) => void
}

// Password storage (simple demo - in production use bcrypt)
const passwordStore: Record<string, string> = {}

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

// Generate verification code
const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString()

// Sample data
const sampleVendors: Vendor[] = [
  {
    id: 'vendor-1',
    userId: 'user-vendor-1',
    farmName: 'Green Valley Farm',
    email: 'greenvalley@example.com',
    phone: '+234 801 234 5678',
    location: 'Ibadan, Oyo State',
    description: 'We are a family-owned organic farm specializing in fresh vegetables and fruits. Our produce is grown using sustainable farming practices without pesticides or chemicals.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&h=400&fit=crop',
    specialties: ['Vegetables', 'Fruits', 'Organic'],
    verified: true,
    status: 'approved',
    rating: 4.8,
    totalReviews: 156,
    totalSales: 892,
    joinedAt: '2023-01-15',
  },
  {
    id: 'vendor-2',
    userId: 'user-vendor-2',
    farmName: 'Sunrise Poultry Farm',
    email: 'sunrise@example.com',
    phone: '+234 802 345 6789',
    location: 'Kaduna, Kaduna State',
    description: 'Premium poultry products including fresh eggs, chicken, and turkey. We maintain the highest standards of hygiene and animal welfare.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=1200&h=400&fit=crop',
    specialties: ['Poultry', 'Eggs', 'Turkey'],
    verified: true,
    status: 'approved',
    rating: 4.6,
    totalReviews: 98,
    totalSales: 567,
    joinedAt: '2023-03-20',
  },
  {
    id: 'vendor-3',
    userId: 'user-vendor-3',
    farmName: 'Harvest King Grains',
    email: 'harvestking@example.com',
    phone: '+234 803 456 7890',
    location: 'Kano, Kano State',
    description: 'Your trusted source for premium grains and cereals. We source directly from local farmers to bring you the freshest rice, beans, and maize.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1200&h=400&fit=crop',
    specialties: ['Rice', 'Beans', 'Grains'],
    verified: true,
    status: 'approved',
    rating: 4.9,
    totalReviews: 234,
    totalSales: 1234,
    joinedAt: '2022-11-10',
  },
]

const sampleProducts: Product[] = [
  // Green Valley Farm products
  {
    id: 'prod-1',
    vendorId: 'vendor-1',
    name: 'Fresh Organic Tomatoes',
    description: 'Vine-ripened organic tomatoes grown without pesticides. Perfect for salads, sauces, and cooking. Our tomatoes are handpicked at peak ripeness.',
    price: 1500,
    category: 'Vegetables',
    unit: 'kg',
    stock: 150,
    images: ['https://images.unsplash.com/photo-1546470427-227c7f6f2c06?w=400&h=400&fit=crop'],
    organic: true,
    rating: 4.7,
    reviews: 45,
    status: 'active',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10',
  },
  {
    id: 'prod-2',
    vendorId: 'vendor-1',
    name: 'Fresh Spinach Bundle',
    description: 'Freshly harvested spinach leaves, perfect for smoothies, salads, or cooking. Packed with vitamins and minerals.',
    price: 800,
    category: 'Vegetables',
    unit: 'bunch',
    stock: 80,
    images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop'],
    organic: true,
    rating: 4.8,
    reviews: 32,
    status: 'active',
    createdAt: '2024-01-12',
    updatedAt: '2024-01-12',
  },
  {
    id: 'prod-3',
    vendorId: 'vendor-1',
    name: 'Sweet Watermelon',
    description: 'Juicy, sweet watermelon perfect for hot days. Grown naturally in our farm.',
    price: 2500,
    category: 'Fruits',
    unit: 'piece',
    stock: 45,
    images: ['https://images.unsplash.com/photo-1563114773-84221bd62daa?w=400&h=400&fit=crop'],
    organic: false,
    rating: 4.9,
    reviews: 67,
    status: 'active',
    createdAt: '2024-01-08',
    updatedAt: '2024-01-08',
  },
  {
    id: 'prod-4',
    vendorId: 'vendor-1',
    name: 'Fresh Carrots',
    description: 'Crunchy, sweet carrots perfect for salads, juicing, or cooking. Rich in beta-carotene and vitamins.',
    price: 1200,
    category: 'Vegetables',
    unit: 'kg',
    stock: 120,
    images: ['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop'],
    organic: true,
    rating: 4.6,
    reviews: 28,
    status: 'active',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  // Sunrise Poultry Farm products
  {
    id: 'prod-5',
    vendorId: 'vendor-2',
    name: 'Fresh Farm Eggs',
    description: 'Farm-fresh eggs from free-range chickens. High in protein and perfect for breakfast.',
    price: 2800,
    category: 'Poultry',
    unit: 'crate',
    stock: 60,
    images: ['https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop'],
    organic: false,
    rating: 4.8,
    reviews: 89,
    status: 'active',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-05',
  },
  {
    id: 'prod-6',
    vendorId: 'vendor-2',
    name: 'Whole Chicken',
    description: 'Fresh whole chicken, raised without antibiotics. Perfect for roasting or grilling.',
    price: 4500,
    category: 'Poultry',
    unit: 'piece',
    stock: 35,
    images: ['https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&h=400&fit=crop'],
    organic: false,
    rating: 4.7,
    reviews: 56,
    status: 'active',
    createdAt: '2024-01-07',
    updatedAt: '2024-01-07',
  },
  {
    id: 'prod-7',
    vendorId: 'vendor-2',
    name: 'Premium Turkey',
    description: 'Locally raised turkey, perfect for special occasions. Tender and flavorful meat.',
    price: 18000,
    category: 'Poultry',
    unit: 'piece',
    stock: 15,
    images: ['https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=400&h=400&fit=crop'],
    organic: false,
    rating: 4.9,
    reviews: 23,
    status: 'active',
    createdAt: '2024-01-09',
    updatedAt: '2024-01-09',
  },
  // Harvest King Grains products
  {
    id: 'prod-8',
    vendorId: 'vendor-3',
    name: 'Premium Local Rice',
    description: 'High-quality locally sourced rice. Long grain, aromatic, and perfect for any meal.',
    price: 35000,
    category: 'Grains',
    unit: 'bag',
    stock: 100,
    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop'],
    organic: false,
    rating: 4.9,
    reviews: 156,
    status: 'active',
    createdAt: '2024-01-03',
    updatedAt: '2024-01-03',
  },
  {
    id: 'prod-9',
    vendorId: 'vendor-3',
    name: 'Honey Beans',
    description: 'Premium honey beans, perfect for making traditional Nigerian dishes. Clean and stone-free.',
    price: 8500,
    category: 'Grains',
    unit: 'bag',
    stock: 75,
    images: ['https://images.unsplash.com/photo-1551462147-37885acc36f1?w=400&h=400&fit=crop'],
    organic: false,
    rating: 4.7,
    reviews: 78,
    status: 'active',
    createdAt: '2024-01-06',
    updatedAt: '2024-01-06',
  },
  {
    id: 'prod-10',
    vendorId: 'vendor-3',
    name: 'Yellow Maize',
    description: 'Fresh yellow maize for making pap, cornmeal, or animal feed. Dry and properly stored.',
    price: 15000,
    category: 'Grains',
    unit: 'bag',
    stock: 90,
    images: ['https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=400&fit=crop'],
    organic: false,
    rating: 4.6,
    reviews: 45,
    status: 'active',
    createdAt: '2024-01-11',
    updatedAt: '2024-01-11',
  },
  {
    id: 'prod-11',
    vendorId: 'vendor-1',
    name: 'Fresh Oranges',
    description: 'Sweet and juicy oranges, perfect for juicing or eating fresh. Rich in Vitamin C.',
    price: 3000,
    category: 'Fruits',
    unit: 'dozen',
    stock: 65,
    images: ['https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=400&fit=crop'],
    organic: true,
    rating: 4.8,
    reviews: 52,
    status: 'active',
    createdAt: '2024-01-14',
    updatedAt: '2024-01-14',
  },
  {
    id: 'prod-12',
    vendorId: 'vendor-3',
    name: 'Groundnuts (Peanuts)',
    description: 'Fresh roasted groundnuts, perfect for snacking or making groundnut soup.',
    price: 2500,
    category: 'Grains',
    unit: 'kg',
    stock: 200,
    images: ['https://images.unsplash.com/photo-1567892320421-1c657571ea4a?w=400&h=400&fit=crop'],
    organic: false,
    rating: 4.5,
    reviews: 34,
    status: 'active',
    createdAt: '2024-01-13',
    updatedAt: '2024-01-13',
  },
]

const sampleUsers: User[] = [
  {
    id: 'user-vendor-1',
    email: 'greenvalley@example.com',
    name: 'John Adeyemi',
    phone: '+234 801 234 5678',
    role: 'vendor',
    createdAt: '2023-01-15',
    verified: true,
  },
  {
    id: 'user-vendor-2',
    email: 'sunrise@example.com',
    name: 'Amina Hassan',
    phone: '+234 802 345 6789',
    role: 'vendor',
    createdAt: '2023-03-20',
    verified: true,
  },
  {
    id: 'user-vendor-3',
    email: 'harvestking@example.com',
    name: 'Chukwu Emeka',
    phone: '+234 803 456 7890',
    role: 'vendor',
    createdAt: '2022-11-10',
    verified: true,
  },
]

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      isAuthenticated: false,
      pendingVerification: null,
      users: sampleUsers,
      vendors: sampleVendors,
      products: sampleProducts,
      orders: [],
      cart: [],
      likedProducts: [],
      
      // Auth actions
      signUp: async (data) => {
        const { users } = get()
        
        // Check if email already exists
        const existingUser = users.find(u => u.email === data.email)
        if (existingUser) {
          return { success: false, message: 'Email already registered' }
        }
        
        // Generate verification code
        const verificationCode = generateVerificationCode()
        
        set({
          pendingVerification: { 
            email: data.email, 
            code: verificationCode,
            userData: {
              name: data.name,
              email: data.email,
              phone: data.phone,
              role: data.role,
              password: data.password,
            }
          }
        })
        
        return { 
          success: true, 
          message: 'Please verify your email.',
          verificationCode
        }
      },
      
      verifyEmail: async (email, code) => {
        const { pendingVerification, users } = get()
        
        if (!pendingVerification || pendingVerification.email !== email) {
          return { success: false, message: 'No pending verification for this email' }
        }
        
        if (pendingVerification.code !== code) {
          return { success: false, message: 'Invalid verification code' }
        }
        
        // Create verified user
        const newUser: User = {
          id: generateId(),
          email: pendingVerification.userData.email!,
          name: pendingVerification.userData.name!,
          phone: pendingVerification.userData.phone!,
          role: pendingVerification.userData.role!,
          createdAt: new Date().toISOString(),
          verified: true,
        }
        
        // Store password
        passwordStore[email] = pendingVerification.userData.password!
        
        set({
          users: [...users, newUser],
          pendingVerification: null,
          currentUser: newUser,
          isAuthenticated: true,
        })
        
        return { success: true, message: 'Email verified successfully!' }
      },
      
      signIn: async (email, password, role) => {
        const { users } = get()
        
        const user = users.find(u => u.email === email)
        
        if (!user) {
          return { success: false, message: 'User not found' }
        }
        
        // For demo users, accept any password
        const isDemoUser = sampleUsers.some(u => u.email === email)
        if (!isDemoUser && passwordStore[email] !== password) {
          return { success: false, message: 'Invalid password' }
        }
        
        if (user.role !== role) {
          return { success: false, message: `This account is registered as a ${user.role}, not a ${role}` }
        }
        
        set({ currentUser: user, isAuthenticated: true })
        
        return { success: true, message: 'Signed in successfully!' }
      },
      
      signOut: () => {
        set({ currentUser: null, isAuthenticated: false })
      },
      
      // Vendor actions
      registerVendor: async (data) => {
        const { currentUser, vendors } = get()
        
        if (!currentUser) {
          return { success: false, message: 'Must be logged in to register as vendor' }
        }
        
        const existingVendor = vendors.find(v => v.userId === currentUser.id)
        if (existingVendor) {
          return { success: false, message: 'You are already registered as a vendor' }
        }
        
        const newVendor: Vendor = {
          id: generateId(),
          userId: currentUser.id,
          farmName: data.farmName,
          email: data.email,
          phone: data.phone,
          location: data.location,
          description: data.description,
          avatar: data.avatar,
          coverImage: data.coverImage,
          specialties: data.specialties,
          verified: true,
          status: 'approved',
          rating: 0,
          totalReviews: 0,
          totalSales: 0,
          joinedAt: new Date().toISOString(),
        }
        
        set(state => ({ vendors: [...state.vendors, newVendor] }))
        
        return { success: true, message: 'Vendor registration successful!' }
      },

      updateVendor: (vendorId, updates) => {
        set(state => ({
          vendors: state.vendors.map(v =>
            v.id === vendorId ? { ...v, ...updates } : v
          )
        }))
      },
      
      // Product actions
      addProduct: async (productData) => {
        const newProduct: Product = {
          ...productData,
          id: generateId(),
          rating: 0,
          reviews: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        
        set(state => ({ products: [...state.products, newProduct] }))
        
        return { success: true, message: 'Product added successfully!', product: newProduct }
      },
      
      updateProduct: async (productId, updates) => {
        set(state => ({
          products: state.products.map(p =>
            p.id === productId
              ? { ...p, ...updates, updatedAt: new Date().toISOString() }
              : p
          )
        }))
        
        return { success: true, message: 'Product updated successfully!' }
      },
      
      deleteProduct: async (productId) => {
        set(state => ({
          products: state.products.filter(p => p.id !== productId)
        }))
        
        return { success: true, message: 'Product deleted successfully!' }
      },
      
      // Like actions
      toggleLike: (productId) => {
        set(state => {
          const isLiked = state.likedProducts.includes(productId)
          return {
            likedProducts: isLiked
              ? state.likedProducts.filter(id => id !== productId)
              : [...state.likedProducts, productId]
          }
        })
      },
      
      // Cart actions
      addToCart: (productId, quantity) => {
        set(state => {
          const existingItem = state.cart.find(item => item.productId === productId)
          
          if (existingItem) {
            return {
              cart: state.cart.map(item =>
                item.productId === productId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            }
          }
          
          return { cart: [...state.cart, { productId, quantity }] }
        })
      },
      
      removeFromCart: (productId) => {
        set(state => ({
          cart: state.cart.filter(item => item.productId !== productId)
        }))
      },
      
      updateCartQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId)
          return
        }
        
        set(state => ({
          cart: state.cart.map(item =>
            item.productId === productId ? { ...item, quantity } : item
          )
        }))
      },
      
      clearCart: () => {
        set({ cart: [] })
      },
      
      // Order actions
      createOrder: (orderData) => {
        const { currentUser, products } = get()
        
        if (!currentUser) return
        
        const newOrder: Order = {
          id: generateId(),
          userId: currentUser.id,
          items: orderData.items,
          subtotal: orderData.subtotal,
          deliveryFee: orderData.deliveryFee,
          total: orderData.total,
          status: 'confirmed',
          shippingDetails: orderData.shippingDetails,
          paymentMethod: orderData.paymentMethod,
          createdAt: new Date().toISOString(),
        }
        
        // Update product stock
        set(state => ({
          orders: [...state.orders, newOrder],
          products: state.products.map(p => {
            const orderItem = orderData.items.find(item => item.productId === p.id)
            if (orderItem) {
              return { ...p, stock: Math.max(0, p.stock - orderItem.quantity) }
            }
            return p
          })
        }))
      },
      
      updateOrderStatus: (orderId, status) => {
        set(state => ({
          orders: state.orders.map(o =>
            o.id === orderId ? { ...o, status } : o
          )
        }))
      },
    }),
    {
     name: 'agrolink-storage',
      skipHydration: true,
      partialize: (state) => ({
        users: state.users,
        vendors: state.vendors,
        products: state.products,
        orders: state.orders,
        cart: state.cart,
        likedProducts: state.likedProducts,
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Categories data
export const CATEGORIES = [
  {
    id: 'vegetables',
    name: 'Vegetables',
    icon: '🥬',
    description: 'Fresh vegetables straight from the farm',
    subcategories: ['Tomatoes', 'Spinach', 'Carrots', 'Pepper', 'Onions', 'Cabbage'],
  },
  {
    id: 'fruits',
    name: 'Fruits',
    icon: '🍎',
    description: 'Seasonal fruits picked at peak ripeness',
    subcategories: ['Oranges', 'Mangoes', 'Watermelon', 'Pineapple', 'Bananas', 'Pawpaw'],
  },
  {
    id: 'grains',
    name: 'Grains & Cereals',
    icon: '🌾',
    description: 'Rice, beans, maize and other staple grains',
    subcategories: ['Rice', 'Beans', 'Maize', 'Millet', 'Sorghum', 'Groundnuts'],
  },
  {
    id: 'poultry',
    name: 'Poultry',
    icon: '🍗',
    description: 'Fresh poultry and egg products',
    subcategories: ['Chicken', 'Turkey', 'Duck', 'Eggs', 'Quail'],
  },
  {
    id: 'dairy',
    name: 'Dairy',
    icon: '🥛',
    description: 'Fresh milk and dairy products',
    subcategories: ['Fresh Milk', 'Yoghurt', 'Cheese', 'Butter'],
  },
  {
    id: 'meat',
    name: 'Meat',
    icon: '🥩',
    description: 'Fresh beef, goat, and other meats',
    subcategories: ['Beef', 'Goat', 'Pork', 'Lamb'],
  },
  {
    id: 'fish',
    name: 'Fish & Seafood',
    icon: '🐟',
    description: 'Fresh and smoked fish from local waters',
    subcategories: ['Catfish', 'Tilapia', 'Mackerel', 'Crayfish', 'Smoked Fish'],
  },
  {
    id: 'herbs',
    name: 'Herbs & Spices',
    icon: '🌿',
    description: 'Fresh and dried herbs and spices',
    subcategories: ['Ginger', 'Garlic', 'Turmeric', 'Pepper', 'Cinnamon'],
  },
]
export const UNITS = ['kg', 'g', 'bunch', 'piece', 'dozen', 'crate', 'bag', 'basket', 'litre']
