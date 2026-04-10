"use client";

import { useState, useEffect, useMemo } from 'react';
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
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  InputAdornment,
  Tooltip,
  MenuItem,
  Chip,
  Collapse
} from '@mui/material';
import { Plus, Edit2, Trash2, Folder, Search, FileDown, PlusCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { exportToCSV } from '../../../lib/export';

type Category = {
  id: string;
  name: string;
  parent_id?: string | null;
  parent?: { name: string };
  spec_template?: string[];
};

interface CategoryRowProps {
  category: Category;
  childrenCategories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onAddSub: (category: Category) => void;
}

const CategoryRow = ({ category, childrenCategories, onEdit, onDelete, onAddSub }: CategoryRowProps) => {
  const [open, setOpen] = useState(false);
  const hasChildren = childrenCategories.length > 0;

  return (
    <>
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset !important' } }}>
        <TableCell sx={{ py: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            {hasChildren ? (
              <IconButton size="small" onClick={() => setOpen(!open)} sx={{ p: 0.5 }}>
                {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </IconButton>
            ) : (
              <Box sx={{ width: 32 }} /> // Spacer for alignment
            )}
            <Folder size={18} opacity={0.8} color="#cc0000" />
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{category.name}</Typography>
            {hasChildren && (
              <Chip
                label={`${childrenCategories.length} subs`}
                size="small"
                sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600, bgcolor: 'rgba(0,0,0,0.04)' }}
              />
            )}
          </Stack>
        </TableCell>
        <TableCell>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Categoría Principal</Typography>
        </TableCell>
        <TableCell align="right">
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Tooltip title="Nueva Subcategoría">
              <IconButton size="small" color="primary" onClick={() => onAddSub(category)}>
                <PlusCircle size={18} />
              </IconButton>
            </Tooltip>
            <IconButton size="small" onClick={() => onEdit(category)}>
              <Edit2 size={18} />
            </IconButton>
            <IconButton size="small" color="error" onClick={() => onDelete(category)}>
              <Trash2 size={18} />
            </IconButton>
          </Stack>
        </TableCell>
      </TableRow>

      {/* Subcategories Collapse */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0, borderBottom: 'none' }} colSpan={3}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ pb: 2, pl: 6, pr: 2 }}>
              <Table size="small">
                <TableBody>
                  {childrenCategories.map((sub) => (
                    <TableRow key={sub.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ py: 1.5 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box sx={{ width: 2, height: 20, bgcolor: 'rgba(204,0,0,0.2)', borderRadius: 1 }} />
                          <Typography sx={{ fontSize: '0.9rem', fontWeight: 500 }}>{sub.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip label="Subcategoría" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem', opacity: 0.7 }} />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <IconButton size="small" onClick={() => onEdit(sub)}>
                            <Edit2 size={16} />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => onDelete(sub)}>
                            <Trash2 size={16} />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const CategoriesManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Filtros y Paginación (Paginación simplificada para jerarquía)
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*, parent:parent_id(name)')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Organizar categorías en jerarquía
  const hierarchy = useMemo(() => {
    const roots = categories.filter(c => !c.parent_id);
    const childrenMap: Record<string, Category[]> = {};

    categories.forEach(c => {
      if (c.parent_id) {
        if (!childrenMap[c.parent_id]) childrenMap[c.parent_id] = [];
        childrenMap[c.parent_id].push(c);
      }
    });

    const filteredRoots = roots.filter(r =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      childrenMap[r.id]?.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return { roots: filteredRoots, childrenMap };
  }, [categories, searchTerm]);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newName, setNewName] = useState('');
  const [newParentId, setNewParentId] = useState<string>('');
  const [parentName, setParentName] = useState<string | null>(null);
  const [specTemplate, setSpecTemplate] = useState<string[]>([]);
  const [newSpecKey, setNewSpecKey] = useState('');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  const handleOpen = (category: Category | null = null, parentId: string | null = null, pName: string | null = null) => {
    setEditingCategory(category);
    setNewName(category?.name || '');
    setNewParentId(parentId || category?.parent_id || '');
    setParentName(pName || category?.parent?.name || null);
    setSpecTemplate(category?.spec_template || []);
    setNewSpecKey('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCategory(null);
    setNewName('');
    setNewParentId('');
    setParentName(null);
    setSpecTemplate([]);
    setNewSpecKey('');
  };

  const handleSave = async () => {
    if (!newName.trim()) return;

    const dataToSave = {
      name: newName,
      parent_id: newParentId || null,
      spec_template: specTemplate
    };

    if (editingCategory) {
      const { error } = await supabase
        .from('categories')
        .update(dataToSave)
        .eq('id', editingCategory.id);

      if (error) alert('Error al actualizar categoría');
    } else {
      const { error } = await supabase
        .from('categories')
        .insert([dataToSave]);

      if (error) alert('Error al crear categoría');
    }

    fetchCategories();
    handleClose();
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    // Verificar si tiene subcategorías
    const hasSubcats = categories.some(c => c.parent_id === categoryToDelete.id);
    if (hasSubcats) {
      setDeleteDialogOpen(false);
      setWarningMessage(`No se puede eliminar la categoría "${categoryToDelete.name}" porque tiene subcategorías asociadas. Movelos o eliminalos primero.`);
      setWarningDialogOpen(true);
      return;
    }

    // Verificar si hay productos asociados
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id')
      .eq('category_id', categoryToDelete.id)
      .limit(1);

    if (productsError) {
      alert('Error al verificar productos asociados');
      return;
    }

    if (products && products.length > 0) {
      setDeleteDialogOpen(false);
      setWarningMessage(`No se puede eliminar "${categoryToDelete.name}" porque tiene productos asociados.`);
      setWarningDialogOpen(true);
      return;
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryToDelete.id);

    if (error) {
      alert('Error al eliminar categoría');
    } else {
      fetchCategories();
    }

    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Gestión de Categorías</Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => handleOpen()}
          sx={{ py: 1.5, px: 3, fontWeight: 700 }}
        >
          Nueva Categoría Principal
        </Button>
      </Stack>

      <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => {
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
              sx={{ maxWidth: 400 }}
            />

            <Tooltip title="Exportar Categorías (CSV)">
              <IconButton
                onClick={() => exportToCSV(categories, 'categorias_devil_game')}
                sx={{ bgcolor: 'rgba(0,0,0,0.02)', '&:hover': { color: 'primary.main', bgcolor: 'rgba(0,0,0,0.05)' } }}
              >
                <FileDown size={18} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Categoría</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    Cargando estructura jerárquica...
                  </TableCell>
                </TableRow>
              ) : hierarchy.roots.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    No se encontraron categorías.
                  </TableCell>
                </TableRow>
              ) : (
                hierarchy.roots.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((root) => (
                  <CategoryRow
                    key={root.id}
                    category={root}
                    childrenCategories={hierarchy.childrenMap[root.id] || []}
                    onEdit={(cat) => handleOpen(cat)}
                    onDelete={(cat) => handleDeleteClick(cat)}
                    onAddSub={(cat) => handleOpen(null, cat.id, cat.name)}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={hierarchy.roots.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Padres por página"
        />
      </Paper>

      {/* Category Modal */}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingCategory ? 'Editar Categoría' : (newParentId ? `Nueva Subcategoría` : 'Nueva Categoría Padre')}
        </DialogTitle>
        <DialogContent dividers sx={{ py: 4 }}>
          <Stack spacing={3}>
            {newParentId && !editingCategory && (
              <Box sx={{ p: 1.5, bgcolor: 'rgba(204,0,0,0.04)', borderRadius: 2, border: '1px solid rgba(204,0,0,0.1)' }}>
                <Typography variant="caption" color="primary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>DEPENDERÁ DE:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>{parentName}</Typography>
              </Box>
            )}
            <TextField
              fullWidth
              label="Nombre de la Categoría"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            {editingCategory && (
              <TextField
                select
                fullWidth
                label="Mover a Categoría Padre"
                value={newParentId}
                onChange={(e) => setNewParentId(e.target.value)}
              >
                <MenuItem value=""><em>Ninguna (Categoría Raíz)</em></MenuItem>
                {categories
                  .filter(c => !c.parent_id && c.id !== editingCategory?.id)
                  .map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
              </TextField>
            )}

            {/* Spec Template Editor */}
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'primary.main' }}>
                Plantilla de Especificaciones (Campos Obligatorios)
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nueva Propiedad (ej: socket)"
                  value={newSpecKey}
                  onChange={(e) => setNewSpecKey(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newSpecKey.trim()) {
                      e.preventDefault();
                      if (!specTemplate.includes(newSpecKey.trim())) {
                        setSpecTemplate([...specTemplate, newSpecKey.trim()]);
                      }
                      setNewSpecKey('');
                    }
                  }}
                />
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    if (newSpecKey.trim() && !specTemplate.includes(newSpecKey.trim())) {
                      setSpecTemplate([...specTemplate, newSpecKey.trim()]);
                      setNewSpecKey('');
                    }
                  }}
                >
                  Ok
                </Button>
              </Stack>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {specTemplate.map((spec) => (
                  <Chip
                    key={spec}
                    label={spec}
                    onDelete={() => setSpecTemplate(specTemplate.filter(s => s !== spec))}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                ))}
                {specTemplate.length === 0 && (
                  <Typography variant="caption" color="text.secondary">
                    Sin propiedades predefinidas. Añadí las llaves que este tipo de hardware requiere para filtrar compatibilidad.
                  </Typography>
                )}
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} color="inherit">Cancelar</Button>
          <Button variant="contained" onClick={handleSave} sx={{ px: 4, fontWeight: 800 }}>
            {editingCategory ? 'Actualizar' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que querés eliminar la categoría <strong>{categoryToDelete?.name}</strong>? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" sx={{ fontWeight: 700 }}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Warning Dialog */}
      <Dialog open={warningDialogOpen} onClose={() => setWarningDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, pb: 1, color: 'error.main' }}>Acción Denegada</DialogTitle>
        <DialogContent>
          <Typography>
            {warningMessage}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setWarningDialogOpen(false)} variant="contained" color="primary" sx={{ fontWeight: 700 }}>
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoriesManagement;
