export interface Product {
  id: number;
  name: string;
  barcode: string;
  stockCode?: string;
  description?: string;
  price?: number;
  stock?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BarcodeRequest {
  productName: string;
  description?: string;
  price?: number;
  category?: string;
  stock?: number;
  barcodeType: 'EAN13' | 'CODE128' | 'QR_CODE';
}

export interface BarcodeImageProps {
  barcode: string;
  type: 'EAN13' | 'CODE128' | 'QR_CODE';
  width?: number;
  height?: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  address: string;
  phone?: string;
  email?: string;
  cargoCampaignCode?: string;
  barcode?: string;
  stockCode?: string;
  deliveryAddress?: string;
  brand?: string;
  totalItems: number;
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  orderItems?: OrderItem[];
}

export interface OrderItem {
  id: number;
  product: Product;
  stockCode?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
}

export interface OrderRequest {
  customerName: string;
  address: string;
  phone?: string;
  email?: string;
  cargoCampaignCode?: string;
  items: OrderItemRequest[];
}

export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'ADMIN' | 'USER' | 'MANAGER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'USER' | 'MANAGER';
}

export interface OrderImportResult {
  success: boolean;
  message?: string;
  errorMessage?: string;
  order?: Order;
  productCode?: string;
  customerName?: string;
}

export interface ExcelImportResponse {
  results: OrderImportResult[];
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  success: boolean;
}
