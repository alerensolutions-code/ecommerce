"use client";

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
  Stack,
  TablePagination,
  FormControl,
  InputLabel,
  Select as MuiSelect,
  Tooltip,
  MenuItem
} from '@mui/material';
import { Plus, Search, Edit2, Trash2, FileDown, Star } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { exportToCSV } from '../../../lib/export';
import { FormControlLabel, Switch } from '@mui/material';

type Product = {
  id: string;
  name: string;
  price: number;
  images?: string[];
  description: string;
  category_id: string;
  category?: { name: string; parent_id?: string | null; parent?: { name: string } };
  stock: number;
  featured?: boolean;
  technical_specs?: Record<string, any>;
};

type Category = {
  id: string;
  name: string;
  parent_id?: string | null;
  parent?: { name: string };
  spec_template?: string[];
};

const ProductsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const [selectedParentId, setSelectedParentId] = useState<string>('');

  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    category_id: '',
    price: 0,
    stock: 0,
    featured: false,
    images: [] as string[],
    technical_specs: [] as { key: string, value: string }[]
  });

  // Filtros y Paginación
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterStock, setFilterStock] = useState<string>('all');
  const [filterFeatured, setFilterFeatured] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const searchParams = useSearchParams();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch products with their category names using a join
      const { data: productsData, error: pError } = await supabase
        .from('products')
        .select('*, category:categories(name, parent_id, parent:parent_id(name))')
        .order('created_at', { ascending: false });

      const { data: catsData, error: cError } = await supabase
        .from('categories')
        .select('*, parent:parent_id(name)')
        .order('name');

      if (pError) throw pError;
      if (cError) throw cError;

      setAllProducts(productsData || []);
      setDbCategories(catsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const stockParam = searchParams.get('filter');
    if (stockParam === 'low_stock') {
      setFilterStock('low');
    }
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Filtro por término de búsqueda
    if (searchTerm) {
      result = result.filter((p: Product) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por categoría (padre o hijo)
    if (selectedCategory !== 'all') {
      result = result.filter((p: Product) =>
        p.category_id === selectedCategory ||
        p.category?.parent_id === selectedCategory
      );
    }

    // Filtro por stock
    if (filterStock !== 'all') {
      result = result.filter((p: Product) => {
        if (filterStock === 'low') return p.stock > 0 && p.stock < 5;
        if (filterStock === 'out') return p.stock === 0;
        return true;
      });
    }

    // Filtro por destacados
    if (filterFeatured !== 'all') {
      result = result.filter((p: Product) => 
        filterFeatured === 'yes' ? p.featured : !p.featured
      );
    }

    return result;
  }, [allProducts, searchTerm, selectedCategory, filterStock, filterFeatured]);

  const pagedProducts = useMemo(() => {
    return filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredProducts, page, rowsPerPage]);

  const handleOpen = (product: Product | null = null) => {
    setSelectedProduct(product);
    setFormValues({
      name: product?.name || '',
      description: product?.description || '',
      category_id: product?.category_id || '',
      price: product?.price || 0,
      stock: product?.stock || 0,
      featured: product?.featured || false,
      images: product?.images || [],
      technical_specs: product?.technical_specs
        ? Object.entries(product.technical_specs).map(([key, value]) => ({ key, value: String(value) }))
        : []
    });
    setSelectedParentId(product?.category?.parent_id || '');
    setSelectedFiles([]);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProduct(null);
    setSelectedParentId('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (formValues.images.length + selectedFiles.length + filesArray.length > 5) {
        alert('Máximo 5 imágenes permitidas en total');
        return;
      }
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  // Función para aplicar la plantilla de especificaciones de una categoría (con herencia de padres)
  const applySpecTemplate = (categoryId: string) => {
    const category = dbCategories.find(c => c.id === categoryId);
    if (!category) return;

    let allSpecs: string[] = [];

    // 1. Si es una subcategoría, intentamos obtener las specs del padre primero
    if (category.parent_id) {
      const parent = dbCategories.find(c => c.id === category.parent_id);
      if (parent?.spec_template) {
        allSpecs = [...parent.spec_template];
      }
    }

    // 2. Añadimos las specs de la propia categoría (evitando duplicados)
    if (category.spec_template) {
      const uniqueNewSpecs = category.spec_template.filter(s => !allSpecs.includes(s));
      allSpecs = [...allSpecs, ...uniqueNewSpecs];
    }

    if (allSpecs.length > 0) {
      const templateSpecs = allSpecs.map(key => ({ key, value: '' }));
      setFormValues(prev => ({
        ...prev,
        technical_specs: templateSpecs
      }));
    } else {
      setFormValues(prev => ({
        ...prev,
        technical_specs: []
      }));
    }
  };

  const handleParentChange = (parentId: string) => {
    setSelectedParentId(parentId);
    setFormValues(prev => ({ ...prev, category_id: parentId }));
    applySpecTemplate(parentId);
  };

  const handleSubCategoryChange = (subId: string) => {
    setFormValues(prev => ({ ...prev, category_id: subId }));
    if (subId) {
      applySpecTemplate(subId);
    } else {
      // Si deseleccionamos la subcategoría, volvemos a la plantilla del padre
      applySpecTemplate(selectedParentId);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setFormValues(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const uploadImagesToSupabase = async (files: File[]) => {
    const uploadedUrls: string[] = [];
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `productImages/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
    }
    return uploadedUrls;
  };

  const handleSave = async () => {
    setUploadingFiles(true);
    let finalImages = [...formValues.images];

    if (selectedFiles.length > 0) {
      const urls = await uploadImagesToSupabase(selectedFiles);
      finalImages = [...finalImages, ...urls];
    }

    const dataToSave = {
      name: formValues.name,
      description: formValues.description,
      category_id: formValues.category_id,
      price: formValues.price,
      stock: formValues.stock,
      featured: formValues.featured,
      images: finalImages,
      technical_specs: formValues.technical_specs.reduce((acc, curr) => {
        if (curr.key.trim()) {
          acc[curr.key.trim()] = curr.value;
        }
        return acc;
      }, {} as Record<string, any>)
    };

    try {
      if (selectedProduct) {
        const { error } = await supabase.from('products').update(dataToSave).eq('id', selectedProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([dataToSave]);
        if (error) throw error;
      }
      fetchData();
      handleClose();
    } catch (err: any) {
      console.error('Error guardando producto:', err);
      alert('Error al guardar el producto: ' + (err.message || JSON.stringify(err)));
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    await supabase.from('products').delete().eq('id', productToDelete.id);
    setDeleteDialogOpen(false);
    setProductToDelete(null);
    fetchData();
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
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
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="Buscar por nombre o marca..."
              variant="outlined"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
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

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="category-filter-label">Categoría</InputLabel>
              <MuiSelect
                labelId="category-filter-label"
                value={selectedCategory}
                label="Categoría"
                onChange={(e: any) => {
                  setSelectedCategory(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="all">Todas las categorías</MenuItem>
                {dbCategories.filter(cat => !cat.parent_id).map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="stock-filter-label">Stock</InputLabel>
              <MuiSelect
                labelId="stock-filter-label"
                value={filterStock}
                label="Stock"
                onChange={(e: any) => {
                  setFilterStock(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="all">Todo el Stock</MenuItem>
                <MenuItem value="low">Stock Bajo (&lt; 5)</MenuItem>
                <MenuItem value="out">Sin Stock (0)</MenuItem>
              </MuiSelect>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="featured-filter-label">Destacados</InputLabel>
              <MuiSelect
                labelId="featured-filter-label"
                value={filterFeatured}
                label="Destacados"
                onChange={(e: any) => {
                  setFilterFeatured(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="all">Ver Todos</MenuItem>
                <MenuItem value="yes">Solo Destacados</MenuItem>
                <MenuItem value="no">No Destacados</MenuItem>
              </MuiSelect>
            </FormControl>

            <Tooltip title="Exportar Inventario (CSV)">
              <IconButton
                onClick={() => exportToCSV(allProducts, 'inventario_devil_game')}
                sx={{ bgcolor: 'rgba(0,0,0,0.02)', '&:hover': { color: 'primary.main', bgcolor: 'rgba(0,0,0,0.05)' } }}
              >
                <FileDown size={20} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Producto</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Categoría</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Dest.</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Precio</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Stock / Estado</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} align="center">Cargando...</TableCell></TableRow>
              ) : pagedProducts.map((product: Product) => (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        src={product.images?.[0] || ''}
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
                  <TableCell>
                    {product.featured && (
                      <Tooltip title="Producto Destacado">
                        <Star size={20} fill="#FFD700" color="#FFD700" />
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>${product.price.toLocaleString('es-ES')}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {product.stock} unid.
                      </Typography>
                      <Chip
                        label={
                          product.stock === 0 ? 'Sin Stock' :
                            product.stock < 5 ? 'Stock Bajo' :
                              'En Stock'
                        }
                        size="small"
                        color={
                          product.stock === 0 ? 'error' :
                            product.stock < 5 ? 'warning' :
                              'success'
                        }
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton size="small" onClick={() => handleOpen(product)}>
                        <Edit2 size={18} />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteClick(product)}>
                        <Trash2 size={18} />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredProducts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Productos por página"
        />
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
                  onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Breve Descripción"
                  multiline
                  rows={2}
                  value={formValues.description}
                  onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                />
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <TextField
                      select
                      fullWidth
                      label="Categoría"
                      value={selectedParentId}
                      onChange={(e) => handleParentChange(e.target.value)}
                    >
                      <MenuItem value="">Seleccionar...</MenuItem>
                      {dbCategories.filter(c => !c.parent_id).map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  {/* Solo mostrar subcategoría si el padre tiene hijos */}
                  {selectedParentId && dbCategories.some(c => c.parent_id === selectedParentId) && (
                    <Grid size={6}>
                      <TextField
                        select
                        fullWidth
                        label="Subcategoría (Opcional)"
                        value={formValues.category_id === selectedParentId ? '' : formValues.category_id}
                        onChange={(e) => handleSubCategoryChange(e.target.value)}
                      >
                        <MenuItem value="">Ninguna / Usar Principal</MenuItem>
                        {dbCategories
                          .filter(c => c.parent_id === selectedParentId)
                          .map((option) => (
                            <MenuItem key={option.id} value={option.id}>
                              {option.name}
                            </MenuItem>
                          ))}
                      </TextField>
                    </Grid>
                  )}
                  <Grid size={6}>
                    <TextField
                      fullWidth
                      label="Precio ($)"
                      type="number"
                      value={formValues.price}
                      onChange={(e) => setFormValues({ ...formValues, price: parseFloat(e.target.value) })}
                    />
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      fullWidth
                      label="Stock"
                      type="number"
                      value={formValues.stock}
                      onChange={(e) => setFormValues({ ...formValues, stock: parseInt(e.target.value) })}
                    />
                  </Grid>
                </Grid>



                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>Especificaciones Técnicas (Basadas en Categoría)</Typography>
                  <Stack spacing={2}>
                    {formValues.technical_specs.map((spec, idx) => (
                      <Stack key={idx} direction="row" spacing={2} alignItems="center">
                        <TextField
                          size="small"
                          label="Propiedad"
                          value={spec.key}
                          disabled
                          sx={{
                            flex: 1,
                            '& .MuiInputBase-input.Mui-disabled': {
                              WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                              fontWeight: 700
                            }
                          }}
                        />
                        <TextField
                          size="small"
                          label={`Valor para ${spec.key}`}
                          value={spec.value}
                          onChange={(e) => {
                            const newSpecs = [...formValues.technical_specs];
                            newSpecs[idx].value = e.target.value;
                            setFormValues({ ...formValues, technical_specs: newSpecs });
                          }}
                          sx={{ flex: 1.5 }}
                        />
                      </Stack>
                    ))}
                    {formValues.technical_specs.length === 0 && (
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderStyle: 'dashed' }}>
                        <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                          Esta categoría no tiene una plantilla de especificaciones definida.
                        </Typography>
                      </Paper>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={3}>
                <Box sx={{ p: 2, bgcolor: 'rgba(255,215,0,0.05)', borderRadius: 3, border: '1px solid rgba(255,215,0,0.2)' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formValues.featured}
                        onChange={(e) => setFormValues({ ...formValues, featured: e.target.checked })}
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: 700 }}>Producto Destacado</Typography>
                        <Star size={16} fill={formValues.featured ? "#FFD700" : "none"} color="#FFD700" />
                      </Box>
                    }
                  />
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    Aparecerá en el carrusel de la landing page.
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Imágenes (Max 5)</Typography>
                </Box>

                <Box
                  sx={{
                    border: '2px dashed #ddd',
                    borderRadius: 2,
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(204,0,0,0.02)' }
                  }}
                  component="label"
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    hidden
                    onChange={handleFileChange}
                    disabled={formValues.images.length + selectedFiles.length >= 5 || uploadingFiles}
                  />
                  <Plus size={32} opacity={0.5} style={{ margin: '0 auto' }} />
                  <Typography variant="caption" display="block" color="text.secondary">
                    Subir imágenes desde el ordenador
                  </Typography>
                </Box>

                <Grid container spacing={1}>
                  {/* Existing Images */}
                  {formValues.images.map((img, idx) => (
                    <Grid size={6} key={`ext-${idx}`}>
                      <Box sx={{ position: 'relative', aspectRatio: '1/1', borderRadius: 1, overflow: 'hidden', border: '1px solid #eee' }}>
                        <Box component="img" src={img} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <IconButton size="small" color="error" sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'white' } }} onClick={() => removeExistingImage(idx)}>
                          <Trash2 size={14} />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                  {/* New Selected Files Preview */}
                  {selectedFiles.map((file, idx) => (
                    <Grid size={6} key={`new-${idx}`}>
                      <Box sx={{ position: 'relative', aspectRatio: '1/1', borderRadius: 1, overflow: 'hidden', border: '1px solid #eee' }}>
                        <Box component="img" src={URL.createObjectURL(file)} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <IconButton size="small" color="error" sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'white' } }} onClick={() => removeSelectedFile(idx)}>
                          <Trash2 size={14} />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} color="inherit" sx={{ fontWeight: 600 }} disabled={uploadingFiles}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} sx={{ fontWeight: 800, px: 4 }} disabled={uploadingFiles}>
            {uploadingFiles ? 'Procesando...' : (selectedProduct ? 'Actualizar' : 'Crear Producto')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que querés eliminar <strong>{productToDelete?.name}</strong>? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={handleDeleteCancel} color="inherit" sx={{ fontWeight: 600 }}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" sx={{ fontWeight: 700 }}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const ProductsPage = () => {
  return (
    <Suspense fallback={<div>Cargando productos...</div>}>
      <ProductsManagement />
    </Suspense>
  );
};

export default ProductsPage;
