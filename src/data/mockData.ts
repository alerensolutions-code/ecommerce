import type { Product } from '../types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Monitor Gaming UltraWide 34"',
    brand: 'DevilTech',
    category_id: 'monitores-uuid',
    price: 850,
    discountPrice: 799,
    description: 'Experimenta una inmersión total con el monitor UltraWide de DevilTech. Resolución 4K, 144Hz y tiempo de respuesta de 1ms.',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1547119957-637f8679db1e?q=80&w=1000&auto=format&fit=crop'
    ],
    stock: 15,
    featured: true
  },
  {
    id: '2',
    name: 'NVIDIA RTX 4090 Phantom',
    brand: 'DevilCore',
    category_id: 'graficas-uuid',
    price: 2100,
    description: 'La tarjeta gráfica definitiva. Domina cualquier juego con trazado de rayos y DLSS 3.0.',
    images: [
      'https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=1000&auto=format&fit=crop'
    ],
    stock: 5,
    featured: true
  },
  {
    id: '3',
    name: 'Procesador Intel i9-14900K',
    brand: 'Intel',
    category_id: 'procesadores-uuid',
    price: 650,
    description: 'Potencia pura para gaming y streaming simultáneo. El procesador más rápido del mercado.',
    images: [
      'https://images.unsplash.com/photo-1591405351990-4726e331f141?q=80&w=1000&auto=format&fit=crop'
    ],
    stock: 20,
    featured: false
  },
  {
    id: '4',
    name: 'Teclado Mecánico RGB DevilStroke',
    brand: 'Devil Gaming',
    category_id: 'perifericos-uuid',
    price: 120,
    discountPrice: 99,
    description: 'Switches ópticos ultra rápidos y retroiluminación RGB totalmente personalizable.',
    images: [
      'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=1000&auto=format&fit=crop'
    ],
    stock: 50,
    featured: true
  },
  {
    id: '5',
    name: 'PlayStation 5 Pro',
    brand: 'Sony',
    category_id: 'consolas-uuid',
    price: 799,
    description: 'La nueva versión de la consola más potente de Sony. 4K real a 60 FPS estables.',
    images: [
      '/ps5pro.png'
    ],
    stock: 10,
    featured: true
  }
];

export const categories: string[] = [
  'Monitores',
  'Tarjetas Gráficas',
  'Procesadores',
  'Periféricos',
  'Consolas',
  'Accesorios'
];
