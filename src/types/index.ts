export type Category = string;

export interface Product {
  id: string;
  name: string;
  brand: string;
  category_id: string; // UUID from Supabase
  category?: { name: string }; // For joins
  price: number;
  discountPrice?: number;
  description: string;
  image?: string;
  images?: string[];
  stock: number;
  featured: boolean;
  specs?: {
    label: string;
    value: string;
  }[];
  created_at?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'admin';
}

export interface Order {
  id: string;
  userId?: string;
  customer_name: string;
  email?: string;
  phone: string; // Mandatory now
  date?: string;
  items: CartItem[];
  total: number;
  status: 'Procesando' | 'Enviado' | 'Entregado' | 'Cancelado';
}
