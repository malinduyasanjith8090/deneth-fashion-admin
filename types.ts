export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'Men' | 'Women';
  subCategory: string;
  price: number;
  stock: number;
  inStock: boolean;
  isNewArrival: boolean;
  sizes: string[];
  colors: string[];
  images: string[];
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  customerCity: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod: 'COD' | 'Bank Transfer';
  date: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  active: boolean;
  position: number;
  buttonText?: string;
  buttonLink?: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  todaysOrders: number;
  lowStockProducts: number;
}

export interface SalesData {
  name: string;
  sales: number;
}

export interface OrderStatusData {
  name: string;
  value: number;
}