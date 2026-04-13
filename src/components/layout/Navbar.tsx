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
  CircularProgress,
  TextField,
  Avatar,
  ListItemAvatar,
  ClickAwayListener
} from '@mui/material';
import {
  Search,
  ShoppingCart,
  Menu as MenuIcon,
  ChevronDown,
  LayoutDashboard,
  X,
  Zap,
  Mail,
  Phone,
  Instagram,
  Facebook,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import { useCart } from '../../context/CartContext';
import { alpha, styled } from '@mui/material/styles';
import { supabase } from '../../lib/supabase';
import CartDrawer from '../cart/CartDrawer';
import { useAuth } from '../../context/AuthContext';

const SearchWrapper = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '20px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  border: '1px solid rgba(0,0,0,0.05)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  display: 'flex',
  alignItems: 'center',
  maxWidth: '400px',
  '&:focus-within': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    borderColor: theme.palette.primary.main,
    maxWidth: '450px',
  },
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
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    fontSize: '0.9rem',
    fontWeight: 500,
    [theme.breakpoints.up('md')]: {
      width: '25ch',
      '&:focus': {
        width: '30ch',
      },
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
  const [searchQuery, setSearchQuery] = useState('');

  // Búsqueda en vivo
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Categorías
  const [dbCategories, setDbCategories] = useState<{ id: string, name: string, path: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  const fetchCategories = async () => {
    if (categoriesLoaded || loadingCategories) return;

    setLoadingCategories(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, parent_id')
        .order('name');

      if (error) throw error;

      if (data) {
        // En el Navbar mostramos solo las categorías padre (parent_id is null)
        const parentCats = data
          .filter(c => !c.parent_id)
          .map(c => ({
            id: c.id,
            name: c.name,
            path: `/shop?category=${encodeURIComponent(c.name)}`
          }));

        setDbCategories(parentCats);
        setCategoriesLoaded(true);
      }
    } catch (err) {
      console.error('Error fetching categories for navbar:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const cartCount = state.items.reduce((acc, item) => acc + item.quantity, 0);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    fetchCategories();
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const fetchSearch = async () => {
      if (searchQuery.trim().length >= 3) {
        setIsSearching(true);
        setShowDropdown(true);
        
        const { data, error } = await supabase
          .from('products')
          .select('id, name, images, price')
          .ilike('name', `%${searchQuery.trim()}%`)
          .limit(5);

        if (data && !error) {
          setSearchResults(data);
        }
        setIsSearching(false);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    };

    const timeoutId = setTimeout(fetchSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent | React.KeyboardEvent) => {
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
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
        color="inherit"
        elevation={0}
        sx={{
          bgcolor: '#000000',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          transition: 'all 0.3s ease-in-out',
          color: 'white'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: 70, md: 80 } }}>
            {/* Mobile Menu Icon */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2, display: { md: 'none' } }}
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
                color: 'white',
                textDecoration: 'none',
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                letterSpacing: '-0.02em',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
                '& span': {
                  color: 'primary.main',
                  ml: 0.5
                }
              }}
            >
              DEVIL<span>GAMING</span>
            </Typography>

            {/* Desktop Categories */}
            <Box sx={{ flexGrow: { xs: 0, md: 1 }, display: { xs: 'none', md: 'flex' }, ml: 4, alignItems: 'center' }}>
              <Box
                onClick={handleOpenMenu}
                sx={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  transition: 'all 0.3s',
                  color: 'rgba(255,255,255,0.9)',
                  '&:hover': { color: 'primary.main' },
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    width: '0%',
                    height: '2px',
                    bottom: -4,
                    left: 0,
                    backgroundColor: 'primary.main',
                    transition: 'width 0.3s'
                  },
                  '&:hover::after': { width: '100%' }
                }}
              >
                Categorías <ChevronDown size={14} style={{ marginLeft: 4 }} />
              </Box>
              <Button
                component={Link}
                href="/pc-builder"
                color="inherit"
                startIcon={<Zap size={16} color="#cc0000" />}
                sx={{
                  ml: 3,
                  fontWeight: 800,
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s',
                  '&:hover': { color: 'primary.main', bgcolor: 'transparent' }
                }}
              >
                Armá tu PC
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                elevation={0}
                sx={{ mt: '20px' }}
                PaperProps={{
                  sx: {
                    borderRadius: 3,
                    minWidth: 220,
                    p: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.12)',
                    border: '1px solid rgba(0,0,0,0.06)'
                  }
                }}
              >
                {loadingCategories ? (
                  <MenuItem disabled sx={{ justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={24} thickness={5} />
                  </MenuItem>
                ) : dbCategories.map((cat, index) => (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <MenuItem
                      onClick={() => {
                        router.push(cat.path);
                        handleCloseMenu();
                      }}
                      sx={{
                        py: 1.5,
                        px: 2,
                        borderRadius: 2,
                        transition: 'all 0.2s',
                        mb: 0.5,
                        '&:hover': {
                          bgcolor: 'rgba(204,0,0,0.06)',
                          color: 'primary.main',
                          transform: 'translateX(5px)'
                        }
                      }}
                    >
                      <ListItemText
                        primary={cat.name}
                        primaryTypographyProps={{
                          fontWeight: 800,
                          fontSize: '0.85rem'
                        }}
                      />
                    </MenuItem>
                  </motion.div>
                ))}
              </Menu>
            </Box>

            {/* Spacer for Mobile */}
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }} />

            {/* Search Bar */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'flex' }, justifyContent: 'center' }}>
              <ClickAwayListener onClickAway={() => setShowDropdown(false)}>
                <SearchWrapper>
                  <SearchIconWrapper>
                    <Search size={18} />
                  </SearchIconWrapper>
                  <StyledInputBase
                    placeholder="Buscar hardware..."
                    inputProps={{ 'aria-label': 'search' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (searchQuery.trim().length >= 3) setShowDropdown(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearchSubmit(e);
                        setShowDropdown(false);
                      }
                    }}
                  />
                  <AnimatePresence>
                    {showDropdown && searchQuery.trim().length >= 3 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          marginTop: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.98)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '12px',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                          zIndex: 1000,
                          overflow: 'hidden',
                          border: '1px solid rgba(0,0,0,0.1)',
                          color: 'black'
                        }}
                      >
                        {isSearching ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <Loader2 className="animate-spin" size={24} color="#cc0000" />
                          </Box>
                        ) : searchResults.length > 0 ? (
                          <List disablePadding>
                            {searchResults.map((product) => (
                              <ListItem 
                                key={product.id} 
                                disablePadding
                                sx={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}
                              >
                                <ListItemButton
                                  onClick={() => {
                                    router.push(`/product/${product.id}`);
                                    setShowDropdown(false);
                                    setSearchQuery('');
                                  }}
                                  sx={{ py: 1.5, px: 2, '&:hover': { bgcolor: 'rgba(204,0,0,0.04)' } }}
                                >
                                  <ListItemAvatar>
                                    <Avatar
                                      src={product.images?.[0] || '/default-gaming-product.png'}
                                      variant="rounded"
                                      sx={{ width: 40, height: 40, bgcolor: '#f4f4f4', objectFit: 'contain' }}
                                    />
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={product.name}
                                    secondary={`$${product.price.toLocaleString('es-ES')}`}
                                    primaryTypographyProps={{ fontWeight: 700, fontSize: '0.85rem', color: 'text.primary', noWrap: true }}
                                    secondaryTypographyProps={{ fontWeight: 800, color: 'primary.main', fontSize: '0.8rem' }}
                                  />
                                </ListItemButton>
                              </ListItem>
                            ))}
                            <ListItem disablePadding>
                              <ListItemButton
                                onClick={(e) => {
                                  handleSearchSubmit(e as any);
                                  setShowDropdown(false);
                                }}
                                sx={{ py: 1.5, justifyContent: 'center', bgcolor: '#fafafa', '&:hover': { bgcolor: '#f0f0f0' } }}
                              >
                                <Typography variant="caption" fontWeight={800} color="secondary.main">
                                  Ver todos los resultados
                                </Typography>
                              </ListItemButton>
                            </ListItem>
                          </List>
                        ) : (
                          <Box sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary" fontWeight={600}>
                              No se encontraron productos para "{searchQuery}"
                            </Typography>
                          </Box>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </SearchWrapper>
              </ClickAwayListener>
            </Box>

            {/* Icons */}
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2, gap: 1 }}>
              {user?.role === 'admin' && (
                <Button
                  component={Link}
                  href="/admin"
                  size="small"
                  variant="outlined"
                  startIcon={<LayoutDashboard size={16} />}
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    display: { xs: 'none', sm: 'flex' },
                    '&:hover': {
                      bgcolor: 'rgba(204,0,0,0.06)',
                      borderColor: 'primary.dark',
                    }
                  }}
                >
                  Admin
                </Button>
              )}
              <IconButton
                color="inherit"
                sx={{ ml: 0.5, '&:hover': { color: 'primary.main' } }}
                onClick={() => setCartOpen(true)}
              >
                <Badge badgeContent={cartCount} color="primary">
                  <motion.div
                    key={cartCount}
                    initial={{ scale: 1.5, color: '#cc0000' }}
                    animate={{ scale: 1, color: 'inherit' }}
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
        PaperProps={{
          sx: {
            width: 300,
            background: 'white',
          }
        }}
      >
        <Box
          sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          role="presentation"
        >
          {/* Drawer Header */}
          <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                color: 'secondary.main',
                fontSize: '1.2rem',
                textDecoration: 'none',
                '& span': { color: 'primary.main', ml: 0.5 }
              }}
            >
              DEVIL<span>GAMING</span>
            </Typography>
            <IconButton onClick={toggleDrawer(false)}>
              <X size={20} />
            </IconButton>
          </Box>

          {/* Drawer Categories */}
          <Box sx={{ flexGrow: 1, py: 2, overflowY: 'auto' }}>
            <Typography variant="overline" sx={{ px: 3, fontWeight: 800, color: 'text.secondary', letterSpacing: '0.1em' }}>
              Búsqueda
            </Typography>
            <Box sx={{ px: 3, mb: 3 }}>
              <TextField 
                fullWidth 
                placeholder="¿Qué estás buscando?"
                size="small"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit(e);
                    toggleDrawer(false)(e as any);
                  }
                }}
                InputProps={{
                  sx: { borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)' },
                  startAdornment: <Search size={16} style={{ marginRight: 8, opacity: 0.5 }} />
                }}
              />
            </Box>

            <Typography variant="overline" sx={{ px: 3, fontWeight: 800, color: 'text.secondary', letterSpacing: '0.1em' }}>
              Categorías
            </Typography>
            <List>
              {loadingCategories ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : dbCategories.map((cat, index) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href={cat.path}
                      onClick={toggleDrawer(false)}
                      sx={{
                        py: 2,
                        px: 3,
                        '&:hover': { bgcolor: 'rgba(204,0,0,0.04)', color: 'primary.main' }
                      }}
                    >
                      <ListItemText
                        primary={cat.name}
                        primaryTypographyProps={{ fontWeight: 800, fontSize: '0.95rem' }}
                      />
                    </ListItemButton>
                  </ListItem>
                </motion.div>
              ))}
            </List>
          </Box>

          {/* Drawer Footer */}
          <Box sx={{ p: 3, borderTop: '1px solid rgba(0,0,0,0.06)', bgcolor: 'rgba(0,0,0,0.01)' }}>
            <Box sx={{ mb: 2 }}>
              <Button
                component={Link}
                href="/pc-builder"
                variant="contained"
                fullWidth
                onClick={toggleDrawer(false)}
                startIcon={<Zap size={18} />}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  mb: 1.5,
                  fontWeight: 900,
                  bgcolor: 'primary.main',
                  boxShadow: '0 4px 12px rgba(204,0,0,0.3)'
                }}
              >
                Armá tu PC
              </Button>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, color: 'text.secondary' }}>
              <Instagram size={20} cursor="pointer" />
              <Facebook size={20} cursor="pointer" />
              <Mail size={20} cursor="pointer" />
              <Phone size={20} cursor="pointer" />
            </Box>
          </Box>
        </Box>
      </Drawer>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default Navbar;
