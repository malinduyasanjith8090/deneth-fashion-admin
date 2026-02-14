// src/services/api.ts

// Use environment variable with fallback for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://deneth-fashion-backend.vercel.app';
const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY || 'supersecretadminkey123';

// Optional: Add a log to verify the URL in the console (remove in production)
console.log('Admin API Base URL:', API_BASE_URL);

export interface Product {
  _id: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  category: 'Men' | 'Women';
  subCategory: string;
  sizes: string[];
  colors: Array<{ name: string; image: string }> | string[];
  images: string[];
  isNew: boolean;
  inStock: boolean;
  stock: number;
  stockQuantity: number;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Helper to map backend product to frontend format
const mapProduct = (product: any): Product => ({
  ...product,
  id: product._id,
  stock: product.stockQuantity || 0,
  // Ensure colors are in the correct format if they come as strings
  colors: Array.isArray(product.colors) 
    ? product.colors.map((c: any) => typeof c === 'string' ? { name: c, image: '' } : c) 
    : []
});

export const api = {
  // Products - Public routes (no auth needed)
  getProducts: async (): Promise<{ success: boolean; products: Product[] }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`);
      const data = await response.json();
      
      if (data.success && data.products) {
        const mappedProducts = data.products.map(mapProduct);
        return { success: true, products: mappedProducts };
      }
      return { success: false, products: [] };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { success: false, products: [] };
    }
  },
  
  getProduct: async (id: string): Promise<{ success: boolean; product: Product | null }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
      const data = await response.json();
      if (data.success && data.product) {
        return { success: true, product: mapProduct(data.product) };
      }
      return { success: false, product: null };
    } catch (error) {
      console.error('Error fetching product:', error);
      return { success: false, product: null };
    }
  },
  
  // Admin routes - Require x-admin-key header
  createProduct: async (formData: FormData): Promise<{ success: boolean; product: Product | null; message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: {
          'x-admin-key': ADMIN_KEY, // ⬅️ CRITICAL: Add admin key here
        },
        body: formData, // Browser sets Content-Type automatically
      });
      const data = await response.json();
      if (data.success && data.product) {
        return { success: true, product: mapProduct(data.product), message: data.message };
      }
      return { success: false, product: null, message: data.message || 'Failed to create product' };
    } catch (error: any) {
      console.error('Error creating product:', error);
      return { success: false, product: null, message: error.message || 'Failed to create product' };
    }
  },
  
  updateProduct: async (id: string, formData: FormData): Promise<{ success: boolean; product: Product | null; message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'x-admin-key': ADMIN_KEY, // ⬅️ CRITICAL: Add admin key here
        },
        body: formData,
      });
      const data = await response.json();
      if (data.success && data.product) {
        return { success: true, product: mapProduct(data.product), message: data.message };
      }
      return { success: false, product: null, message: data.message || 'Failed to update product' };
    } catch (error: any) {
      console.error('Error updating product:', error);
      return { success: false, product: null, message: error.message || 'Failed to update product' };
    }
  },
  
  deleteProduct: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-key': ADMIN_KEY, // ⬅️ CRITICAL: Add admin key here
        },
      });
      return await response.json();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      return { success: false, message: error.message || 'Failed to delete product' };
    }
  },
  
  // Orders - Some are public, some are admin
  getOrders: async (): Promise<{ success: boolean; orders: any[] }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: {
          'x-admin-key': ADMIN_KEY, // ⬅️ Admin route needs key
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { success: false, orders: [] };
    }
  },
  
  getOrder: async (id: string): Promise<{ success: boolean; order: any }> => {
    try {
      // This is a public route (by orderId), so no admin key needed
      const response = await fetch(`${API_BASE_URL}/api/orders/${id}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching order:', error);
      return { success: false, order: null };
    }
  },
  
  updateOrderStatus: async (id: string, status: string): Promise<{ success: boolean; order: any }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_KEY, // ⬅️ Admin route needs key
        },
        body: JSON.stringify({ status }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating order:', error);
      return { success: false, order: null };
    }
  },
  
  // Banners - Some are public, some are admin
  getBanners: async (): Promise<{ success: boolean; banners: any[] }> => {
    try {
      // This is an admin route to get all banners (including inactive)
      const response = await fetch(`${API_BASE_URL}/api/banners`, {
        headers: {
          'x-admin-key': ADMIN_KEY, // ⬅️ Admin route needs key
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching banners:', error);
      return { success: false, banners: [] };
    }
  },
  
  // Dashboard Stats - Admin only
  getDashboardStats: async (): Promise<{ success: boolean; stats: any }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
        headers: {
          'x-admin-key': ADMIN_KEY, // ⬅️ Admin route needs key
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return { success: false, stats: null };
    }
  },
};

export const orderAPI = {
  getOrders: api.getOrders,
  getOrder: api.getOrder,
  updateOrderStatus: api.updateOrderStatus,
};