import type { Product } from '../types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Monitor Gaming UltraWide 34"',
    brand: 'DevilTech',
    category: 'Monitores',
    price: 850,
    discountPrice: 799,
    description: 'Experimenta una inmersión total con el monitor UltraWide de DevilTech. Resolución 4K, 144Hz y tiempo de respuesta de 1ms.',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1547119957-637f8679db1e?q=80&w=1000&auto=format&fit=crop'
    ],
    stock: 15,
    featured: true,
    specs: [
      { label: 'Resolución', value: '3440 x 1440' },
      { label: 'Tasa de Refresco', value: '144Hz' },
      { label: 'Panel', value: 'IPS' }
    ]
  },
  {
    id: '2',
    name: 'NVIDIA RTX 4090 Phantom',
    brand: 'DevilCore',
    category: 'Tarjetas Gráficas',
    price: 2100,
    description: 'La tarjeta gráfica definitiva. Domina cualquier juego con trazado de rayos y DLSS 3.0.',
    images: [
      'https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=1000&auto=format&fit=crop'
    ],
    stock: 5,
    featured: true,
    specs: [
      { label: 'VRAM', value: '24GB GDDR6X' },
      { label: 'Consumo', value: '450W' }
    ]
  },
  {
    id: '3',
    name: 'Procesador Intel i9-14900K',
    brand: 'Intel',
    category: 'Procesadores',
    price: 650,
    description: 'Potencia pura para gaming y streaming simultáneo. El procesador más rápido del mercado.',
    images: [
      'https://images.unsplash.com/photo-1591405351990-4726e331f141?q=80&w=1000&auto=format&fit=crop'
    ],
    stock: 20,
    featured: false,
    specs: [
      { label: 'Núcleos', value: '24' },
      { label: 'Hilos', value: '32' }
    ]
  },
  {
    id: '4',
    name: 'Teclado Mecánico RGB DevilStroke',
    brand: 'Devil Gaming',
    category: 'Periféricos',
    price: 120,
    discountPrice: 99,
    description: 'Switches ópticos ultra rápidos y retroiluminación RGB totalmente personalizable.',
    images: [
      'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=1000&auto=format&fit=crop'
    ],
    stock: 50,
    featured: true,
    specs: [
      { label: 'Switches', value: 'Ópticos Rojos' },
      { label: 'Conexión', value: 'USB-C' }
    ]
  },
  {
    id: '5',
    name: 'PlayStation 5 Pro',
    brand: 'Sony',
    category: 'Consolas',
    price: 799,
    description: 'La nueva versión de la consola más potente de Sony. 4K real a 60 FPS estables.',
    images: [
      '/ps5pro.png'
    ],
    stock: 10,
    featured: true,
    specs: [
      { label: 'Almacenamiento', value: '2TB SSD' },
      { label: 'Gráficos', value: '8K Ready' }
    ]
  }
];
