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
  Avatar,
  Stack
} from '@mui/material';
import { Edit2, Trash2, Mail } from 'lucide-react';

const UsersManagement = () => {
  const mockUsers = [
    { id: 1, name: 'Juan Pérez', email: 'juan@example.com', role: 'Cliente', status: 'Activo', color: 'success' },
    { id: 2, name: 'María García', email: 'maria@example.com', role: 'Cliente', status: 'Inactivo', color: 'error' },
    { id: 3, name: 'Carlos Rodríguez', email: 'carlos@example.com', role: 'Administrador', status: 'Activo', color: 'success' },
    { id: 4, name: 'Ana Sánchez', email: 'ana@example.com', role: 'Cliente', status: 'Activo', color: 'success' },
    { id: 5, name: 'Pedro López', email: 'pedro@example.com', role: 'Cliente', status: 'Activo', color: 'success' },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 800 }}>Gestión de Usuarios</Typography>

      <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Usuario</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Correo Electrónico</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Rol</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockUsers.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'secondary.main', fontWeight: 700 }}>{u.name.charAt(0)}</Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{u.name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{u.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={u.role} 
                      size="small" 
                      color={u.role === 'Administrador' ? 'primary' : 'default'}
                      variant={u.role === 'Administrador' ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={u.status} 
                      size="small" 
                      color={u.color as any}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton size="small">
                        <Edit2 size={18} />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <Trash2 size={18} />
                      </IconButton>
                      <IconButton size="small" color="info">
                        <Mail size={18} />
                      </IconButton>
                    </Stack>
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

export default UsersManagement;
