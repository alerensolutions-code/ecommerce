import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  IconButton, 
  Avatar, 
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Stack
} from '@mui/material';
import { Plus, Search, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { products } from '../../data/mockData';

const ProductsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpen = (product: any = null) => {
    setSelectedProduct(product);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProduct(null);
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Gestión de Productos</Typography>
        <Button 
          variant="contained" 
          startIcon={<Plus size={20} />} 
          onClick={() => handleOpen()}
          sx={{ py: 1.5, px: 3, fontWeight: 700 }}
        >
          Nuevo Producto
        </Button>
      </Stack>

      <Paper elevation={0} sx={{ p: 0, borderRadius: 4, border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <TextField
            fullWidth
            placeholder="Buscar por nombre o marca..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 400 }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Producto</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Categoría</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Precio</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Stock</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar 
                        src={product.images[0]} 
                        variant="rounded"
                        sx={{ width: 40, height: 40, border: '1px solid #eee' }}
                      />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{product.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{product.brand}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip label={product.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>${product.price.toLocaleString('es-ES')}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Chip 
                      label={product.stock > 0 ? 'En Stock' : 'Bajo Stock'} 
                      size="small" 
                      color={product.stock > 5 ? 'success' : 'warning'}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton size="small" onClick={() => handleOpen(product)}>
                        <Edit2 size={18} />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <Trash2 size={18} />
                      </IconButton>
                      <IconButton size="small" component="a" href={`/product/${product.id}`} target="_blank">
                        <ExternalLink size={18} />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Product Modal */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {selectedProduct ? 'Editar Producto' : 'Añadir Nuevo Producto'}
        </DialogTitle>
        <DialogContent dividers sx={{ py: 4 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={3}>
                <TextField fullWidth label="Nombre del Producto" defaultValue={selectedProduct?.name} />
                <TextField fullWidth label="Breve Descripción" multiline rows={2} defaultValue={selectedProduct?.description} />
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <TextField fullWidth label="Precio ($)" type="number" defaultValue={selectedProduct?.price} />
                  </Grid>
                  <Grid size={6}>
                    <TextField fullWidth label="Stock" type="number" defaultValue={selectedProduct?.stock} />
                  </Grid>
                </Grid>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box 
                sx={{ 
                  width: '100%', 
                  aspectRatio: '1/1', 
                  border: '2px dashed #ddd', 
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.02)', borderColor: 'primary.main' }
                }}
              >
                {selectedProduct ? (
                  <Box component="img" src={selectedProduct.images[0]} sx={{ width: '100%', p: 2 }} />
                ) : (
                  <>
                    <Plus size={32} opacity={0.3} />
                    <Typography variant="caption" color="text.secondary">Subir Imagen</Typography>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} color="inherit" sx={{ fontWeight: 600 }}>Cancelar</Button>
          <Button variant="contained" onClick={handleClose} sx={{ fontWeight: 800, px: 4 }}>
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductsManagement;
