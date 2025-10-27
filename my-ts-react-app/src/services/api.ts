import axios from 'axios';
import { Product, BarcodeRequest, Order, OrderRequest, OrderItem, User, LoginRequest, RegisterRequest, AuthResponse, ExcelImportResponse } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Her istekte token ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const productApi = {
  // Tüm ürünleri getir
  getAllProducts: async (): Promise<Product[]> => {
    const response = await api.get('/barcode/products');
    return response.data;
  },

  // ID ile ürün getir
  getProductById: async (id: number): Promise<Product> => {
    const response = await api.get(`/barcode/products/${id}`);
    return response.data;
  },

  // Barkod ile ürün getir
  getProductByBarcode: async (barcode: string): Promise<Product> => {
    const response = await api.get(`/barcode/products/barcode/${barcode}`);
    return response.data;
  },

  // Ürün ara
  searchProducts: async (query: string): Promise<Product[]> => {
    const response = await api.get(`/barcode/products/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Kategoriye göre ürünleri getir
  getProductsByCategory: async (category: string): Promise<Product[]> => {
    const response = await api.get(`/barcode/products/category/${encodeURIComponent(category)}`);
    return response.data;
  },

  // Yeni ürün oluştur
  createProduct: async (request: BarcodeRequest): Promise<Product> => {
    const response = await api.post('/barcode/generate', request);
    return response.data;
  },

  // Ürün güncelle
  updateProduct: async (id: number, product: Partial<Product>): Promise<Product> => {
    const response = await api.put(`/barcode/products/${id}`, product);
    return response.data;
  },

  // Ürün sil
  deleteProduct: async (id: number): Promise<void> => {
    await api.delete(`/barcode/products/${id}`);
  },
};

export const barcodeApi = {
  // Barkod resmi getir
  getBarcodeImage: (barcode: string, type: string = 'QR_CODE', width: number = 300, height: number = 300): string => {
    return `${API_BASE_URL}/barcode/image/${barcode}?type=${type}&width=${width}&height=${height}`;
  },

  // Basit barkod oluştur
  generateSimpleBarcode: async (text: string, type: string = 'QR_CODE'): Promise<any> => {
    const response = await api.post('/simple-barcode/generate', { text, type });
    return response.data;
  },

  // Barkod test
  testBarcode: async (): Promise<any> => {
    const response = await api.get('/simple-barcode/test');
    return response.data;
  },
};

export const orderApi = {
  // Yeni sipariş oluştur
  createOrder: async (request: OrderRequest): Promise<Order> => {
    const response = await api.post('/orders', request);
    return response.data;
  },

  // Tüm siparişleri getir
  getAllOrders: async (): Promise<Order[]> => {
    const response = await api.get('/orders');
    return response.data;
  },

  // ID ile sipariş getir
  getOrderById: async (id: number): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Sipariş numarası ile sipariş getir
  getOrderByNumber: async (orderNumber: string): Promise<Order> => {
    const response = await api.get(`/orders/number/${orderNumber}`);
    return response.data;
  },

  // Duruma göre siparişleri getir
  getOrdersByStatus: async (status: string): Promise<Order[]> => {
    const response = await api.get(`/orders/status/${status}`);
    return response.data;
  },

  // Sipariş ara
  searchOrders: async (query: string): Promise<Order[]> => {
    const response = await api.get(`/orders/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Sipariş kalemlerini getir
  getOrderItems: async (orderId: number): Promise<OrderItem[]> => {
    const response = await api.get(`/orders/${orderId}/items`);
    return response.data;
  },

  // Sipariş durumunu güncelle
  updateOrderStatus: async (id: number, status: string): Promise<Order> => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Sipariş sil
  deleteOrder: async (id: number): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },

  // Sipariş etiketi oluştur
  generateOrderLabel: (orderId: number): string => {
    return `${API_BASE_URL}/orders/${orderId}/label`;
  },
};

export const authApi = {
  // Giriş yap
  login: async (request: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', request);
    return response.data;
  },

  // Kayıt ol
  register: async (request: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', request);
    return response.data;
  },

  // Admin kullanıcısı oluştur
  initAdmin: async (): Promise<any> => {
    const response = await api.post('/auth/init-admin');
    return response.data;
  },
};

export const userApi = {
  // Tüm kullanıcıları getir (Admin)
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  // Kullanıcı güncelle (Admin)
  updateUser: async (id: number, user: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${id}`, user);
    return response.data;
  },

  // Kullanıcı şifresini güncelle (Admin)
  updateUserPassword: async (id: number, password: string): Promise<User> => {
    const response = await api.put(`/users/${id}/password`, { password });
    return response.data;
  },

  // Kendi şifreni güncelle (Herkes)
  updateMyPassword: async (password: string): Promise<User> => {
    const response = await api.put(`/users/me/password`, { password });
    return response.data;
  },

  // Kullanıcıyı aktifleştir (Admin)
  activateUser: async (id: number): Promise<User> => {
    const response = await api.put(`/users/${id}/activate`);
    return response.data;
  },

  // Kullanıcıyı pasifleştir (Admin)
  deactivateUser: async (id: number): Promise<User> => {
    const response = await api.put(`/users/${id}/deactivate`);
    return response.data;
  },

  // Kullanıcı sil (Admin)
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

export const excelApi = {
  // Excel'den sipariş import et
  importOrders: async (file: File): Promise<ExcelImportResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/simple-excel/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Excel template indir
  downloadTemplate: (): string => {
    return `${API_BASE_URL}/excel/template`;
  },
};
