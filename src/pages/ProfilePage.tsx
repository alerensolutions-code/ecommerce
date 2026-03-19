import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Avatar, 
  Button, 
  Stack, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  ListItemButton,
  Chip
} from '@mui/material';
import { 
  Package, 
  Settings, 
  LogOut, 
  CreditCard, 
  MapPin, 
  Heart,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { text: 'Mis Pedidos', icon: <Package size={20} />, path: '/orders' },
    { text: 'Direcciones', icon: <MapPin size={20} />, path: '/addresses' },
    { text: 'Métodos de Pago', icon: <CreditCard size={20} />, path: '/payments' },
    { text: 'Lista de Deseos', icon: <Heart size={20} />, path: '/wishlist' },
    { text: 'Configuración', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <Box sx={{ bgcolor: '#f4f4f4', minHeight: '80vh', py: 8 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 4, 
                borderRadius: 4, 
                border: '1px solid rgba(0,0,0,0.05)',
                textAlign: 'center'
              }}
            >
              <Avatar 
                sx={{ 
                  width: 100, 
                  height: 100, 
                  mx: 'auto', 
                  mb: 2, 
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                  fontWeight: 800
                }}
              >
                {user.name.charAt(0)}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>{user.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{user.email}</Typography>
              
              <Chip 
                label={user.role === 'admin' ? 'Administrador' : 'Cliente Premium'} 
                color="primary" 
                size="small" 
                sx={{ mb: 4, fontWeight: 700 }}
              />

              <Divider sx={{ mb: 2 }} />

              <List disablePadding>
                {menuItems.map((item) => (
                  <ListItem key={item.text} disablePadding>
                    <ListItemButton sx={{ borderRadius: 2, py: 1.5 }}>
                      <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.text} 
                        primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }} 
                      />
                      <ChevronRight size={16} opacity={0.3} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>

              <Button 
                fullWidth 
                variant="outlined" 
                color="error" 
                startIcon={<LogOut size={20} />}
                onClick={handleLogout}
                sx={{ mt: 4, py: 1.5, fontWeight: 700 }}
              >
                Cerrar Sesión
              </Button>
            </Paper>
          </Grid>

          {/* Main Content */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={4}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 4, 
                  borderRadius: 4, 
                  border: '1px solid rgba(0,0,0,0.05)'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Información Personal</Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Nombre Completo</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{user.name}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Usuario</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>@{user.username}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Correo Electrónico</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{user.email}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Miembro desde</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>Marzo 2024</Typography>
                  </Grid>
                </Grid>
                <Button variant="contained" sx={{ mt: 4, px: 4, fontWeight: 700 }}>
                  Editar Perfil
                </Button>
              </Paper>

              <Paper 
                elevation={0} 
                sx={{ 
                  p: 4, 
                  borderRadius: 4, 
                  border: '1px solid rgba(0,0,0,0.05)'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>Últimos Pedidos</Typography>
                <Box sx={{ py: 4, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                  <Package size={48} opacity={0.1} />
                  <Typography color="text.secondary" sx={{ mt: 2 }}>Aún no has realizado ningún pedido.</Typography>
                  <Button 
                    variant="text" 
                    color="primary" 
                    onClick={() => navigate('/shop')}
                    sx={{ mt: 1, fontWeight: 700 }}
                  >
                    Empezar a comprar
                  </Button>
                </Box>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ProfilePage;
