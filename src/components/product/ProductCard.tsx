"use client";

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
} from '@mui/material';
import { ShoppingCart, Check } from 'lucide-react';
import Link from 'next/link';

import Image from 'next/image';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

// Placeholder de número de WhatsApp de la tienda
const WHATSAPP_NUMBER = '5491155099149';

interface ProductCardProps {
  product: any;
  layout?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, layout = 'grid' }) => {
  const { dispatch } = useCart();
  const [isAdded, setIsAdded] = React.useState(false);

  const isOutOfStock = product.stock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    dispatch({ type: 'ADD_TO_CART', payload: product });
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const msg = encodeURIComponent(`Hola! Me gustaría consultar la disponibilidad del producto: ${product.name}`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
  };

  const displayPrice = product.price;
  const imageToShow = product.image || (product.images && product.images[0]) || '/default-gaming-product.png';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      style={{ height: '100%' }}
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
          aspectRatio: '1/1',
          overflow: 'hidden',
          borderBottom: '1.5px solid #000000',
        }}>
          <Image
            src={imageToShow}
            alt={product.name}
            fill
            sizes={layout === 'list' ? "(max-width: 600px) 100vw, 30vw" : "(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"}
            style={{
              objectFit: 'cover',
              transition: 'transform 0.5s ease',
              filter: isOutOfStock ? 'grayscale(40%)' : 'none',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          />
          {/* Llama de descuento (Top-Left) */}
          {product.discount > 0 && !isOutOfStock && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                zIndex: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 14px',
                background: 'linear-gradient(135deg, #ff0055 0%, #ff5500 100%)',
                borderRadius: '20px 4px 20px 20px', // Flame/drop shape
                boxShadow: '0 4px 15px rgba(255, 0, 85, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <Typography
                sx={{
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                  lineHeight: 1,
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}
              >
                {product.discount}%
              </Typography>
              <Typography
                sx={{
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: '0.8rem',
                  lineHeight: 1,
                  letterSpacing: '0.5px',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  mt: 0.3,
                }}
              >
                OFF
              </Typography>
            </Box>
          )}

          {/* Cuernos gaming (Top-Right) */}
          {product.discount > 0 && !isOutOfStock && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 3,
                width: 42,
                height: 42,
                borderRadius: '50%',
                overflow: 'hidden',
                bgcolor: 'rgba(0, 0, 0, 0.65)',
                border: '1.5px solid #ff0055',
                boxShadow: '0 0 10px rgba(255, 0, 85, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: 'url(/discount_logo.png)',
                  backgroundSize: '75%',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              />
            </Box>
          )}

          {/* Sin Stock badge */}
          {isOutOfStock && (
            <Chip
              label="Sin Stock"
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                bgcolor: 'error.main',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.7rem',
              }}
            />
          )}
        </Box>

        <CardContent sx={{
          flexGrow: 1,
          p: 1.5,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5, fontSize: '0.65rem' }}>
            {product.category?.name || 'Sin Categoría'}
          </Typography>
          <Typography variant="subtitle2" component="h3" sx={{ fontWeight: 800, mb: 0.5, lineHeight: 1.2, height: layout === 'list' ? 'auto' : '2.4em', overflow: 'hidden', color: '#333', fontSize: '0.85rem' }}>
            {product.name}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1.5 }}>
            {product.discount > 0 && !isOutOfStock ? (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Typography variant="body2" sx={{ textDecoration: 'line-through', color: '#5e5858ff', fontWeight: 600, fontSize: '0.9rem' }}>
                  ${product.price.toLocaleString('es-ES')}
                </Typography>
                <Typography variant="h6" color="error.main" sx={{ fontWeight: 900, fontSize: '1.1rem' }}>
                  ${(product.price * (1 - product.discount / 100)).toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                </Typography>
              </Box>
            ) : (
              <Typography variant="h6" color={isOutOfStock ? 'text.secondary' : 'primary.main'} sx={{ fontWeight: 900, fontSize: '1.1rem' }}>
                ${displayPrice.toLocaleString('es-ES')}
              </Typography>
            )}
          </Box>

          {isOutOfStock ? (
            <Button
              fullWidth={layout !== 'list'}
              variant="outlined"
              onClick={handleWhatsApp}
              startIcon={
                <svg viewBox="0 0 24 24" width="18" height="18" fill="#25d366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              }
              sx={{
                width: '100%',
                py: 0.5,
                px: layout === 'list' ? 4 : undefined,
                fontWeight: 800,
                borderRadius: 2,
                borderColor: '#25d366',
                color: '#25d366',
                fontSize: '0.75rem',
                '&:hover': {
                  bgcolor: 'rgba(37,211,102,0.06)',
                  borderColor: '#1da851',
                }
              }}
            >
              Consultar
            </Button>
          ) : (
            <motion.div
              animate={isAdded ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.3 }}
              style={{ width: layout === 'list' ? 'fit-content' : '100%', marginTop: layout === 'list' ? 8 : 'auto' }}
            >
              <Button
                fullWidth={layout !== 'list'}
                variant="contained"
                color={isAdded ? "success" : "primary"}
                startIcon={
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isAdded ? 'check' : 'cart'}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isAdded ? <Check size={18} /> : <ShoppingCart size={18} />}
                    </motion.div>
                  </AnimatePresence>
                }
                onClick={handleAddToCart}
                disabled={isAdded}
                sx={{
                  width: '100%',
                  py: 0.5,
                  px: layout === 'list' ? 4 : undefined,
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  borderRadius: 2,
                  boxShadow: 'none',
                  transition: 'all 0.3s ease',
                  ...(isAdded ? {
                    bgcolor: '#4caf50',
                    color: 'white',
                    '&:hover': { bgcolor: '#45a049', boxShadow: 'none' },
                    '&.Mui-disabled': {
                      bgcolor: '#4caf50',
                      color: 'white',
                      opacity: 1
                    }
                  } : {
                    '&:hover': { boxShadow: '0 4px 12px rgba(204, 0, 0, 0.2)' }
                  })
                }}
              >
                {isAdded ? '¡Agregado!' : 'Añadir al Carrito'}
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
