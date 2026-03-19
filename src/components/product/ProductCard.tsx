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
import type { Product } from '../../types';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { dispatch } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  const discountPercent = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card 
        component={Link} 
        to={`/product/${product.id}`}
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          textDecoration: 'none',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {discountPercent && (
          <Chip
            label={`-${discountPercent}%`}
            color="primary"
            size="small"
            sx={{ 
              position: 'absolute', 
              top: 10, 
              left: 10, 
              zIndex: 1, 
              fontWeight: 700 
            }}
          />
        )}
        
        <Box sx={{ position: 'relative', pt: '100%', overflow: 'hidden' }}>
          <CardMedia
            component="img"
            image={product.images[0]}
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
          <Box className="card-actions" sx={{
            position: 'absolute',
            bottom: -50,
            left: 0,
            right: 0,
            height: 50,
            bgcolor: 'rgba(255,255,255,0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'bottom 0.3s ease',
            gap: 2
          }}>
            <Tooltip title="Vista Rápida">
              <IconButton size="small"><Eye size={18} /></IconButton>
            </Tooltip>
            <Tooltip title="Favoritos">
              <IconButton size="small"><Heart size={18} /></IconButton>
            </Tooltip>
          </Box>
        </Box>

        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
            {product.category}
          </Typography>
          <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 700, mb: 1, lineHeight: 1.2, height: '2.4em', overflow: 'hidden' }}>
            {product.name}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            {product.discountPrice ? (
              <>
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800 }}>
                  ${product.discountPrice}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through', opacity: 0.6 }}>
                  ${product.price}
                </Typography>
              </>
            ) : (
              <Typography variant="h6" color="secondary.main" sx={{ fontWeight: 800 }}>
                ${product.price}
              </Typography>
            )}
          </Box>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<ShoppingCart size={18} />}
            onClick={handleAddToCart}
            sx={{ mt: 'auto' }}
          >
            Añadir
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
