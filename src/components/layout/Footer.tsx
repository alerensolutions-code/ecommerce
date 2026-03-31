"use client";

import { Box, Container, Typography, Link, IconButton, Stack, Divider } from '@mui/material';
import { Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <Box sx={{ bgcolor: 'secondary.main', color: 'white', py: 3, mt: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <Container maxWidth="xl">
        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          spacing={3} 
          justifyContent="space-between" 
          alignItems="center"
        >
          {/* Brand & Copyright */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
              DEVIL<span>GAMING</span>
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.3, display: { xs: 'none', sm: 'block' } }}>
              | © {new Date().getFullYear()}
            </Typography>
          </Stack>

          {/* Quick Links */}
          <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="#" color="inherit" variant="caption" sx={{ opacity: 0.7, textDecoration: 'none', '&:hover': { opacity: 1, color: 'primary.main' } }}>Garantía</Link>
            <Link href="#" color="inherit" variant="caption" sx={{ opacity: 0.7, textDecoration: 'none', '&:hover': { opacity: 1, color: 'primary.main' } }}>Envíos</Link>
            <Link href="#" color="inherit" variant="caption" sx={{ opacity: 0.7, textDecoration: 'none', '&:hover': { opacity: 1, color: 'primary.main' } }}>Términos</Link>
          </Stack>

          {/* Contact Info (Compact) */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.6 }}>
              <MapPin size={14} />
              <Typography variant="caption">Ciudad Gamer, ES</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.6 }}>
              <Phone size={14} />
              <Typography variant="caption">900 112 233</Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.1)', display: { xs: 'none', sm: 'block' } }} />
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton color="inherit" size="small" sx={{ opacity: 0.7, '&:hover': { opacity: 1, color: 'primary.main' } }}>
                <Instagram size={18} />
              </IconButton>
              <IconButton color="inherit" size="small" sx={{ opacity: 0.7, '&:hover': { opacity: 1, color: 'primary.main' } }}>
                <Twitter size={18} />
              </IconButton>
              <IconButton color="inherit" size="small" sx={{ opacity: 0.7, '&:hover': { opacity: 1, color: 'primary.main' } }}>
                <Mail size={18} />
              </IconButton>
            </Box>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
