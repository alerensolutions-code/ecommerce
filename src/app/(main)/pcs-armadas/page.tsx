"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Container, Grid, CircularProgress, 
  Stack, Paper, Button, useTheme 
} from '@mui/material';
import { motion } from 'framer-motion';
import { supabase } from '../../../lib/supabase';
import ProductCard from '../../../components/product/ProductCard';
import { ShieldCheck, Truck, Cpu, Zap, Headphones, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

const PcsArmadasPage = () => {
  const theme = useTheme();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrebuilts = async () => {
      setLoading(true);
      try {
        // Buscamos productos que pertenezcan a cualquier categoría que contenga "armada"
        const { data, error } = await supabase
          .from('products')
          .select('*, category:categories!inner(name)')
          .ilike('category.name', '%armada%');

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error('Error fetching prebuilt PCs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrebuilts();
  }, []);

  return (
    <Box sx={{ bgcolor: '#0a0a0aff', color: 'white', minHeight: '100vh', pb: 10 }}>
      {/* Hero Section */}
      <Box sx={{
        position: 'relative',
        height: { xs: 'auto', md: '45vh' },
        minHeight: '350px',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: `
          linear-gradient(rgba(0,0,0,0.6), rgba(10,10,10,1)),
          radial-gradient(at 10% 20%, rgba(204, 0, 0, 0.25) 0px, transparent 50%)
        `,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        py: { xs: 8, md: 0 }
      }}>
        {/* Subtle grid pattern background */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 0)',
          backgroundSize: '24px 24px',
          opacity: 0.8
        }} />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Stack spacing={2} sx={{ maxWidth: 700 }}>
            <Typography variant="overline" color="primary.main" sx={{ fontWeight: 900, letterSpacing: 4, fontSize: '0.85rem' }}>
              EQUIPOS PROFESIONALES
            </Typography>
            <Typography variant="h1" sx={{
              fontWeight: 900,
              fontSize: { xs: '2.5rem', md: '3.8rem' },
              lineHeight: 1.1,
              textShadow: '0 0 30px rgba(204,0,0,0.2)'
            }}>
              PCs Armadas <br />
              <span style={{ color: '#cc0000' }}>Listas para Jugar</span>
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', maxWidth: 600 }}>
              Olvídate de la compatibilidad y el ensamblado. Nuestros expertos configuran, arman y testean cada computadora para garantizar el máximo rendimiento en juegos desde el primer segundo.
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Trust Badges */}
      <Container maxWidth="xl" sx={{ mt: 6, mb: 2, position: 'relative', zIndex: 2 }}>
        <Grid container spacing={3}>
          {[
            { icon: <Zap size={24} />, title: "Plug & Play", desc: "Enchufá y empezá a jugar. Todos nuestros equipos incluyen Windows y drivers optimizados." },
            { icon: <ShieldCheck size={24} />, title: "Garantía de 3 Años", desc: "Garantía oficial completa en cada componente y soporte técnico prioritario." },
            { icon: <Truck size={24} />, title: "Envío Seguro y Express", desc: "Embalaje reforzado de alta resistencia y envíos rápidos a todo el país." }
          ].map((badge, idx) => (
            <Grid size={{ xs: 12, md: 4 }} key={idx}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.15, ease: "easeOut" }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                style={{ height: '100%' }}
              >
                <Paper elevation={0} sx={{ 
                  p: 3.5, 
                  bgcolor: '#121212', 
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 4,
                  height: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2.5,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  transition: 'border-color 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    borderColor: 'rgba(204,0,0,0.3)',
                    boxShadow: '0 15px 35px rgba(204,0,0,0.05)'
                  }
                }}>
                  <Box sx={{ p: 1.5, bgcolor: 'rgba(204,0,0,0.08)', borderRadius: 2.5, color: 'primary.main' }}>
                    {badge.icon}
                  </Box>
                  <Stack spacing={0.75}>
                    <Typography variant="subtitle1" fontWeight={800} sx={{ color: 'white', letterSpacing: '0.02em' }}>{badge.title}</Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.6 }}>{badge.desc}</Typography>
                  </Stack>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Catalog Grid */}
      <Container maxWidth="xl" sx={{ mt: 8 }}>
        <Stack spacing={4}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>Nuestras Configuraciones</Typography>
            <Typography variant="body2" color="text.secondary">
              {products.length} {products.length === 1 ? 'equipo disponible' : 'equipos disponibles'}
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress sx={{ color: 'primary.main' }} />
            </Box>
          ) : products.length > 0 ? (
            <Grid container spacing={3}>
              {products.map((product) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper elevation={0} sx={{ 
              p: 8, 
              textAlign: 'center', 
              bgcolor: '#121212', 
              borderRadius: 5, 
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}>
              <ShoppingBag size={56} style={{ margin: '0 auto', color: '#cc0000', opacity: 0.8, marginBottom: 24 }} />
              <Typography variant="h5" fontWeight={900} sx={{ mb: 2, color: 'white' }}>Equipos en preparación</Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 4, maxWidth: 600, mx: 'auto', lineHeight: 1.7 }}>
                Actualmente no contamos con computadoras pre-armadas listas para entrega inmediata. ¡Pero no te preocupes! Podemos armar una configuración 100% personalizada para vos según tu presupuesto y necesidades. 
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button 
                  component={Link} 
                  href="/shop" 
                  variant="contained" 
                  color="primary"
                  sx={{ px: 4, py: 1.5, borderRadius: 2.5, fontWeight: 800 }}
                >
                  Explorar Componentes
                </Button>
                <Button 
                  component="a" 
                  href="https://wa.me/5491112345678" 
                  target="_blank"
                  variant="outlined" 
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    borderRadius: 2.5, 
                    fontWeight: 800, 
                    borderColor: 'rgba(255,255,255,0.15)', 
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.05)'
                    }
                  }}
                >
                  Consultar por WhatsApp
                </Button>
              </Stack>
            </Paper>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default PcsArmadasPage;
