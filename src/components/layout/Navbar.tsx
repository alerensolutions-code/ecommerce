"use client";

import React, { useState } from 'react';
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
  ListItemIcon
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
  Layers
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useCart } from '../../context/CartContext';
import { alpha, styled } from '@mui/material/styles';
import CartDrawer from '../cart/CartDrawer';

const SearchWrapper = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.secondary.main, 0.05),
  '&:hover': {
    backgroundColor: alpha(theme.palette.secondary.main, 0.1),
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
  color: theme.palette.text.secondary,
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

function HideOnScroll(props: { children: React.ReactElement }) {
  const { children } = props;
  const trigger = useScrollTrigger();
  return (
    <Slide direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const categories = [
  { name: 'Todas', icon: <Layers size={20} />, path: '/shop' },
  { name: 'Monitores', icon: <Monitor size={20} />, path: '/shop?category=Monitores' },
  { name: 'Tarjetas Gráficas', icon: <Cpu size={20} />, path: '/shop?category=Tarjetas Gráficas' },
  { name: 'Procesadores', icon: <Cpu size={20} />, path: '/shop?category=Procesadores' },
  { name: 'Periféricos', icon: <Keyboard size={20} />, path: '/shop?category=Periféricos' },
  { name: 'Consolas', icon: <Gamepad size={20} />, path: '/shop?category=Consolas' },
  { name: 'Accesorios', icon: <Keyboard size={20} />, path: '/shop?category=Accesorios' },
];

const Navbar = () => {
  const { state } = useCart();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const cartCount = state.items.reduce((acc, item) => acc + item.quantity, 0);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
      return;
    }
    setMobileOpen(open);
  };

  return (
    <>
      <HideOnScroll>
        <AppBar position="sticky" color="inherit" elevation={1} sx={{ bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)' }}>
          <Container maxWidth="xl">
            <Toolbar disableGutters>
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
                  fontWeight: 800,
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontSize: '1.5rem',
                  letterSpacing: '.1rem',
                  '& span': { color: 'secondary.main' }
                }}
              >
                DEVIL<span>GAMING</span>
              </Typography>

              {/* Desktop Categories */}
              <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 4 }}>
                <Button
                  color="inherit"
                  onClick={handleOpenMenu}
                  endIcon={<ChevronDown size={16} />}
                  sx={{ fontWeight: 600, '&:hover': { color: 'primary.main' } }}
                >
                  Categorías
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseMenu}
                  sx={{ mt: '5px' }}
                >
                  {categories.map((cat) => (
                    <MenuItem 
                      key={cat.name} 
                      onClick={() => {
                        router.push(cat.path);
                        handleCloseMenu();
                      }}
                      sx={{ minWidth: 200, py: 1.5 }}
                    >
                      <ListItemIcon sx={{ color: 'primary.main' }}>{cat.icon}</ListItemIcon>
                      <ListItemText primary={cat.name} primaryTypographyProps={{ fontWeight: 500 }} />
                    </MenuItem>
                  ))}
                </Menu>
                <Button 
                  component={Link} 
                  href="/shop" 
                  color="inherit" 
                  sx={{ fontWeight: 600, ml: 2, '&:hover': { color: 'primary.main' } }}
                >
                  Destacados
                </Button>
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
                  />
                </SearchWrapper>
              </Box>

              {/* Icons */}
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                <IconButton 
                  color="inherit"
                  sx={{ ml: 1, '&:hover': { color: 'primary.main' } }}
                  onClick={() => setCartOpen(true)}
                >
                  <Badge badgeContent={cartCount} color="primary">
                    <ShoppingCart size={22} />
                  </Badge>
                </IconButton>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
      </HideOnScroll>

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
            {categories.map((cat) => (
              <ListItem key={cat.name} disablePadding>
                <ListItemButton component={Link} href={cat.path}>
                  <ListItemIcon sx={{ color: 'primary.main' }}>{cat.icon}</ListItemIcon>
                  <ListItemText primary={cat.name} />
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
