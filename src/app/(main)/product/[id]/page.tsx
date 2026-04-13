"use client";

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Paper,
  Divider,
  Chip,
  Stack,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow
} from '@mui/material';
import {
  ShoppingCart,
  Check,
  MessageCircle
} from 'lucide-react';
import { useParams } from 'next/navigation';
import NextLink from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import { supabase } from '../../../../lib/supabase';
import { useCart } from '../../../../context/CartContext';
import ProductCard from '../../../../components/product/ProductCard';

const ProductDetailPage = () => {
  const { id } = useParams() as { id: string };
  const { dispatch } = useCart();
  const [activeTab, setActiveTab] = useState(0);

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);

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
    dispatch({ type: 'ADD_TO_CART', payload: product });
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
      {/* Breadcrumbs */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid rgba(0,0,0,0.05)', py: 2 }}>
        <Container maxWidth="xl">
          <Breadcrumbs separator="›" aria-label="breadcrumb">
            <Link component={NextLink} href="/" color="inherit" underline="hover">Inicio</Link>
            <Link component={NextLink} href="/shop" color="inherit" underline="hover">Tienda</Link>
            <Link component={NextLink} href={`/shop?category=${categoryName}`} color="inherit" underline="hover">{categoryName}</Link>
            <Typography color="text.primary">{product.name}</Typography>
          </Breadcrumbs>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Grid container spacing={6}>
          {/* Main Content - Left: Images */}
          <Grid size={{ xs: 12, md: 7, lg: 6 }}>
            <Box sx={{ position: 'sticky', top: 100 }}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  bgcolor: 'white',
                  border: '1px solid rgba(0,0,0,0.05)',
                  aspectRatio: '1/1',
                  mb: 2,
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
                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '40px' }}
                  />
                </AnimatePresence>
              </Paper>

              {/* Thumbnails Gallery */}
              {allImages.length > 1 && (
                <Grid container spacing={2}>
                  {allImages.map((img: string, idx: number) => (
                    <Grid size={2.4} key={idx}>
                      <Paper
                        elevation={0}
                        onClick={() => setSelectedImage(img)}
                        sx={{
                          borderRadius: 2,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: '2px solid',
                          borderColor: selectedImage === img ? 'primary.main' : 'transparent',
                          transition: 'all 0.2s',
                          aspectRatio: '1/1',
                          '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }
                        }}
                      >
                        <Box component="img" src={img} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Grid>

          {/* Main Content - Right: Info */}
          <Grid size={{ xs: 12, md: 5, lg: 6 }}>
            <Box>
              <Chip label={categoryName} sx={{ mb: 2, fontWeight: 700, borderRadius: 1 }} size="small" color="primary" variant="outlined" />
              <Typography variant="h2" sx={{ mb: 2, fontWeight: 800 }}>{product.name}</Typography>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h3" color="primary.main" sx={{ fontWeight: 800 }}>
                  ${product.price.toLocaleString('es-ES')}
                </Typography>
              </Box>

              <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.8 }}>
                {product.description || 'Sin descripción disponible para este producto.'}
              </Typography>

              <Divider sx={{ mb: 4 }} />

              <Stack spacing={3} sx={{ mb: 6 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>Disponibilidad</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: product.stock > 0 ? '#4caf50' : '#f44336' }} />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {product.stock > 0 ? 'En Stock - Envío Inmediato' : 'Consultar Disponibilidad'}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>

              <Stack direction="row" spacing={2}>
                <motion.div
                  animate={isAdded ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  style={{ flex: 1 }}
                >
                  {product.stock > 0 && (
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
                        py: 2,
                        width: '100%',
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        borderRadius: 2,
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
                  )}

                  {/* Botón Consultar WhatsApp */}
                  {product.stock === 0 && (
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<MessageCircle size={24} />}
                      href={`https://wa.me/5491100000000?text=${encodeURIComponent(`Hola! Quiero consultar la disponibilidad del producto: ${product.name}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        py: 2,
                        width: '100%',
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        borderRadius: 2,
                        mt: 2,
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
                </motion.div>
              </Stack>

            </Box>
          </Grid>
        </Grid>

        {/* Description & Specs Section */}
        <Box sx={{ mt: 10 }}>
          <Tabs
            value={activeTab}
            onChange={(_e, newValue) => setActiveTab(newValue)}
            sx={{
              borderBottom: '1px solid rgba(0,0,0,0.1)',
              mb: 4,
              '& .MuiTab-root': {
                fontWeight: 800,
                fontSize: '1rem',
                textTransform: 'none',
                minWidth: 150,
              }
            }}
          >
            <Tab label="Descripción" />
            <Tab label="Especificaciones" />
          </Tabs>

          <AnimatePresence mode="wait">
            {activeTab === 0 ? (
              <motion.div
                key="desc"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Box sx={{ py: 2 }}>
                  <Typography variant="body1" sx={{ lineHeight: 1.8, maxWidth: 900, fontSize: '1.1rem', color: 'text.secondary' }}>
                    {product.description || 'No hay una descripción detallada para este producto.'}
                  </Typography>
                </Box>
              </motion.div>
            ) : (
              <motion.div
                key="specs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Box sx={{ py: 2, maxWidth: 800 }}>
                  {product.technical_specs && Object.keys(product.technical_specs).length > 0 ? (
                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.05)', borderRadius: 2 }}>
                      <Table>
                        <TableBody>
                          {Object.entries(product.technical_specs).map(([key, value]: [string, any]) => (
                            <TableRow key={key}>
                              <TableCell sx={{ fontWeight: 700, width: '40%', borderBottom: '1px solid rgba(0,0,0,0.03)', color: 'text.secondary' }}>
                                {key}
                              </TableCell>
                              <TableCell sx={{ borderBottom: '1px solid rgba(0,0,0,0.03)', fontWeight: 500 }}>
                                {String(value)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography color="text.secondary">
                      No hay especificaciones técnicas detalladas para este producto.
                    </Typography>
                  )}
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
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
