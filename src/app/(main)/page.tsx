"use client";

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, Grid, Paper, Stack, TextField, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { supabase } from '../../lib/supabase';
import ProductCard from '../../components/product/ProductCard';
import { ArrowRight, Truck, ShieldCheck, Zap, Headphones, Mail } from 'lucide-react';
import Link from 'next/link';

const Hero = () => (
  <Box sx={{ 
    width: '100%', 
    height: { xs: 'auto', md: '70vh' }, // Altura más compacta para notebooks
    minHeight: { xs: '500px', md: '550px' },
    position: 'relative', 
    overflow: 'hidden',
    bgcolor: '#0a0a0a',
    display: 'flex',
    alignItems: 'center',
    py: { xs: 6, md: 0 }
  }}>
    {/* ... (Mesh Gradient) */}
    <Box sx={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%',
      background: `
        radial-gradient(at 0% 0%, rgba(204, 0, 0, 0.15) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(33, 150, 243, 0.1) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(204, 0, 0, 0.15) 0px, transparent 50%),
        radial-gradient(at 0% 100%, rgba(33, 150, 243, 0.1) 0px, transparent 50%)
      `,
      zIndex: 0,
      '&::before': {
        content: '""',
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")',
        opacity: 0.1,
      }
    }} />

    {/* ... (Animated Glows) */}
    <Box 
      component={motion.div}
      animate={{ 
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      sx={{ 
        position: 'absolute', 
        top: '20%', 
        left: '10%', 
        width: '40%', 
        height: '40%', 
        borderRadius: '50%', 
        background: 'radial-gradient(circle, rgba(204,0,0,0.2) 0%, transparent 70%)',
        filter: 'blur(60px)',
        zIndex: 0 
      }} 
    />
    
    <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
      <Grid container spacing={4} alignItems="center">
        <Grid size={{ xs: 12, md: 7 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Glassmorphism Content Box - Compact Edition */}
            <Box sx={{ 
              p: { xs: 3, md: 4.5 }, 
              borderRadius: 6, 
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            }}>
              <Typography variant="overline" color="primary.main" sx={{ fontWeight: 900, fontSize: '0.9rem', letterSpacing: 5, display: 'block', mb: 1 }}>
                ESTÁNDAR DE ÉLITE
              </Typography>
              <Typography variant="h1" color="white" sx={{ 
                mb: 1.5, 
                fontSize: { xs: '2.2rem', md: '3.4rem' },
                lineHeight: 1.1,
                textShadow: '0 10px 30px rgba(0,0,0,0.5)'
              }}>
                DOMINA TU MUNDO <br />
                CON <span style={{ color: '#cc0000', position: 'relative' }}>
                  DEVIL GAMING
                </span>
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5}>
                <Button 
                  component={Link} 
                  href="/shop" 
                  variant="contained" 
                  size="large" 
                  endIcon={<ArrowRight />}
                  sx={{ 
                    py: 1.5, 
                    px: 4, 
                    fontSize: '0.95rem', 
                    fontWeight: 700,
                    borderRadius: 3,
                    boxShadow: '0 10px 20px rgba(204, 0, 0, 0.3)',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 15px 30px rgba(204, 0, 0, 0.4)',
                    },
                    transition: 'all 0.3s'
                  }}
                >
                  Explorar Arsenal
                </Button>
                <Button 
                  component={Link} 
                  href="/shop?featured=true" 
                  variant="outlined" 
                  size="large" 
                  sx={{ 
                    py: 1.5, 
                    px: 4, 
                    fontSize: '0.95rem', 
                    fontWeight: 700,
                    borderRadius: 3,
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      background: 'rgba(255,255,255,0.05)'
                    }
                  }}
                >
                  Ofertas Top
                </Button>
              </Stack>
            </Box>
          </motion.div>
        </Grid>
        
        {/* Floating Element for Decoration */}
        <Grid size={{ xs: 0, md: 5 }} sx={{ display: { xs: 'none', md: 'block' } }}>
          <motion.div
            animate={{ 
              y: [0, -15, 0],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            style={{ textAlign: 'center' }}
          >
            <Box sx={{ 
              width: 200, 
              height: 200, 
              margin: '0 auto',
              background: 'radial-gradient(circle, rgba(204,0,0,0.1) 0%, transparent 70%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
               <Zap size={120} color="#cc0000" style={{ opacity: 0.4, filter: 'drop-shadow(0 0 20px rgba(204,0,0,0.5))' }} />
            </Box>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  </Box>
);

const Feature = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <motion.div
    whileHover={{ y: -10 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
  >
    <Paper 
      elevation={0} 
      sx={{ 
        p: 4, 
        textAlign: 'center', 
        bgcolor: 'white', 
        border: '1px solid rgba(0,0,0,0.05)', 
        borderRadius: 4,
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
        '&:hover': {
          boxShadow: '0 15px 35px rgba(204,0,0,0.12)',
          borderColor: 'rgba(204,0,0,0.2)',
          '& .icon-wrapper': {
            transform: 'scale(1.15) rotate(5deg)',
            color: '#ff3333'
          }
        }
      }}
    >
      <Box 
        className="icon-wrapper"
        sx={{ 
          color: 'primary.main', 
          mb: 2, 
          display: 'flex', 
          justifyContent: 'center',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{title}</Typography>
      <Typography variant="body2" color="text.secondary">{desc}</Typography>
    </Paper>
  </motion.div>
);

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(name)')
        .limit(8); // Showing 8 products as featured for now
      
      if (!error) {
        setFeaturedProducts(data || []);
      }
      setLoading(false);
    };

    fetchFeatured();
  }, []);

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
            <Button component={Link} href="/shop" endIcon={<ArrowRight size={20} />} sx={{ fontWeight: 700 }}>
              Ver Todos
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 5 }}><CircularProgress /></Box>
          ) : featuredProducts.length > 0 ? (
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
          ) : (
            <Typography variant="body1" align="center" color="text.secondary">Añade productos en el panel de administrador para verlos aquí.</Typography>
          )}
        </Container>
      </Box>

      {/* Categories Highlights */}
      <Container maxWidth="xl" sx={{ py: 10 }}>
        <Typography variant="h2" align="center" sx={{ mb: 6 }}>Explora por Categoría</Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper component={Link} href="/shop" sx={{ 
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
                <Paper component={Link} href="/shop" sx={{ 
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
                <Paper component={Link} href="/shop" sx={{ 
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
    </Box>
  );
};

export default HomePage;
