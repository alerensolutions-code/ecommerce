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
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Avatar,
  TableSortLabel,
} from '@mui/material';
import { Eye, Clock, CheckCircle, Truck, AlertCircle, ShoppingBag, Search, User, Phone, FileDown, Trash2, Plus, X, MessageCircle, Edit2 } from 'lucide-react';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { exportToCSV } from '../../../lib/export';

// Placeholder número de WhatsApp de la tienda
const WHATSAPP_STORE_NUMBER = '5491100000000';

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

// WhatsApp SVG icon inline
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="#25d366">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────
type OrderItem = { id: string; name: string; price: number; quantity: number; images?: string[] };
type Product = { id: string; name: string; price: number; stock: number; category_id: string; images?: string[]; category?: { name: string } };
type Category = { id: string; name: string };

// ─── Wizard para crear pedido ─────────────────────────────────────────────────
const STEPS = ['Seleccionar Productos', 'Datos de Contacto', 'Confirmar Pedido'];

interface CreateOrderWizardProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CreateOrderWizard = ({ open, onClose, onCreated }: CreateOrderWizardProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      supabase.from('categories').select('*').order('name').then(({ data }) => setCategories(data || []));
    }
  }, [open]);

  useEffect(() => {
    if (selectedCategoryId) {
      supabase
        .from('products')
        .select('*, category:categories(name)')
        .eq('category_id', selectedCategoryId)
        .then(({ data }) => setProducts(data || []));
    } else {
      setProducts([]);
    }
  }, [selectedCategoryId]);

  const handleAddProduct = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1, images: product.images }];
    });
  };

  const handleRemoveProduct = (id: string) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  const handleQtyChange = (id: string, qty: number) => {
    if (qty < 1) { handleRemoveProduct(id); return; }
    setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const total = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

  const handleSubmit = async () => {
    setSaving(true);
    const id = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const { error } = await supabase.from('orders').insert([{
      id,
      customer_name: contactName.trim(),
      phone: contactPhone.trim(),
      items: cartItems,
      total,
      status: 'Pendiente',
    }]);
    setSaving(false);
    if (!error) {
      onCreated();
      handleReset();
    } else {
      alert('Error al crear el pedido: ' + error.message);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedCategoryId('');
    setCartItems([]);
    setContactName('');
    setContactPhone('');
    setProducts([]);
    onClose();
  };

  const canNext = () => {
    if (activeStep === 0) return cartItems.length > 0;
    if (activeStep === 1) return contactName.trim() !== '' && contactPhone.trim() !== '';
    return true;
  };

  return (
    <Dialog open={open} onClose={handleReset} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ShoppingBag size={22} color="#cc0000" />
          Nuevo Pedido
        </Box>
        <IconButton size="small" onClick={handleReset}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {STEPS.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* ── Paso 1: Productos ── */}
        {activeStep === 0 && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2, border: '1px solid rgba(0,0,0,0.05)' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  Buscá y seleccioná los productos para este pedido:
                </Typography>
                <FormControl fullWidth size="small">
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    value={selectedCategoryId}
                    label="Categoría"
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    sx={{ bgcolor: 'white' }}
                  >
                    <MenuItem value="">Seleccionar categoría...</MenuItem>
                    {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShoppingBag size={16} /> Productos disponibles
              </Typography>
              <Box sx={{ 
                maxHeight: 320, 
                overflowY: 'auto', 
                border: '1px solid rgba(0,0,0,0.08)', 
                borderRadius: 2, 
                p: 1.5,
                '&::-webkit-scrollbar': { width: '6px' },
                '&::-webkit-scrollbar-track': { background: 'rgba(0,0,0,0.02)', borderRadius: '4px' },
                '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.15)', borderRadius: '4px' },
                '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(0,0,0,0.25)' }
              }}>
                {products.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Search size={32} color="rgba(0,0,0,0.1)" style={{ margin: '0 auto 12px' }} />
                    <Typography variant="body2" color="text.secondary">
                      {selectedCategoryId ? 'No hay productos en esta categoría.' : 'Seleccioná una categoría para ver productos.'}
                    </Typography>
                  </Box>
                ) : products.map(p => (
                  <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', p: 1.5, mb: 1, borderRadius: 2, border: '1px solid rgba(0,0,0,0.04)', '&:hover': { bgcolor: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.08)' }, transition: 'all 0.2s', gap: 2 }}>
                    <Avatar src={p.images?.[0]} variant="rounded" sx={{ width: 44, height: 44, border: '1px solid rgba(0,0,0,0.05)' }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{p.name}</Typography>
                      <Typography variant="caption" color="primary" sx={{ fontWeight: 800 }}>${p.price.toLocaleString('es-ES')}</Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleAddProduct(p)}
                      disableElevation
                      sx={{ minWidth: 36, p: 1, fontWeight: 800, borderRadius: 2 }}
                      disabled={p.stock === 0}
                    >
                      {p.stock === 0 ? 'S/S' : <Plus size={16} />}
                    </Button>
                  </Box>
                ))}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle size={16} /> Carrito ({cartItems.length} items)
              </Typography>
              <Box sx={{ 
                height: 480, 
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid rgba(0,0,0,0.08)', 
                borderRadius: 2, 
                bgcolor: 'rgba(0,0,0,0.01)'
              }}>
                <Box sx={{
                  flexGrow: 1,
                  overflowY: 'auto',
                  p: 1.5,
                  '&::-webkit-scrollbar': { width: '6px' },
                  '&::-webkit-scrollbar-track': { background: 'transparent' },
                  '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.15)', borderRadius: '4px' },
                  '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(0,0,0,0.25)' }
                }}>
                  {cartItems.length === 0 ? (
                    <Box sx={{ py: 8, textAlign: 'center', opacity: 0.6 }}>
                      <ShoppingBag size={48} color="rgba(0,0,0,0.2)" style={{ margin: '0 auto 16px' }} />
                      <Typography variant="body2" color="text.secondary">
                        Aún no hay productos seleccionados.
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={1}>
                      {cartItems.map(item => (
                        <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: 'white', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                          <Avatar src={item.images?.[0]} variant="rounded" sx={{ width: 36, height: 36 }} />
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>{item.name}</Typography>
                            <Typography variant="caption" color="primary" sx={{ fontWeight: 800 }}>${(item.price * item.quantity).toLocaleString('es-ES')}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 2, p: 0.5 }}>
                            <IconButton size="small" onClick={() => handleQtyChange(item.id, item.quantity - 1)} sx={{ p: 0.5 }}>
                              <Typography variant="caption" sx={{ fontWeight: 800, lineHeight: 1 }}>−</Typography>
                            </IconButton>
                            <Typography variant="body2" sx={{ fontWeight: 800, minWidth: 20, textAlign: 'center' }}>{item.quantity}</Typography>
                            <IconButton size="small" onClick={() => handleQtyChange(item.id, item.quantity + 1)} sx={{ p: 0.5 }}>
                              <Typography variant="caption" sx={{ fontWeight: 800, lineHeight: 1 }}><Plus size={12} /></Typography>
                            </IconButton>
                          </Box>
                          <IconButton size="small" color="error" onClick={() => handleRemoveProduct(item.id)} sx={{ bgcolor: 'error.lighter' }}>
                            <Trash2 size={16} />
                          </IconButton>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>
                
                <Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.08)', bgcolor: 'white', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.secondary' }}>Total Estimado:</Typography>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>${total.toLocaleString('es-ES')}</Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        )}

        {/* ── Paso 2: Datos de contacto ── */}
        {activeStep === 1 && (
          <Stack spacing={3} sx={{ maxWidth: 480, mx: 'auto', py: 2 }}>
            <Typography variant="body2" color="text.secondary" align="center">
              Completá los datos del cliente para registrar el pedido.
            </Typography>
            <TextField
              fullWidth
              label="Nombre completo"
              value={contactName}
              onChange={e => setContactName(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><User size={18} /></InputAdornment>
              }}
            />
            <TextField
              fullWidth
              label="Teléfono (WhatsApp)"
              value={contactPhone}
              onChange={e => setContactPhone(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Phone size={18} /></InputAdornment>
              }}
            />
          </Stack>
        )}

        {/* ── Paso 3: Confirmación ── */}
        {activeStep === 2 && (
          <Stack spacing={3} sx={{ py: 2 }}>
            <Box sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(0,0,0,0.08)', bgcolor: 'rgba(0,0,0,0.01)' }}>
              <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2 }}>Cliente</Typography>
              <Stack direction="row" spacing={2}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.main', color: 'white', display: 'flex' }}><User size={18} /></Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Nombre</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{contactName}</Typography>
                </Box>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#25d366', color: 'white', display: 'flex' }}><Phone size={18} /></Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Teléfono</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{contactPhone}</Typography>
                </Box>
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Productos</Typography>
              <Stack spacing={1}>
                {cartItems.map(item => (
                  <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">{item.quantity}x {item.name}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>${(item.price * item.quantity).toLocaleString('es-ES')}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Total del Pedido</Typography>
              <Typography variant="h5" color="primary" sx={{ fontWeight: 800 }}>${total.toLocaleString('es-ES')}</Typography>
            </Box>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        {activeStep > 0 && (
          <Button onClick={() => setActiveStep(s => s - 1)} color="inherit" sx={{ fontWeight: 600 }}>
            Atrás
          </Button>
        )}
        <Box sx={{ flexGrow: 1 }} />
        {activeStep < STEPS.length - 1 ? (
          <Button
            variant="contained"
            onClick={() => setActiveStep(s => s + 1)}
            disabled={!canNext()}
            sx={{ fontWeight: 700, px: 4 }}
          >
            Siguiente
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving}
            sx={{ fontWeight: 700, px: 4 }}
          >
            {saving ? 'Guardando...' : 'Confirmar Pedido'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

// ─── Edit Order Wizard ────────────────────────────────────────────────────────
interface EditOrderWizardProps {
  open: boolean;
  order: any;
  onClose: () => void;
  onUpdated: () => void;
}

const EditOrderWizard = ({ open, order, onClose, onUpdated }: EditOrderWizardProps) => {
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [saving, setSaving] = useState(false);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    if (order) {
      setContactName(order.customer_name || '');
      setContactPhone(order.phone || '');
      setCartItems(order.items || []);
    }
  }, [order]);

  useEffect(() => {
    if (open) {
      supabase.from('categories').select('*').order('name').then(({ data }) => setCategories(data || []));
    }
  }, [open]);

  useEffect(() => {
    if (selectedCategoryId) {
      supabase
        .from('products')
        .select('*, category:categories(name)')
        .eq('category_id', selectedCategoryId)
        .then(({ data }) => setProducts(data || []));
    } else {
      setProducts([]);
    }
  }, [selectedCategoryId]);

  const handleAddProduct = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1, images: product.images }];
    });
  };

  const handleRemoveProduct = (id: string) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  const handleQtyChange = (id: string, qty: number) => {
    if (qty < 1) { handleRemoveProduct(id); return; }
    setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const total = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

  const handleUpdate = async () => {
    if (!order) return;
    setSaving(true);
    const { error } = await supabase
      .from('orders')
      .update({
        customer_name: contactName.trim(),
        phone: contactPhone.trim(),
        items: cartItems,
        total,
      })
      .eq('id', order.id);

    setSaving(false);
    if (!error) {
      onUpdated();
      onClose();
    } else {
      alert('Error al actualizar el pedido: ' + error.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Edit2 size={22} color="#cc0000" />
          Editar Pedido {order?.id}
        </Box>
        <IconButton size="small" onClick={onClose}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={4} sx={{ py: 2 }}>
          {/* Datos de contacto */}
          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2 }}>Datos del Cliente</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Nombre completo"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><User size={18} /></InputAdornment>
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Teléfono (WhatsApp)"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Phone size={18} /></InputAdornment>
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Gestión de Productos */}
          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2 }}>Productos del Pedido</Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2, border: '1px solid rgba(0,0,0,0.05)' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Agregar nuevos productos al pedido:
                  </Typography>
                  <FormControl fullWidth size="small">
                    <InputLabel>Categoría</InputLabel>
                    <Select
                      value={selectedCategoryId}
                      label="Categoría"
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                      sx={{ bgcolor: 'white' }}
                    >
                      <MenuItem value="">Seleccionar categoría...</MenuItem>
                      {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ 
                  maxHeight: 280, 
                  overflowY: 'auto', 
                  border: '1px solid rgba(0,0,0,0.08)', 
                  borderRadius: 2, 
                  p: 1.5,
                  '&::-webkit-scrollbar': { width: '6px' },
                  '&::-webkit-scrollbar-track': { background: 'rgba(0,0,0,0.02)', borderRadius: '4px' },
                  '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.15)', borderRadius: '4px' }
                }}>
                  {products.length === 0 ? (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Search size={28} color="rgba(0,0,0,0.1)" style={{ margin: '0 auto 8px' }} />
                      <Typography variant="body2" color="text.secondary">
                        {selectedCategoryId ? 'No hay productos en esta categoría.' : 'Seleccioná una categoría para ver productos.'}
                      </Typography>
                    </Box>
                  ) : products.map(p => (
                    <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', p: 1.5, mb: 1, borderRadius: 2, border: '1px solid rgba(0,0,0,0.04)', '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }, gap: 2 }}>
                      <Avatar src={p.images?.[0]} variant="rounded" sx={{ width: 44, height: 44 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{p.name}</Typography>
                        <Typography variant="caption" color="primary" sx={{ fontWeight: 800 }}>${p.price.toLocaleString('es-ES')}</Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleAddProduct(p)}
                        disableElevation
                        sx={{ minWidth: 36, p: 1, fontWeight: 800, borderRadius: 2 }}
                        disabled={p.stock === 0}
                      >
                        {p.stock === 0 ? 'S/S' : <Plus size={16} />}
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ 
                  height: 380, 
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid rgba(0,0,0,0.08)', 
                  borderRadius: 2, 
                  bgcolor: 'rgba(0,0,0,0.01)'
                }}>
                  <Box sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    p: 1.5,
                    '&::-webkit-scrollbar': { width: '6px' },
                    '&::-webkit-scrollbar-track': { background: 'transparent' },
                    '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.15)', borderRadius: '4px' }
                  }}>
                    {cartItems.length === 0 ? (
                      <Box sx={{ py: 6, textAlign: 'center', opacity: 0.6 }}>
                        <Typography variant="body2" color="text.secondary">
                          No hay productos en el pedido.
                        </Typography>
                      </Box>
                    ) : (
                      <Stack spacing={1}>
                        {cartItems.map(item => (
                          <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: 'white', border: '1px solid rgba(0,0,0,0.04)' }}>
                            <Avatar src={item.images?.[0]} variant="rounded" sx={{ width: 36, height: 36 }} />
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>{item.name}</Typography>
                              <Typography variant="caption" color="primary" sx={{ fontWeight: 800 }}>${(item.price * item.quantity).toLocaleString('es-ES')}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 2, p: 0.5 }}>
                              <IconButton size="small" onClick={() => handleQtyChange(item.id, item.quantity - 1)} sx={{ p: 0.5 }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, lineHeight: 1 }}>−</Typography>
                              </IconButton>
                              <Typography variant="body2" sx={{ fontWeight: 800, minWidth: 20, textAlign: 'center' }}>{item.quantity}</Typography>
                              <IconButton size="small" onClick={() => handleQtyChange(item.id, item.quantity + 1)} sx={{ p: 0.5 }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, lineHeight: 1 }}><Plus size={12} /></Typography>
                              </IconButton>
                            </Box>
                            <IconButton size="small" color="error" onClick={() => handleRemoveProduct(item.id)} sx={{ bgcolor: 'error.lighter' }}>
                              <Trash2 size={16} />
                            </IconButton>
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </Box>
                  <Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.08)', bgcolor: 'white' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.secondary' }}>Total Pedido:</Typography>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>${total.toLocaleString('es-ES')}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleUpdate}
          disabled={saving || !contactName.trim() || !contactPhone.trim() || cartItems.length === 0}
          sx={{ fontWeight: 700, px: 4 }}
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
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

  // Ordenamiento por fecha
  const [dateOrder, setDateOrder] = useState<'asc' | 'desc'>('desc');

  // Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<any>(null);

  // Edit
  const [editOpen, setEditOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<any>(null);

  // Create wizard
  const [createOpen, setCreateOpen] = useState(false);
  
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
    let result = orders.filter(order => {
      const matchesSearch = order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           order.id?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Ordering by date
    result = [...result].sort((a, b) => {
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      return dateOrder === 'asc' ? ta - tb : tb - ta;
    });

    return result;
  }, [orders, searchTerm, statusFilter, dateOrder]);

  const pagedOrders = useMemo(() => {
    return filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredOrders, page, rowsPerPage]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (!error) fetchOrders();
  };

  const handleViewDetail = (order: any) => {
    setSelectedOrder(order);
    setOpenDetail(true);
  };

  const handleEditClick = (order: any) => {
    setOrderToEdit(order);
    setEditOpen(true);
  };

  const handleDeleteClick = (order: any) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;
    await supabase.from('orders').delete().eq('id', orderToDelete.id);
    setDeleteDialogOpen(false);
    setOrderToDelete(null);
    fetchOrders();
  };

  const handleWhatsAppClient = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleaned || WHATSAPP_STORE_NUMBER}`, '_blank');
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Gestión de Pedidos</Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => setCreateOpen(true)}
          sx={{ py: 1.5, px: 3, fontWeight: 700 }}
        >
          Nuevo Pedido
        </Button>
      </Stack>

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
                <TableCell sx={{ fontWeight: 700 }}>
                  <TableSortLabel
                    active
                    direction={dateOrder}
                    onClick={() => setDateOrder(d => d === 'asc' ? 'desc' : 'asc')}
                  >
                    Fecha
                  </TableSortLabel>
                </TableCell>
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
                  <TableCell>{new Date(order.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>${Number(order.total).toLocaleString('es-ES')}</TableCell>
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
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <IconButton size="small" onClick={() => handleViewDetail(order)} aria-label="Ver detalles">
                        <Eye size={18} />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleEditClick(order)} color="primary" aria-label="Editar">
                        <Edit2 size={18} />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteClick(order)} aria-label="Eliminar">
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

      {/* ── Order Detail Modal ── */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ShoppingBag size={24} color="#cc0000" />
            Pedido {selectedOrder?.id}
          </Box>
          <IconButton size="small" onClick={() => setOpenDetail(false)}>
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3} sx={{ py: 2 }}>
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2 }}>Información del Cliente</Typography>
              <Grid container spacing={3}>
                {/* Nombre */}
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

                {/* Teléfono + botón WhatsApp */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#25d366', color: 'white', display: 'flex' }}>
                      <Phone size={18} />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="caption" color="text.secondary">Teléfono</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedOrder?.phone || 'N/A'}</Typography>
                    </Box>
                    {selectedOrder?.phone && (
                      <Tooltip title="Abrir WhatsApp">
                        <IconButton
                          size="small"
                          onClick={() => handleWhatsAppClient(selectedOrder.phone)}
                          sx={{ 
                            border: '1px solid #25d366',
                            color: '#25d366',
                            '&:hover': { bgcolor: 'rgba(37,211,102,0.08)' }
                          }}
                        >
                          <MessageCircle size={16} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </Grid>

                {/* Estado y Fecha */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#ff9800', color: 'white', display: 'flex' }}>
                      <Clock size={18} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Fecha</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        {selectedOrder?.created_at ? new Date(selectedOrder.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#2196f3', color: 'white', display: 'flex' }}>
                      <ShoppingBag size={18} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Estado</Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          icon={statusIcons[selectedOrder?.status]}
                          label={selectedOrder?.status}
                          size="small"
                          color={statusColors[selectedOrder?.status]}
                          sx={{ fontWeight: 700 }}
                        />
                      </Box>
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
                  <Typography variant="body2" color="text.secondary">Sin detalle de productos.</Typography>
                )}
              </Stack>
            </Box>

            <Divider />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Total Pagado</Typography>
              <Typography variant="h5" color="primary" sx={{ fontWeight: 800 }}>
                ${Number(selectedOrder?.total).toLocaleString('es-ES')}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        {/* No footer/DialogActions — se cierra con la X */}
      </Dialog>

      {/* ── Delete Order Confirmation ── */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que querés eliminar el pedido <strong>{orderToDelete?.id}</strong> de <strong>{orderToDelete?.customer_name}</strong>? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" sx={{ fontWeight: 700 }}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Create Order Wizard ── */}
      <CreateOrderWizard
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => { setCreateOpen(false); fetchOrders(); }}
      />

      {/* ── Edit Order Wizard ── */}
      <EditOrderWizard
        open={editOpen}
        order={orderToEdit}
        onClose={() => setEditOpen(false)}
        onUpdated={() => { setEditOpen(false); fetchOrders(); }}
      />
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
