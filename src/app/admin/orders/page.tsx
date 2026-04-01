"use client";

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
  Divider,
  TablePagination,
  TextField,
  InputAdornment,
  Grid,
  Tooltip
} from '@mui/material';
import { Eye, Clock, CheckCircle, Truck, AlertCircle, ShoppingBag, Search, User, Mail, Phone, MapPin, FileDown } from 'lucide-react';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { exportToCSV } from '../../../lib/export';

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
  
  // Filtros y Paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const searchParams = useSearchParams();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setStatusFilter(statusParam);
    }
  }, [searchParams]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           order.id?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const pagedOrders = useMemo(() => {
    return filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredOrders, page, rowsPerPage]);

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

      <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden', mb: 4 }}>
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por cliente o ID..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={18} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent={{ md: 'flex-end' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Estado:</Typography>
                <Select
                  size="small"
                  value={statusFilter}
                  onChange={(e: any) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="Pendiente">Pendiente</MenuItem>
                  <MenuItem value="Enviado">Enviado</MenuItem>
                  <MenuItem value="Entregado">Entregado</MenuItem>
                  <MenuItem value="Cancelado">Cancelado</MenuItem>
                </Select>
                
                <Tooltip title="Exportar a CSV">
                  <IconButton 
                    onClick={() => exportToCSV(filteredOrders, 'pedidos_devil_game')}
                    sx={{ bgcolor: 'rgba(0,0,0,0.02)', '&:hover': { color: 'primary.main', bgcolor: 'rgba(0,0,0,0.05)' } }}
                  >
                    <FileDown size={20} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Grid>
          </Grid>
        </Box>

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
              ) : pagedOrders.map((order) => (
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
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredOrders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Pedidos por página"
        />
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
              <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2 }}>Información del Cliente</Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.main', color: 'white', display: 'flex' }}>
                       <User size={18} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Nombre</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedOrder?.customer_name}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#2196f3', color: 'white', display: 'flex' }}>
                       <Mail size={18} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Email</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedOrder?.customer_email || 'N/A'}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#4caf50', color: 'white', display: 'flex' }}>
                       <Phone size={18} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Teléfono</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedOrder?.customer_phone || 'N/A'}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#ff9800', color: 'white', display: 'flex' }}>
                       <MapPin size={18} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Dirección</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedOrder?.shipping_address || 'N/A'}</Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
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

const OrdersPage = () => {
  return (
    <Suspense fallback={<div>Cargando pedidos...</div>}>
      <OrdersManagement />
    </Suspense>
  );
};

export default OrdersPage;
