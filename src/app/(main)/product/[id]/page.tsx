"use client";

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Divider,
  Chip,
  Stack,
  Breadcrumbs,
  Link,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  ShoppingCart,
  Check,
  MessageCircle,
  Plus,
  Minus
} from 'lucide-react';
import { useParams } from 'next/navigation';
import NextLink from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import { supabase } from '../../../../lib/supabase';
import { useCart } from '../../../../context/CartContext';
import ProductCard from '../../../../components/product/ProductCard';

const ProductDetailPage = () => {
  const { id } = useParams() as { id: string };
  const { state, dispatch } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isAdded, setIsAdded] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      setQuantity(1);

      // Fetch main product with category join
      const { data: pData } = await supabase
        .from('products')
        .select('*, category:categories(name)')
        .eq('id', id)
        .single();

      if (pData) {
        setProduct(pData);
        setSelectedImage(pData.images && pData.images[0] ? pData.images[0] : (pData.image || '/default-gaming-product.png'));

        // Fetch related products using category_id
        const { data: related } = await supabase
          .from('products')
          .select('*, category:categories(name)')
          .eq('category_id', pData.category_id)
          .neq('id', id)
          .limit(4);

        setRelatedProducts(related || []);
      }

      setLoading(false);
    };

    fetchProductData();
  }, [id]);

  const handleAddToCart = () => {
    if (isAdded) return;

    const existingItem = state.items.find(item => item.id === product.id);

    if (existingItem) {
      // Item already in cart — update quantity
      const newQty = Math.min(product.stock, existingItem.quantity + quantity);
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id: product.id, quantity: newQty } });
    } else {
      // Add to cart (adds 1), then update to desired quantity
      dispatch({ type: 'ADD_TO_CART', payload: product });
      if (quantity > 1) {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id: product.id, quantity } });
      }
    }

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  if (loading) {
    return (
      <Box sx={{ py: 20, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Cargando producto...</Typography>
      </Box>
    );
  }

  if (!product) {
    return (
      <Container sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Producto no encontrado</Typography>
        <Button component={NextLink} href="/shop" variant="contained" sx={{ mt: 2 }}>Volver a la tienda</Button>
      </Container>
    );
  }

  const categoryName = product.category?.name || 'Varios';
  const allImages = product.images && Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image || '/default-gaming-product.png'];

  return (
    <Box sx={{ bgcolor: '#f4f4f4', minHeight: '100vh', pb: 10 }}>
      <Container maxWidth="xl" sx={{ pt: 2 }}>
        {/* Top-level breadcrumbs removed — now inside the right column */}

        <Grid container spacing={4} sx={{ mt: 0 }}>
          {/* Left Column: Image Gallery */}
          <Grid size={{ xs: 12, md: 7, lg: 6 }}>
            <Box sx={{ position: 'sticky', top: 100 }}>
              {/* Flex layout: thumbnails left + main image right on desktop */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column-reverse', sm: 'row' },
                  gap: 2,
                  alignItems: 'flex-start'
                }}
              >
                {/* Thumbnails Column (vertical on desktop, horizontal on mobile) */}
                {allImages.length > 1 && (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'row', sm: 'column' },
                      gap: 1.5,
                      flexShrink: 0,
                      width: { xs: '100%', sm: '80px' },
                      overflowX: { xs: 'auto', sm: 'visible' },
                      pb: { xs: 1, sm: 0 }
                    }}
                  >
                    {allImages.map((img: string, idx: number) => (
                      <Box
                        key={idx}
                        onClick={() => setSelectedImage(img)}
                        sx={{
                          width: { xs: 64, sm: 80 },
                          height: { xs: 64, sm: 80 },
                          minWidth: { xs: 64, sm: 80 },
                          borderRadius: '10px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: '2px solid',
                          borderColor: selectedImage === img ? 'primary.main' : 'rgba(0,0,0,0.08)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: 'primary.main',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }
                        }}
                      >
                        <Box
                          component="img"
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Main Image */}
                <Box
                  sx={{
                    flex: 1,
                    aspectRatio: '1/1',
                    maxHeight: 500,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={selectedImage}
                      src={selectedImage}
                      alt={product.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: '12px'
                      }}
                    />
                  </AnimatePresence>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Right Column: Product Info */}
          <Grid size={{ xs: 12, md: 5, lg: 6 }}>
            <Box>
              {/* Breadcrumbs inside right column */}
              <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{ mb: 2, fontSize: '0.85rem' }}>
                <Link component={NextLink} href="/" color="inherit" underline="hover" sx={{ fontSize: '0.85rem' }}>Inicio</Link>
                <Link component={NextLink} href="/shop" color="inherit" underline="hover" sx={{ fontSize: '0.85rem' }}>Tienda</Link>
                <Link component={NextLink} href={`/shop?category=${categoryName}`} color="inherit" underline="hover" sx={{ fontSize: '0.85rem' }}>{categoryName}</Link>
                <Typography color="text.primary" sx={{ fontSize: '0.85rem' }}>{product.name}</Typography>
              </Breadcrumbs>

              {/* Product Name (no category chip) */}
              <Typography variant="h3" sx={{ mb: 2, fontWeight: 800 }}>{product.name}</Typography>

              {/* Price Section — inverted order for discounted products */}
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                {product.discount > 0 ? (
                  <>
                    {/* Original price crossed out FIRST */}
                    <Typography variant="h5" sx={{ textDecoration: 'line-through', color: 'text.secondary', fontWeight: 600 }}>
                      ${product.price.toLocaleString('es-ES')}
                    </Typography>
                    {/* Discounted price SECOND */}
                    <Typography variant="h3" color="error.main" sx={{ fontWeight: 800 }}>
                      ${(product.price * (1 - product.discount / 100)).toLocaleString('es-ES', { maximumFractionDigits: 0 })}
                    </Typography>
                    {/* Discount badge */}
                    <Chip
                      label={`${product.discount}% OFF`}
                      color="error"
                      sx={{
                        fontWeight: 900,
                        background: 'linear-gradient(135deg, #ff0055 0%, #ff5500 100%)',
                        border: 'none',
                        color: 'white',
                        fontSize: '0.85rem',
                        boxShadow: '0 4px 10px rgba(255, 0, 85, 0.2)'
                      }}
                    />
                  </>
                ) : (
                  <Typography variant="h3" color="primary.main" sx={{ fontWeight: 800 }}>
                    ${product.price.toLocaleString('es-ES')}
                  </Typography>
                )}
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Availability */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Disponibilidad</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: product.stock > 0 ? '#4caf50' : '#f44336' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {product.stock > 0 ? `En Stock (${product.stock} disponibles)` : 'Consultar Disponibilidad'}
                  </Typography>
                </Stack>
              </Box>

              {/* Quantity Selector + Add to Cart */}
              {product.stock > 0 && (
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                  {/* Quantity Selector */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid rgba(0,0,0,0.15)',
                      borderRadius: '10px',
                      overflow: 'hidden'
                    }}
                  >
                    <IconButton
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      disabled={quantity <= 1}
                      sx={{
                        borderRadius: 0,
                        px: 1.5,
                        py: 1.5,
                        color: quantity <= 1 ? 'text.disabled' : 'text.primary'
                      }}
                    >
                      <Minus size={18} />
                    </IconButton>
                    <Typography
                      sx={{
                        px: 2.5,
                        py: 1,
                        fontWeight: 700,
                        fontSize: '1rem',
                        minWidth: 40,
                        textAlign: 'center',
                        userSelect: 'none'
                      }}
                    >
                      {quantity}
                    </Typography>
                    <IconButton
                      onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                      disabled={quantity >= product.stock}
                      sx={{
                        borderRadius: 0,
                        px: 1.5,
                        py: 1.5,
                        color: quantity >= product.stock ? 'text.disabled' : 'text.primary'
                      }}
                    >
                      <Plus size={18} />
                    </IconButton>
                  </Box>

                  {/* Add to Cart Button */}
                  <motion.div
                    animate={isAdded ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    style={{ flex: 1 }}
                  >
                    <Button
                      variant="contained"
                      size="large"
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
                            {isAdded ? <Check size={24} /> : <ShoppingCart size={24} />}
                          </motion.div>
                        </AnimatePresence>
                      }
                      onClick={handleAddToCart}
                      disabled={isAdded}
                      sx={{
                        py: 1.8,
                        width: '100%',
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        borderRadius: '10px',
                        transition: 'all 0.3s ease',
                        ...(isAdded && {
                          bgcolor: '#4caf50',
                          color: 'white',
                          '&:hover': { bgcolor: '#45a049' },
                          '&.Mui-disabled': {
                            bgcolor: '#4caf50',
                            color: 'white',
                            opacity: 1
                          }
                        })
                      }}
                    >
                      {isAdded ? '¡Agregado!' : 'Añadir al Carrito'}
                    </Button>
                  </motion.div>
                </Stack>
              )}

              {/* WhatsApp button when out of stock */}
              {product.stock === 0 && (
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<MessageCircle size={24} />}
                  href={`https://wa.me/5491155099149?text=${encodeURIComponent(`Hola! Quiero consultar la disponibilidad del producto: ${product.name}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    py: 2,
                    width: '100%',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    borderRadius: '10px',
                    mb: 3,
                    color: '#25d366',
                    borderColor: '#25d366',
                    '&:hover': {
                      borderColor: '#1da851',
                      bgcolor: 'rgba(37,211,102,0.05)'
                    }
                  }}
                >
                  Consultar por WhatsApp
                </Button>
              )}

            </Box>
          </Grid>
        </Grid>

        {/* Full-width Description Section */}
        <Box>
          <Box sx={{ py: 1, mt: 2 }}>
            {product.description && product.description.includes('<') ? (
              <Box
                sx={{
                  lineHeight: 1.8,
                  maxWidth: 900,
                  fontSize: '1.1rem',
                  color: 'text.secondary',
                  '& b, & strong': { fontWeight: 700, color: 'text.primary' },
                  '& i, & em': { fontStyle: 'italic' },
                  '& u': { textDecoration: 'underline' },
                  '& s, & strike': { textDecoration: 'line-through' },
                  '& ul, & ol': { pl: 3, mb: 1 },
                  '& li': { mb: 0.5 },
                  '& p': { mb: 1 },
                }}
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.8,
                  maxWidth: 900,
                  fontSize: '1.1rem',
                  color: 'text.secondary',
                  whiteSpace: 'pre-line'
                }}
              >
                {product.description || 'No hay una descripción detallada para este producto.'}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <Box sx={{ mt: 10 }}>
            <Typography variant="h4" sx={{ mb: 6, fontWeight: 800 }}>Productos Relacionados</Typography>
            <Grid container spacing={3}>
              {relatedProducts.map((p: any) => (
                <Grid key={p.id} size={{ xs: 12, sm: 6, md: 3 }}>
                  <ProductCard product={p} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ProductDetailPage;
