"use client";

import React from 'react';
import { 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  Chip, 
  IconButton,
  Tooltip
} from '@mui/material';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import Link from 'next/link';

import { useCart } from '../../context/CartContext';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: any;
  layout?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, layout = 'grid' }) => {
  const { dispatch } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  // Support both Supabase total price and mock data discount prices
  const displayPrice = product.price;
  const imageToShow = product.image || (product.images && product.images[0]) || '/placeholder.png';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card 
        component={Link} 
        href={`/product/${product.id}`}
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: layout === 'list' ? { xs: 'column', sm: 'row' } : 'column',
          textDecoration: 'none',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3,
          border: '1px solid rgba(0,0,0,0.05)',
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
          }
        }}
      >
        <Box sx={{ 
          position: 'relative', 
          width: layout === 'list' ? { xs: '100%', sm: '30%' } : '100%',
          minWidth: layout === 'list' ? { sm: '200px' } : 'auto',
          pt: layout === 'list' ? { xs: '100%', sm: '0' } : '100%',
          overflow: 'hidden' 
        }}>
          <CardMedia
            component="img"
            image={imageToShow}
            alt={product.name}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s ease',
              '&:hover': {
                transform: 'scale(1.1)',
              }
            }}
          />
        </Box>

        <CardContent sx={{ 
          flexGrow: 1, 
          p: 2.5,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 1 }}>
            {product.category?.name || 'Sin Categoría'}
          </Typography>
          <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 800, mb: 1, lineHeight: 1.2, height: layout === 'list' ? 'auto' : '2.4em', overflow: 'hidden', color: '#333' }}>
            {product.name}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
            <Typography variant="h6" color="primary.main" sx={{ fontWeight: 900 }}>
              ${displayPrice.toLocaleString('es-ES')}
            </Typography>
          </Box>

          <Button
            fullWidth={layout !== 'list'}
            variant="contained"
            color="primary"
            startIcon={<ShoppingCart size={18} />}
            onClick={handleAddToCart}
            sx={{ 
              mt: layout === 'list' ? 1 : 'auto',
              width: layout === 'list' ? 'fit-content' : '100%',
              py: 1, 
              px: layout === 'list' ? 4 : undefined,
              fontWeight: 800, 
              borderRadius: 2,
              boxShadow: 'none',
              '&:hover': { boxShadow: '0 4px 12px rgba(204, 0, 0, 0.2)' }
            }}
          >
            Añadir al Carrito
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
