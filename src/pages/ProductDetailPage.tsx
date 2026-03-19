import { useState, useMemo } from 'react';
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
  Rating,
  Tabs,
  Tab,
  IconButton
} from '@mui/material';
import { 
  ShoppingCart, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Heart,
  Share2
} from 'lucide-react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { products } from '../data/mockData';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/product/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { dispatch } = useCart();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);

  const product = useMemo(() => products.find(p => p.id === id), [id]);

  if (!product) {
    return (
      <Container sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h4">Producto no encontrado</Typography>
        <Button component={RouterLink} to="/shop" sx={{ mt: 2 }}>Volver a la tienda</Button>
      </Container>
    );
  }

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  return (
    <Box sx={{ bgcolor: '#f4f4f4', minHeight: '100vh', pb: 10 }}>
      {/* Breadcrumbs */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid rgba(0,0,0,0.05)', py: 2 }}>
        <Container maxWidth="xl">
          <Breadcrumbs>
            <Link component={RouterLink} to="/" color="inherit" underline="hover">Inicio</Link>
            <Link component={RouterLink} to="/shop" color="inherit" underline="hover">Tienda</Link>
            <Link component={RouterLink} to={`/shop?category=${product.category}`} color="inherit" underline="hover">{product.category}</Link>
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
                    src={product.images[selectedImage]}
                    alt={product.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '40px' }}
                  />
                </AnimatePresence>
              </Paper>
              
              <Grid container spacing={2}>
                {product.images.map((img, index) => (
                  <Grid key={index} size={3}>
                    <Paper
                      elevation={0}
                      onClick={() => setSelectedImage(index)}
                      sx={{
                        borderRadius: 2,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: selectedImage === index ? 'primary.main' : 'transparent',
                        aspectRatio: '1/1',
                        '&:hover': { opacity: 0.8 }
                      }}
                    >
                      <img src={img} alt={`${product.name} ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>

          {/* Main Content - Right: Info */}
          <Grid size={{ xs: 12, md: 5, lg: 6 }}>
            <Box>
              <Chip label={product.brand} sx={{ mb: 2, fontWeight: 700, borderRadius: 1 }} size="small" />
              <Typography variant="h2" sx={{ mb: 2, fontWeight: 800 }}>{product.name}</Typography>
              
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Rating value={4.5} readOnly precision={0.5} />
                <Typography variant="body2" color="text.secondary">(12 reseñas)</Typography>
              </Stack>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h3" color="primary.main" sx={{ fontWeight: 800 }}>
                  ${product.price.toLocaleString('es-ES')}
                </Typography>
                {product.discountPrice && (
                  <Typography variant="body1" sx={{ textDecoration: 'line-through', opacity: 0.5 }}>
                    ${product.discountPrice.toLocaleString('es-ES')}
                  </Typography>
                )}
              </Box>

              <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.8 }}>
                {product.description}
              </Typography>

              <Divider sx={{ mb: 4 }} />

              <Stack spacing={3} sx={{ mb: 6 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>Disponibilidad</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: product.stock > 0 ? '#4caf50' : '#f44336' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {product.stock > 0 ? 'En Stock - Envío Inmediato' : 'Agotado'}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingCart size={24} />}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  sx={{ py: 2, flex: 1, fontSize: '1.1rem', fontWeight: 800 }}
                >
                  Añadir al Carrito
                </Button>
                <IconButton sx={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: 2 }}>
                  <Heart size={24} />
                </IconButton>
                <IconButton sx={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: 2 }}>
                  <Share2 size={24} />
                </IconButton>
              </Stack>

              {/* Guarantees */}
              <Grid container spacing={2} sx={{ mt: 6 }}>
                <Grid size={4}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Truck size={20} />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>Envío Express</Typography>
                  </Stack>
                </Grid>
                <Grid size={4}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ShieldCheck size={20} />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>Garantía 3 Años</Typography>
                  </Stack>
                </Grid>
                <Grid size={4}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <RotateCcw size={20} />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>Devolución 30 días</Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>

        {/* Tabs Section (Specs, Description, Reviews) */}
        <Box sx={{ mt: 10 }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, val) => setActiveTab(val)}
            sx={{ 
              borderBottom: '1px solid rgba(0,0,0,0.05)',
              '& .MuiTab-root': { py: 3, px: 6, fontWeight: 700, fontSize: '1rem' }
            }}
          >
            <Tab label="Especificaciones" />
            <Tab label="Descripción Detallada" />
            <Tab label="Reseñas (12)" />
          </Tabs>

          <Box sx={{ py: 6 }}>
            {activeTab === 0 && (
              <Grid container spacing={2}>
                {product.specs.map((spec) => (
                  <Grid key={spec.label} size={{ xs: 12, sm: 6 }}>
                    <Paper 
                      elevation={0} 
                      sx={{ p: 2, display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)' }}
                    >
                      <Typography sx={{ fontWeight: 700, textTransform: 'capitalize' }}>{spec.label}</Typography>
                      <Typography color="text.secondary">{spec.value}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
            {activeTab === 1 && (
              <Typography variant="body1" sx={{ lineHeight: 1.8, maxWidth: 900 }}>
                {product.description}
                <br /><br />
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </Typography>
            )}
            {activeTab === 2 && (
              <Typography variant="body1">Sección de reseñas próximamente.</Typography>
            )}
          </Box>
        </Box>

        {/* Related Products */}
        <Box sx={{ mt: 10 }}>
          <Typography variant="h4" sx={{ mb: 6, fontWeight: 800 }}>También te podría interesar</Typography>
          <Grid container spacing={3}>
            {relatedProducts.map((p) => (
              <Grid key={p.id} size={{ xs: 12, sm: 6, md: 3 }}>
                <ProductCard product={p} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default ProductDetailPage;
