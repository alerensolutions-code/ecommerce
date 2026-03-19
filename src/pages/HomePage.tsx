import React from 'react';
import { Box, Typography, Button, Container, Grid, Paper, Stack, TextField } from '@mui/material';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { products } from '../data/mockData';
import ProductCard from '../components/product/ProductCard';
import { ArrowRight, Truck, ShieldCheck, Zap, Headphones, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => (
  <Box sx={{ 
    width: '100%', 
    height: { xs: '70vh', md: '80vh' }, 
    position: 'relative', 
    overflow: 'hidden',
    bgcolor: 'secondary.main',
    display: 'flex',
    alignItems: 'center'
  }}>
    <Box sx={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      backgroundImage: 'url("https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2000&auto=format&fit=crop")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      opacity: 0.4,
      zIndex: 0
    }} />
    
    <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 7 }}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: 4 }}>
              PRÓXIMA GENERACIÓN
            </Typography>
            <Typography variant="h1" color="white" sx={{ mt: 2, mb: 4 }}>
              DOMINA EL JUEGO CON <span style={{ color: '#cc0000' }}>DEVIL GAMING</span>
            </Typography>
            <Typography variant="h5" color="rgba(255,255,255,0.8)" sx={{ mb: 6, fontWeight: 400, maxWidth: 600 }}>
              Hardware de alto rendimiento diseñado por y para gamers. No aceptes menos que la perfección técnica.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button 
                component={Link} 
                to="/shop" 
                variant="contained" 
                size="large" 
                sx={{ py: 2, px: 6, fontSize: '1.1rem' }}
              >
                Explorar Tienda
              </Button>
              <Button 
                variant="outlined" 
                size="large" 
                sx={{ 
                  py: 2, 
                  px: 6, 
                  fontSize: '1.1rem', 
                  color: 'white', 
                  borderColor: 'white',
                  '&:hover': { borderColor: 'primary.main', color: 'primary.main' }
                }}
              >
                Ver Ofertas
              </Button>
            </Stack>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  </Box>
);

const Feature = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: 'white', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 4 }}>
    <Box sx={{ color: 'primary.main', mb: 2, display: 'flex', justifyContent: 'center' }}>
      {icon}
    </Box>
    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{title}</Typography>
    <Typography variant="body2" color="text.secondary">{desc}</Typography>
  </Paper>
);

const Newsletter = () => (
  <Box sx={{ py: 10, bgcolor: 'secondary.main', color: 'white' }}>
    <Container maxWidth="md">
      <Box sx={{ textAlign: 'center' }}>
        <Mail size={48} color="#cc0000" style={{ marginBottom: '24px' }} />
        <Typography variant="h3" sx={{ mb: 2 }}>Únete a la Legión</Typography>
        <Typography variant="body1" sx={{ mb: 6, opacity: 0.8 }}>
          Suscríbete para recibir ofertas exclusivas, lanzamientos anticipados y noticias del mundo gaming.
        </Typography>
        <Paper 
          component="form" 
          sx={{ 
            p: '4px', 
            display: 'flex', 
            alignItems: 'center', 
            bgcolor: 'white',
            borderRadius: '50px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}
        >
          <TextField
            placeholder="Tu correo electrónico"
            variant="standard"
            sx={{ ml: 3, flex: 1 }}
            InputProps={{ disableUnderline: true }}
          />
          <Button 
            variant="contained" 
            sx={{ 
              borderRadius: '50px', 
              px: 4, 
              py: 1.5,
              fontWeight: 700
            }}
          >
            Suscribirse
          </Button>
        </Paper>
      </Box>
    </Container>
  </Box>
);

const HomePage = () => {
  const featuredProducts = products.filter(p => p.featured);

  return (
    <Box>
      <Hero />

      {/* Features Section */}
      <Container maxWidth="xl" sx={{ py: 10 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Feature icon={<Truck size={32} />} title="Envío Express" desc="En 24/48h en tu casa listo para viciar." />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Feature icon={<ShieldCheck size={32} />} title="Garantía Premium" desc="3 años de garantía oficial en todo el hardware." />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Feature icon={<Zap size={32} />} title="Soporte Técnico" desc="Expertos disponibles para ayudarte con tu setup." />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Feature icon={<Headphones size={32} />} title="Atención 24/7" desc="Siempre estamos ahí cuando nos necesitas." />
          </Grid>
        </Grid>
      </Container>

      {/* Featured Carousel */}
      <Box sx={{ py: 10, bgcolor: 'rgba(0,0,0,0.02)' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 6 }}>
            <Box>
              <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800 }}>MÁS DESEADOS</Typography>
              <Typography variant="h2">Productos Destacados</Typography>
            </Box>
            <Button component={Link} to="/shop" endIcon={<ArrowRight size={20} />} sx={{ fontWeight: 700 }}>
              Ver Todos
            </Button>
          </Box>

          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000 }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1440: { slidesPerView: 4 },
            }}
            style={{ padding: '20px 5px 50px 5px' }}
          >
            {featuredProducts.map((product) => (
              <SwiperSlide key={product.id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </Container>
      </Box>

      {/* Categories Highlights */}
      <Container maxWidth="xl" sx={{ py: 10 }}>
        <Typography variant="h2" align="center" sx={{ mb: 6 }}>Explora por Categoría</Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper component={Link} to="/shop?category=Tarjetas Gráficas" sx={{ 
              height: 400, 
              position: 'relative', 
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'end',
              p: 4,
              textDecoration: 'none',
              '&:hover img': { transform: 'scale(1.05)' }
            }}>
              <Box component="img" src="https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=1000" sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, transition: 'transform 0.6s ease' }} />
              <Box sx={{ position: 'relative', zIndex: 1, color: 'white' }}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>Tarjetas Gráficas</Typography>
                <Typography variant="body1" sx={{ opacity: 0.8 }}>Potencia sin límites</Typography>
              </Box>
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)', zIndex: 0 }} />
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Paper component={Link} to="/shop?category=Monitores" sx={{ 
                  height: 188, 
                  position: 'relative', 
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  p: 4,
                  textDecoration: 'none',
                  '&:hover img': { transform: 'scale(1.05)' }
                }}>
                  <Box component="img" src="https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=1000" sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, transition: 'transform 0.6s ease' }} />
                  <Box sx={{ position: 'relative', zIndex: 1, color: 'white' }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>Monitores 4K</Typography>
                  </Box>
                  <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, transparent 60%)', zIndex: 0 }} />
                </Paper>
              </Grid>
              <Grid size={12}>
                <Paper component={Link} to="/shop?category=Periféricos" sx={{ 
                  height: 188, 
                  position: 'relative', 
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  p: 4,
                  textDecoration: 'none',
                  '&:hover img': { transform: 'scale(1.05)' }
                }}>
                  <Box component="img" src="https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=1000" sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, transition: 'transform 0.6s ease' }} />
                  <Box sx={{ position: 'relative', zIndex: 1, color: 'white' }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>Periféricos Pro</Typography>
                  </Box>
                  <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, transparent 60%)', zIndex: 0 }} />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>

      {/* Newsletter Section */}
      {/* <Newsletter /> */}
    </Box>
  );
};

export default HomePage;
