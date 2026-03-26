"use client";

import { Box, Container, Grid, Typography, Link, IconButton, Divider } from '@mui/material';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import NextLink from 'next/link';


const Footer = () => {
  return (
    <Box sx={{ bgcolor: 'secondary.main', color: 'white', pt: 8, pb: 4, mt: 'auto' }}>
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Brand & Description */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', mb: 2 }}>
              DEVIL<span>GAMING</span>
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3, maxWidth: 300 }}>
              Tu destino definitivo para hardware de alto rendimiento y periféricos premium. Elevamos tu experiencia gaming al siguiente nivel.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton color="inherit" size="small" sx={{ '&:hover': { color: 'primary.main' } }}>
                <Facebook size={20} />
              </IconButton>
              <IconButton color="inherit" size="small" sx={{ '&:hover': { color: 'primary.main' } }}>
                <Instagram size={20} />
              </IconButton>
              <IconButton color="inherit" size="small" sx={{ '&:hover': { color: 'primary.main' } }}>
                <Twitter size={20} />
              </IconButton>
              <IconButton color="inherit" size="small" sx={{ '&:hover': { color: 'primary.main' } }}>
                <Youtube size={20} />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" color="inherit" variant="body2" sx={{ opacity: 0.7, '&:hover': { opacity: 1, color: 'primary.main' } }}>Ayuda / FAQ</Link>
              <Link href="#" color="inherit" variant="body2" sx={{ opacity: 0.7, '&:hover': { opacity: 1, color: 'primary.main' } }}>Envíos</Link>
              <Link href="#" color="inherit" variant="body2" sx={{ opacity: 0.7, '&:hover': { opacity: 1, color: 'primary.main' } }}>Garantía</Link>
              <Link href="#" color="inherit" variant="body2" sx={{ opacity: 0.7, '&:hover': { opacity: 1, color: 'primary.main' } }}>Términos</Link>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Contacto</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <MapPin size={18} className="text-primary" />
                <Typography variant="body2" sx={{ opacity: 0.7 }}>Av. Tech 404, Ciudad Gamer</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Phone size={18} />
                <Typography variant="body2" sx={{ opacity: 0.7 }}>+34 900 123 456</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Mail size={18} />
                <Typography variant="body2" sx={{ opacity: 0.7 }}>contacto@devilgaming.com</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, bgcolor: 'rgba(255,255,255,0.1)' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="caption" sx={{ opacity: 0.5 }}>
            © {new Date().getFullYear()} Devil Gaming. Todos los derechos reservados.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link href="#" color="inherit" variant="caption" sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}>Privacidad</Link>
            <Link href="#" color="inherit" variant="caption" sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}>Cookies</Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
