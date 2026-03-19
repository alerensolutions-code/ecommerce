import React from 'react';
import { 
  Drawer, 
  Box, 
  Typography, 
  IconButton, 
  List, 
  ListItem, 
  ListItemAvatar, 
  Avatar, 
  Divider, 
  Button, 
  Stack
} from '@mui/material';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ open, onClose }) => {
  const { state, dispatch } = useCart();

  const total = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const handleRemove = (id: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 }, bgcolor: '#fff' }
      }}
    >
      <Box sx={{ h: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <ShoppingBag size={20} color="#cc0000" />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Tu Carrito ({state.items.length})</Typography>
          </Stack>
          <IconButton onClick={onClose}>
            <X size={24} />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
          {state.items.length === 0 ? (
            <Box sx={{ py: 10, textAlign: 'center' }}>
              <ShoppingBag size={64} color="rgba(0,0,0,0.1)" strokeWidth={1} style={{ marginBottom: '16px' }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>Tu carrito está vacío</Typography>
              <Button 
                component={Link} 
                to="/shop" 
                variant="contained" 
                onClick={onClose}
                sx={{ borderRadius: '50px', px: 4 }}
              >
                Ir a la Tienda
              </Button>
            </Box>
          ) : (
            <List>
              {state.items.map((item) => (
                <React.Fragment key={item.id}>
                  <ListItem alignItems="flex-start" sx={{ px: 1, py: 2 }}>
                    <ListItemAvatar sx={{ mr: 2 }}>
                      <Avatar 
                        src={item.images[0]} 
                        variant="rounded" 
                        sx={{ width: 80, height: 80, bgcolor: '#f5f5f5', border: '1px solid rgba(0,0,0,0.05)' }} 
                      />
                    </ListItemAvatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, pr: 3 }}>{item.name}</Typography>
                      <Typography variant="body2" color="primary.main" sx={{ fontWeight: 800, mb: 1 }}>
                        ${item.price.toLocaleString('es-ES')}
                      </Typography>
                      
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" alignItems="center" sx={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: 1 }}>
                          <IconButton size="small" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
                            <Minus size={14} />
                          </IconButton>
                          <Typography variant="body2" sx={{ px: 1, minWidth: 20, textAlign: 'center', fontWeight: 700 }}>
                            {item.quantity}
                          </Typography>
                          <IconButton size="small" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                            <Plus size={14} />
                          </IconButton>
                        </Stack>
                        <IconButton size="small" color="error" onClick={() => handleRemove(item.id)}>
                          <Trash2 size={16} />
                        </IconButton>
                      </Stack>
                    </Box>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        {/* Footer */}
        {state.items.length > 0 && (
          <Box sx={{ p: 3, borderTop: '1px solid rgba(0,0,0,0.05)', bgcolor: 'rgba(0,0,0,0.01)' }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>Subtotal</Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>${total.toLocaleString('es-ES')}</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Envío e impuestos se calcularán en el pago.
              </Typography>
              <Button 
                component={Link} 
                to="/cart" 
                variant="outlined" 
                fullWidth 
                onClick={onClose}
                sx={{ py: 1.5, fontWeight: 700 }}
              >
                Ver Carrito Completo
              </Button>
              <Button 
                component={Link} 
                to="/checkout" 
                variant="contained" 
                fullWidth 
                onClick={onClose}
                endIcon={<ArrowRight size={20} />}
                sx={{ py: 2, fontWeight: 800, fontSize: '1rem' }}
              >
                Tramitar Pedido
              </Button>
            </Stack>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default CartDrawer;
