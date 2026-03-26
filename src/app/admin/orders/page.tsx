"use client";

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  IconButton, 
  Chip,
  Select,
  MenuItem,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider
} from '@mui/material';
import { Eye, Clock, CheckCircle, Truck, AlertCircle, ShoppingBag } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const statusIcons: { [key: string]: any } = {
  'Pendiente': <Clock size={16} />,
  'Enviado': <Truck size={16} />,
  'Entregado': <CheckCircle size={16} />,
  'Cancelado': <AlertCircle size={16} />,
};

const statusColors: { [key: string]: any } = {
  'Pendiente': 'warning',
  'Enviado': 'info',
  'Entregado': 'success',
  'Cancelado': 'error',
};

const OrdersManagement = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (!error) {
      fetchOrders();
    }
  };

  const handleViewDetail = (order: any) => {
    setSelectedOrder(order);
    setOpenDetail(true);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 800 }}>Gestión de Pedidos</Typography>

      <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>ID Pedido</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Cliente</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} align="center">Cargando...</TableCell></TableRow>
              ) : orders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{order.id}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{order.customer_name}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{order.total}</TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      sx={{ 
                        minWidth: 140, 
                        fontWeight: 600,
                        '& .MuiSelect-select': { 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          py: 0.5 
                        } 
                      }}
                      renderValue={(value) => (
                        <Chip 
                          icon={statusIcons[value]}
                          label={value} 
                          size="small" 
                          color={statusColors[value]}
                          sx={{ fontWeight: 700, border: 'none' }}
                        />
                      )}
                    >
                      <MenuItem value="Pendiente"><Clock size={16} style={{marginRight: 8}}/> Pendiente</MenuItem>
                      <MenuItem value="Enviado"><Truck size={16} style={{marginRight: 8}}/> Enviado</MenuItem>
                      <MenuItem value="Entregado"><CheckCircle size={16} style={{marginRight: 8}}/> Entregado</MenuItem>
                      <MenuItem value="Cancelado"><AlertCircle size={16} style={{marginRight: 8}}/> Cancelado</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleViewDetail(order)}>
                      <Eye size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Order Detail Modal */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 2 }}>
          <ShoppingBag size={24} color="#cc0000" />
          Detalle del Pedido {selectedOrder?.id}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ py: 2 }}>
            <Box>
              <Typography variant="overline" color="text.secondary">Cliente</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{selectedOrder?.customer_name}</Typography>
              <Typography variant="body2" color="text.secondary">{new Date(selectedOrder?.created_at).toLocaleString()}</Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ mb: 2, display: 'block' }}>Productos</Typography>
              <Stack spacing={1}>
                {selectedOrder?.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item: any, idx: number) => (
                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.quantity}x {item.name}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        ${(item.price * item.quantity).toLocaleString('es-ES')}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">Sin detalle de productos (pedido histórico).</Typography>
                )}
              </Stack>
            </Box>

            <Divider />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Total Pagado</Typography>
              <Typography variant="h5" color="primary" sx={{ fontWeight: 800 }}>
                {selectedOrder?.total}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDetail(false)} variant="contained" sx={{ px: 4, fontWeight: 800 }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrdersManagement;
