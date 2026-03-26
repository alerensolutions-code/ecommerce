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
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Plus, Edit2, Trash2, Folder } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

type Category = {
  id: string;
  name: string;
};

const CategoriesManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newName, setNewName] = useState('');

  const handleOpen = (category: Category | null = null) => {
    setEditingCategory(category);
    setNewName(category?.name || '');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCategory(null);
    setNewName('');
  };

  const handleSave = async () => {
    if (!newName.trim()) return;

    if (editingCategory) {
      const { error } = await supabase
        .from('categories')
        .update({ name: newName })
        .eq('id', editingCategory.id);
      
      if (error) alert('Error al actualizar categoría');
    } else {
      const { error } = await supabase
        .from('categories')
        .insert([{ name: newName }]);
      
      if (error) alert('Error al crear categoría');
    }
    
    fetchCategories();
    handleClose();
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar la categoría "${name}"?`)) {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) {
        alert('Error al eliminar categoría');
      } else {
        fetchCategories();
      }
    }
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
          Nueva Categoría
        </Button>
      </Stack>

      <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Nombre de la Categoría</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ py: 4 }}>
                    Cargando categorías...
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ py: 4 }}>
                    No hay categorías creadas.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Folder size={18} opacity={0.5} />
                        <Typography sx={{ fontWeight: 600 }}>{category.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton size="small" onClick={() => handleOpen(category)}>
                          <Edit2 size={18} />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(category.id, category.name)}>
                          <Trash2 size={18} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Category Modal */}
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        </DialogTitle>
        <DialogContent dividers sx={{ py: 4 }}>
          <TextField 
            fullWidth 
            label="Nombre" 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} color="inherit">Cancelar</Button>
          <Button variant="contained" onClick={handleSave} sx={{ px: 4, fontWeight: 800 }}>
            {editingCategory ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoriesManagement;
