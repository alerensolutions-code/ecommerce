"use client";

import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Badge, 
  Box, 
  InputBase, 
  Menu, 
  MenuItem, 
  Container,
  useScrollTrigger,
  Slide,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  CircularProgress
} from '@mui/material';
import { 
  Search, 
  ShoppingCart, 
  Menu as MenuIcon, 
  ChevronDown,
  Monitor,
  Cpu,
  Gamepad,
  Keyboard,
  Layers,
  Box as BoxIcon,
  LayoutDashboard
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { useCart } from '../../context/CartContext';
import { alpha, styled } from '@mui/material/styles';
import { supabase } from '../../lib/supabase';
import CartDrawer from '../cart/CartDrawer';
import { useAuth } from '../../context/AuthContext';

const SearchWrapper = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'rgba(255, 255, 255, 0.7)',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));



const Navbar = () => {
  const { state } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  
  // Categorías base estáticas (siempre presentes)
  const [dbCategories, setDbCategories] = useState<{name: string, icon: any, path: string}[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  const fetchCategories = async () => {
    if (categoriesLoaded || loadingCategories) return;
    
    setLoadingCategories(true);
    try {
      const { data, error } = await supabase.from('categories').select('name').order('name');
      if (error) throw error;

      if (data) {
        const dynamicCats = data.map(c => ({
          name: c.name,
          icon: getCategoryIcon(c.name),
          path: `/shop?category=${encodeURIComponent(c.name)}`
        }));

        setDbCategories([
          { name: 'Todas', icon: <BoxIcon size={20} />, path: '/shop' },
          ...dynamicCats
        ]);
        setCategoriesLoaded(true);
      }
    } catch (err) {
      console.error('Error fetching categories for navbar:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Mapeo de iconos basado en el nombre de la categoría
  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('monitor')) return <Monitor size={20} />;
    if (n.includes('grafica') || n.includes('gpu') || n.includes('cpu')) return <Cpu size={20} />;
    if (n.includes('consola') || n.includes('gamer') || n.includes('juego')) return <Gamepad size={20} />;
    if (n.includes('periferico') || n.includes('teclado') || n.includes('mouse')) return <Keyboard size={20} />;
    return <Layers size={20} />;
  };

  // Ya no usamos useEffect para fetchCategories al montar
  // Se ejecutará on-demand en handleOpenMenu o toggleDrawer(true)

  const cartCount = state.items.reduce((acc, item) => acc + item.quantity, 0);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    fetchCategories();
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
      return;
    }
    setMobileOpen(open);
    if (open) fetchCategories();
  };

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0} 
        sx={{ 
          bgcolor: 'rgba(10, 10, 10, 0.95)', 
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          top: 0,
          zIndex: 1100
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Mobile Menu Icon */}
            <IconButton
              aria-label="open drawer"
              edge="start"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2, display: { md: 'none' }, color: '#fff' }}
            >
              <MenuIcon />
            </IconButton>

            {/* Logo */}
            <Typography
              variant="h6"
              noWrap
              component={Link}
              href="/"
              sx={{
                mr: 2,
                display: 'flex',
                fontWeight: 900,
                textDecoration: 'none',
                fontSize: '1.6rem',
                letterSpacing: '.15rem',
                color: '#fff',
                fontStyle: 'italic',
                '& span': { 
                  background: 'linear-gradient(90deg, #ff0000, #cc0000)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 15px rgba(204,0,0,0.5)',
                  ml: 0.5
                }
              }}
            >
              DEVIL<span>GAMING</span>
            </Typography>

            {/* Desktop Categories */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 4, alignItems: 'center' }}>
              <Box
                onClick={handleOpenMenu}
                sx={{ 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  fontWeight: 700, 
                  fontSize: '0.95rem',
                  transition: 'all 0.3s',
                  color: 'rgba(255,255,255,0.9)',
                  padding: '8px 16px',
                  borderRadius: '24px',
                  '&:hover': { 
                    color: '#ff0000',
                    backgroundColor: 'rgba(255, 0, 0, 0.08)',
                    boxShadow: '0 0 10px rgba(255,0,0,0.2)'
                  },
                }}
              >
                Categorías <ChevronDown size={16} style={{ marginLeft: 6 }} />
              </Box>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                elevation={0}
                sx={{ mt: '15px' }}
                PaperProps={{
                  sx: {
                    borderRadius: 2,
                    minWidth: 220,
                    bgcolor: '#111',
                    color: '#fff',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }
                }}
              >
                  {loadingCategories ? (
                    <MenuItem disabled sx={{ justifyContent: 'center', py: 2 }}>
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : dbCategories.map((cat) => (
                    <MenuItem 
                      key={cat.name} 
                      onClick={() => {
                      router.push(cat.path);
                      handleCloseMenu();
                    }}
                    sx={{ 
                      py: 1.5, 
                      px: 3,
                      transition: 'all 0.2s',
                      '&:hover': { 
                        bgcolor: 'rgba(204,0,0,0.15)',
                        color: '#ff3333',
                        pl: 3.5
                      } 
                    }}
                    >
                      <ListItemText primary={cat.name} primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }} />
                    </MenuItem>
                  ))}
                </Menu>
              </Box>

              {/* Search Bar */}
              <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'flex' }, justifyContent: 'center' }}>
                <SearchWrapper>
                  <SearchIconWrapper>
                    <Search size={18} />
                  </SearchIconWrapper>
                  <StyledInputBase
                  placeholder="Buscar hardware..."
                  inputProps={{ 'aria-label': 'search' }}
                  sx={{ color: 'white' }}
                />
                </SearchWrapper>
              </Box>

              {/* Icons */}
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2, gap: 1 }}>
              {/* Admin button — only visible when logged in as admin */}
              {user?.role === 'admin' && (
                <Button
                  component={Link}
                  href="/admin"
                  size="small"
                  variant="outlined"
                  startIcon={<LayoutDashboard size={16} />}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: 'white',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    display: { xs: 'none', sm: 'flex' },
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.1)',
                      borderColor: 'white',
                    }
                  }}
                >
                  Panel Admin
                </Button>
              )}
              <IconButton 
                sx={{ ml: 0.5, color: 'white', '&:hover': { color: '#ff3333' } }}
                onClick={() => setCartOpen(true)}
              >
                  <Badge badgeContent={cartCount} color="primary">
                    <motion.div
                      key={cartCount}
                      initial={{ scale: 1.5, rotate: -15 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                    >
                      <ShoppingCart size={22} />
                    </motion.div>
                  </Badge>
                </IconButton>
              </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={toggleDrawer(false)}
      >
        <Box
          sx={{ width: 280 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid #eee' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
              DEVIL<span>GAMING</span>
            </Typography>
          </Box>
          <List>
            {loadingCategories ? (
              <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={24} /></Box>
            ) : dbCategories.map((cat) => (
              <ListItem key={cat.name} disablePadding>
                <ListItemButton component={Link} href={cat.path}>
                  <ListItemText primary={cat.name} primaryTypographyProps={{ fontWeight: 600 }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default Navbar;
