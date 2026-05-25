"use client";
import React, { useState } from 'react';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, Divider, AppBar, Toolbar, Avatar, IconButton, useTheme, useMediaQuery
} from '@mui/material';
import {
  LayoutDashboard, Package, ShoppingBag, LogOut, Store, Menu, Settings
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

const drawerWidth = 240;

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { text: 'Productos', icon: <Package size={20} />, path: '/admin/products' },
    { text: 'Categorías', icon: <Package size={20} />, path: '/admin/categories' },
    { text: 'Pedidos', icon: <ShoppingBag size={20} />, path: '/admin/orders' },
    { text: 'Ajustes', icon: <Settings size={20} />, path: '/admin/settings' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const drawerContent = (
    <>
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
          {"DEVIL"}
          <span style={{ color: 'white' }}>ADMIN</span>
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
      <List sx={{ px: 2, py: 4 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                href={item.path}
                onClick={isMobile ? handleDrawerToggle : undefined}
                sx={{
                  borderRadius: 2,
                  bgcolor: isActive ? 'primary.main' : 'transparent',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.main' : 'rgba(204, 0, 0, 0.1)'
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ mt: 'auto', p: 2 }}>
        <List>
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton component={Link} href="/" sx={{ borderRadius: 2, '&:hover': { bgcolor: 'rgba(255,255,255,0.07)' } }}>
              <ListItemIcon sx={{ color: 'rgba(255,255,255,0.6)', minWidth: 40 }}>
                <Store size={20} />
              </ListItemIcon>
              <ListItemText primary="Ir a la Tienda" primaryTypographyProps={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2 }}>
              <ListItemIcon sx={{ color: 'rgba(255,255,255,0.5)', minWidth: 40 }}>
                <LogOut size={20} />
              </ListItemIcon>
              <ListItemText primary="Cerrar Sesión" primaryTypographyProps={{ fontSize: '0.9rem' }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </>
  );

  return (
    <ProtectedRoute adminOnly>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f4f4' }}>
        <Box
          component="nav"
          sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                bgcolor: 'secondary.main',
                color: 'white',
              },
            }}
          >
            {drawerContent}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                borderRight: '1px solid rgba(0,0,0,0.05)',
                bgcolor: 'secondary.main',
                color: 'white',
              },
            }}
            open
          >
            {drawerContent}
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { md: `calc(100% - ${drawerWidth}px)` },
            maxWidth: '100vw'
          }}
        >
          <AppBar
            position="sticky"
            color="inherit"
            elevation={0}
            sx={{
              bgcolor: 'white',
              borderBottom: '1px solid rgba(0,0,0,0.05)',
              zIndex: (theme) => theme.zIndex.drawer - 1
            }}
          >
            <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2, display: { md: 'none' }, color: 'secondary.main' }}
                >
                  <Menu />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{user?.name || 'Admin'}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 700 }}>{user?.name?.charAt(0) || 'A'}</Avatar>
              </Box>
            </Toolbar>
          </AppBar>
          <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, overflowX: 'hidden' }}>
            {children}
          </Box>
        </Box>
      </Box>
    </ProtectedRoute>
  );
};

export default AdminLayout;
