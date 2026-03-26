"use client";

import { useState, useEffect } from 'react';
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
import { supabase } from '../../../lib/supabase';
import { MenuItem } from '@mui/material';

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category_id: string;
  category?: { name: string };
  stock: number;
};

type Category = {
  id: string;
  name: string;
};

const ProductsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    category_id: '',
    price: 0,
    stock: 0,
    image: ''
  });

  const fetchData = async () => {
    setLoading(true);
    // Fetch products with their category names using a join
    const { data: productsData, error: pError } = await supabase
      .from('products')
      .select('*, category:categories(name)')
      .order('created_at', { ascending: false });
    
    const { data: catsData } = await supabase.from('categories').select('*').order('name');
    
    if (pError) console.error("Error fetching products:", pError);
    
    setAllProducts(productsData || []);
    setDbCategories(catsData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = allProducts.filter((p: Product) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpen = (product: Product | null = null) => {
    setSelectedProduct(product);
    setFormValues({
      name: product?.name || '',
      description: product?.description || '',
      category_id: product?.category_id || '',
      price: product?.price || 0,
      stock: product?.stock || 0,
      image: product?.image || ''
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProduct(null);
  };

  const handleSave = async () => {
    if (selectedProduct) {
      await supabase.from('products').update(formValues).eq('id', selectedProduct.id);
    } else {
      await supabase.from('products').insert([formValues]);
    }
    fetchData();
    handleClose();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este producto?')) {
      await supabase.from('products').delete().eq('id', id);
      fetchData();
    }
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
              {loading ? (
                <TableRow><TableCell colSpan={6} align="center">Cargando...</TableCell></TableRow>
              ) : filteredProducts.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar 
                        src={product.image} 
                        variant="rounded"
                        sx={{ width: 40, height: 40, border: '1px solid #eee' }}
                      />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{product.name}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip label={product.category?.name || 'Sin categoría'} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>${product.price.toLocaleString('es-ES')}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Chip 
                      label={product.stock > 0 ? 'En Stock' : 'Sin Stock'} 
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
                      <IconButton size="small" color="error" onClick={() => handleDelete(product.id)}>
                        <Trash2 size={18} />
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
                <TextField 
                  fullWidth 
                  label="Nombre del Producto" 
                  value={formValues.name} 
                  onChange={(e) => setFormValues({...formValues, name: e.target.value})} 
                />
                <TextField 
                  fullWidth 
                  label="Breve Descripción" 
                  multiline 
                  rows={2} 
                  value={formValues.description} 
                  onChange={(e) => setFormValues({...formValues, description: e.target.value})} 
                />
                  <Grid container spacing={2}>
                    <Grid size={12}>
                      <TextField 
                        select 
                        fullWidth 
                        label="Categoría" 
                        value={formValues.category_id}
                        onChange={(e) => setFormValues({...formValues, category_id: e.target.value})}
                      >
                        {dbCategories.map((option) => (
                          <MenuItem key={option.id} value={option.id}>
                            {option.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid size={6}>
                      <TextField 
                        fullWidth 
                        label="Precio ($)" 
                        type="number" 
                        value={formValues.price} 
                        onChange={(e) => setFormValues({...formValues, price: parseFloat(e.target.value)})} 
                      />
                    </Grid>
                    <Grid size={6}>
                      <TextField 
                        fullWidth 
                        label="Stock" 
                        type="number" 
                        value={formValues.stock} 
                        onChange={(e) => setFormValues({...formValues, stock: parseInt(e.target.value)})} 
                      />
                    </Grid>
                  </Grid>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={2}>
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
                    overflow: 'hidden'
                  }}
                >
                  {formValues.image ? (
                    <Box component="img" src={formValues.image} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <>
                      <Plus size={32} opacity={0.3} />
                      <Typography variant="caption" color="text.secondary">Vista Previa</Typography>
                    </>
                  )}
                </Box>
                <TextField 
                  fullWidth 
                  size="small" 
                  label="URL de la Imagen" 
                  value={formValues.image} 
                  onChange={(e) => setFormValues({...formValues, image: e.target.value})} 
                />
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} color="inherit" sx={{ fontWeight: 600 }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} sx={{ fontWeight: 800, px: 4 }}>
            {selectedProduct ? 'Actualizar' : 'Crear Producto'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductsManagement;
