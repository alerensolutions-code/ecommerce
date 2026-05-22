"use client";

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, Grid, Paper, Stack, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { supabase } from '../../lib/supabase';
import ProductCard from '../../components/product/ProductCard';
import GoogleReviews from '../../components/layout/GoogleReviews';
import { ArrowRight, Truck, ShieldCheck, Zap, Headphones, Cpu, Monitor } from 'lucide-react';
import Link from 'next/link';

const Hero = () => (
  <Box sx={{
    width: '100%',
    height: { xs: 'auto', md: '70vh' }, // Altura más compacta para notebooks
    minHeight: { xs: '500px', md: '550px' },
    position: 'relative',
    overflow: 'hidden',
    bgcolor: '#000000ff',
    display: 'flex',
    alignItems: 'center',
    py: { xs: 6, md: 0 }
  }}>
    {/* Video Background */}
    <video
      autoPlay
      loop
      muted
      playsInline
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        zIndex: 0,
      }}
    >
      <source src="/hero-bg.mp4" type="video/mp4" />
    </video>

    {/* Video Overlay / Darkening Gradient */}
    <Box sx={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: `
        linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.8)),
        radial-gradient(at 0% 0%, rgba(204, 0, 0, 0.2) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(204, 0, 0, 0.2) 0px, transparent 50%)
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

    <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
      <Grid container spacing={4} alignItems="center">
        <Grid size={{ xs: 12, md: 7 }}>
          <Typography variant="overline" color="primary.main" sx={{ fontWeight: 900, fontSize: '0.9rem', letterSpacing: 5, display: 'block', mb: 1 }}>
            ESTÁNDAR DE ÉLITE
          </Typography>
          <Typography variant="h1" color="white" sx={{
            mb: 1.5,
            fontSize: { xs: '2.2rem', md: '3.4rem' },
            lineHeight: 1.1,
            fontWeight: 900,
            textShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            DOMINA TU MUNDO <br />
            CON{' '}
            <motion.span
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              style={{
                background: 'linear-gradient(90deg, #ff0000, #cc0000)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
                textShadow: '0 0 40px rgba(255,0,0,0.6)'
              }}
            >
              DEVIL GAMING
            </motion.span>
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
          </Stack>
        </Grid>
      </Grid>
    </Container>
  </Box >
);

const Feature = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <motion.div
    whileHover={{ y: -10 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
    style={{ height: '100%' }}
  >
    <Paper
      elevation={0}
      sx={{
        p: 4,
        textAlign: 'center',
        bgcolor: 'white',
        border: '1px solid rgba(0,0,0,0.05)',
        borderRadius: 4,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
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
        .eq('featured', true)
        .limit(8);

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

      {/* Features Section - Commented out as requested
      <Container maxWidth="xl" sx={{ py: 10 }}>
        <Grid container spacing={4} alignItems="stretch">
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex' }}>
            <Box sx={{ width: '100%' }}>
              <Feature icon={<Truck size={32} />} title="Envío Express" desc="En 24/48h en tu casa listo para viciar." />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex' }}>
            <Box sx={{ width: '100%' }}>
              <Feature icon={<ShieldCheck size={32} />} title="Garantía Premium" desc="3 años de garantía oficial en todo el hardware." />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex' }}>
            <Box sx={{ width: '100%' }}>
              <Feature icon={<Zap size={32} />} title="Soporte Técnico" desc="Expertos disponibles para ayudarte con tu setup." />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex' }}>
            <Box sx={{ width: '100%' }}>
              <Feature icon={<Headphones size={32} />} title="Atención 24/7" desc="Siempre estamos ahí cuando nos necesitas." />
            </Box>
          </Grid>
        </Grid>
      </Container>
      */}

      {/* Build PC Highlight Section */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <motion.div
          animate={{
            y: [0, -15, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Box sx={{
            position: 'relative',
            overflow: 'hidden',
            bgcolor: '#050505',
            borderRadius: { xs: 6, md: 8 },
            backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(204, 0, 0, 0.2) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(204, 0, 0, 0.15) 0%, transparent 40%)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(204,0,0,0.1)',
            p: { xs: 4, md: 6 }
          }}>
            <Grid container spacing={6} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <Typography variant="overline" color="primary" sx={{ fontWeight: 900, letterSpacing: 4 }}>
                    MÁXIMO RENDIMIENTO GARANTIZADO
                  </Typography>
                  <Typography variant="h2" color="white" sx={{ fontWeight: 900, mt: 1, mb: 3, lineHeight: 1 }}>
                    PCs PRE-ARMADAS <br />
                    <span style={{ color: '#cc0000' }}>LISTAS PARA EL COMBATE</span>
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 5, maxWidth: 500, fontSize: '1.1rem' }}>
                    Equipos ensamblados, testeados y optimizados por nuestros ingenieros expertos. Elegí la configuración que mejor se adapte a tu nivel y empezá a jugar de inmediato.
                  </Typography>

                  <Stack direction="row" spacing={3}>
                    <Button
                      component={Link}
                      href="/pcs-armadas"
                      variant="contained"
                      size="large"
                      startIcon={<Zap />}
                      sx={{
                        px: 5,
                        py: 2,
                        borderRadius: 3,
                        fontWeight: 800,
                        boxShadow: '0 0 30px rgba(204,0,0,0.4)',
                        '&:hover': { boxShadow: '0 0 50px rgba(204,0,0,0.6)' }
                      }}
                    >
                      EXPLORAR EQUIPOS
                    </Button>
                  </Stack>
                </motion.div>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  style={{ position: 'relative' }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '80%',
                      height: '80%',
                      bgcolor: 'primary.main',
                      filter: 'blur(100px)',
                      opacity: 0.2,
                      zIndex: 0
                    }}
                  />
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      bgcolor: 'rgba(255,255,255,0.03)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 6,
                      position: 'relative',
                      zIndex: 1,
                      overflow: 'hidden'
                    }}
                  >
                    <Stack spacing={3}>
                      {[
                        { icon: <Cpu color="#cc0000" />, step: "PCs Gaming Pro", label: "Dominá los eSports competitivos" },
                        { icon: <Monitor color="#cc0000" />, step: "Streaming & Diseño", label: "Rendimiento óptimo multitarea" },
                        { icon: <ShieldCheck color="#cc0000" />, step: "Garantía Devil", label: "3 años de protección absoluta" }
                      ].map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + (i * 0.1) }}
                        >
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Box sx={{ p: 1.5, bgcolor: 'rgba(204,0,0,0.1)', borderRadius: 2 }}>{item.icon}</Box>
                            <Box>
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>{item.step}</Typography>
                              <Typography variant="body1" sx={{ color: 'white', fontWeight: 800 }}>{item.label}</Typography>
                            </Box>
                          </Box>
                        </motion.div>
                      ))}
                    </Stack>
                  </Paper>
                </motion.div>
              </Grid>
            </Grid>
          </Box>
        </motion.div>
      </Container>

      {/* Featured Carousel */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 6 }}>
            <Box>
              <Typography variant="h2" sx={{
                fontWeight: 900,
                background: 'linear-gradient(90deg, #ff0000, #cc0000)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
                textShadow: '0 0 20px rgba(255,0,0,0.15)'
              }}>
                Productos Destacados
              </Typography>
            </Box>
            <Button component={Link} href="/shop?featured=true" endIcon={<ArrowRight size={20} />} sx={{ fontWeight: 700 }}>
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

      <GoogleReviews />

    </Box>
  );
};

export default HomePage;
