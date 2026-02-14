import { Product, Order, Banner } from '../types';

export const mockProducts: Product[] = [
  {
    id: 'P001',
    name: 'Classic Black T-Shirt',
    description: 'Premium cotton t-shirt',
    category: 'Men',
    subCategory: 'T-Shirts',
    price: 2500,
    stock: 45,
    inStock: true,
    isNewArrival: false,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black'],
    images: ['https://picsum.photos/400/400?random=1'],
    createdAt: '2023-10-01'
  },
  {
    id: 'P002',
    name: 'Floral Summer Dress',
    description: 'Lightweight summer dress with floral pattern',
    category: 'Women',
    subCategory: 'Dresses',
    price: 4500,
    stock: 8,
    inStock: true,
    isNewArrival: true,
    sizes: ['S', 'M', 'L'],
    colors: ['Red', 'Blue'],
    images: ['https://picsum.photos/400/400?random=2'],
    createdAt: '2023-10-05'
  },
  {
    id: 'P003',
    name: 'Slim Fit Jeans',
    description: 'Stretchable denim jeans',
    category: 'Men',
    subCategory: 'Jeans',
    price: 3800,
    stock: 0,
    inStock: false,
    isNewArrival: false,
    sizes: ['30', '32', '34'],
    colors: ['Blue'],
    images: ['https://picsum.photos/400/400?random=3'],
    createdAt: '2023-09-20'
  }
];

export const mockOrders: Order[] = [
  {
    id: 'ORD-1001',
    customerName: 'John Doe',
    customerPhone: '0771234567',
    customerEmail: 'john@example.com',
    customerAddress: '123 Main St',
    customerCity: 'Colombo',
    items: [
      {
        productId: 'P001',
        productName: 'Classic Black T-Shirt',
        productImage: 'https://picsum.photos/400/400?random=1',
        size: 'L',
        color: 'Black',
        quantity: 2,
        price: 2500
      }
    ],
    subtotal: 5000,
    shippingFee: 250,
    total: 5250,
    status: 'Pending',
    paymentMethod: 'COD',
    date: new Date().toISOString()
  },
  {
    id: 'ORD-1002',
    customerName: 'Jane Smith',
    customerPhone: '0719876543',
    customerEmail: 'jane@example.com',
    customerAddress: '45 Lake Rd',
    customerCity: 'Kandy',
    items: [
      {
        productId: 'P002',
        productName: 'Floral Summer Dress',
        productImage: 'https://picsum.photos/400/400?random=2',
        size: 'M',
        color: 'Red',
        quantity: 1,
        price: 4500
      }
    ],
    subtotal: 4500,
    shippingFee: 500,
    total: 5000,
    status: 'Delivered',
    paymentMethod: 'Bank Transfer',
    date: '2023-10-10T14:30:00.000Z'
  }
];

export const mockBanners: Banner[] = [
  {
    id: 'B001',
    title: 'New Collection 2024',
    subtitle: 'Discover the latest trends',
    image: 'https://picsum.photos/1200/400?random=10',
    active: true,
    position: 1,
    buttonText: 'Shop Now'
  },
  {
    id: 'B002',
    title: 'Summer Sale',
    subtitle: 'Up to 50% off',
    image: 'https://picsum.photos/1200/400?random=11',
    active: true,
    position: 2,
    buttonText: 'View Deals'
  }
];