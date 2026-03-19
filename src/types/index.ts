export type Category = 'Monitores' | 'Tarjetas Gráficas' | 'Procesadores' | 'Periféricos' | 'Consolas' | 'Accesorios';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  discountPrice?: number;
  description: string;
  images: string[];
  stock: number;
  featured: boolean;
  specs: {
    label: string;
    value: string;
  }[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
}

export interface Order {
  id: string;
  userId: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'Procesando' | 'Enviado' | 'Entregado' | 'Cancelado';
}
