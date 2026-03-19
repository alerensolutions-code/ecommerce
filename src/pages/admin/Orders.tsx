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
  Chip
} from '@mui/material';
import { Eye, Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';

const OrdersManagement = () => {
  const mockOrders = [
    { id: '#DG-98231', customer: 'Juan Pérez', date: '2024-03-01', total: '$1.240', status: 'Entregado', color: 'success', icon: <CheckCircle size={16} /> },
    { id: '#DG-98232', customer: 'María García', date: '2024-03-02', total: '$450', status: 'Enviado', color: 'info', icon: <Truck size={16} /> },
    { id: '#DG-98233', customer: 'Carlos Rodríguez', date: '2024-03-02', total: '$2.100', status: 'Pendiente', color: 'warning', icon: <Clock size={16} /> },
    { id: '#DG-98234', customer: 'Ana Sánchez', date: '2024-03-03', total: '$890', status: 'Cancelado', color: 'error', icon: <AlertCircle size={16} /> },
    { id: '#DG-98235', customer: 'Pedro López', date: '2024-03-03', total: '$1.150', status: 'Enviado', color: 'info', icon: <Truck size={16} /> },
  ];

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
              {mockOrders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{order.id}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{order.customer}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{order.total}</TableCell>
                  <TableCell>
                    <Chip 
                      icon={order.icon}
                      label={order.status} 
                      size="small" 
                      color={order.color as any}
                      sx={{ fontWeight: 600, px: 1, '& .MuiChip-icon': { ml: 0 } }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small">
                      <Eye size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default OrdersManagement;
