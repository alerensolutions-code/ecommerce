"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Chip,
  Divider,
  IconButton,
  Alert,
  CircularProgress,
  Badge
} from '@mui/material';
import { 
  ChevronRight, 
  ChevronLeft, 
  ShoppingCart, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2,
  Cpu,
  Monitor,
  HardDrive,
  Cpu as GpuIcon,
  Zap,
  Box as CaseIcon,
  Fan
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useCart } from '../../../context/CartContext';
import { Product } from '../../../types';
import { CompatibilityEngine, CompatibilityResult } from '../../../lib/compatibility';
import { motion, AnimatePresence } from 'framer-motion';

// Definición de Pasos
const STEPS = [
  { name: 'Procesador', category: 'Procesadores', icon: Cpu },
  { name: 'Motherboard', category: 'Mothers', icon: Monitor },
  { name: 'Memoria RAM', category: 'Memorias RAM', icon: GpuIcon },
  { name: 'Almacenamiento', category: 'Almacenamiento', icon: HardDrive },
  { name: 'Placa de Video', category: 'Placas de Video', icon: GpuIcon },
  { name: 'Fuente', category: 'Fuentes', icon: Zap },
  { name: 'Gabinete', category: 'Gabinetes', icon: CaseIcon },
  { name: 'Refrigeración', category: 'Refrigeración', icon: Fan }
];

type BuildState = {
  cpu?: Product;
  mother?: Product;
  ram?: Product;
  storage?: Product;
  gpu?: Product;
  psu?: Product;
  case?: Product;
  cooling?: Product;
};

const PCBuilderPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [build, setBuild] = useState<BuildState>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { dispatch } = useCart();

  // Cargar productos para el paso actual
  useEffect(() => {
    const fetchStepProducts = async () => {
      setLoading(true);
      const currentCategory = STEPS[activeStep].category;
      
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(name, parent_id)')
        .order('price', { ascending: true });

      if (data) {
        // Solo filtramos por categoría principal
        let filtered = data.filter((p: any) => 
          p.category?.name?.toLowerCase().includes(currentCategory.toLowerCase()) ||
          p.category?.parent?.name?.toLowerCase().includes(currentCategory.toLowerCase())
        );

        setProducts(filtered);
      }
      setLoading(false);
    };

    fetchStepProducts();
  }, [activeStep]);

  const handleSelectProduct = (product: Product) => {
    const stepKey = getStepKey(activeStep);
    setBuild(prev => ({ ...prev, [stepKey]: product }));
    handleNext();
  };

  const handleSkip = () => {
    const stepKey = getStepKey(activeStep);
    setBuild(prev => ({ ...prev, [stepKey]: undefined }));
    handleNext();
  };

  const handleNext = () => setActiveStep((prev) => Math.min(prev + 1, STEPS.length));
  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  const getStepKey = (step: number): keyof BuildState => {
    const keys: (keyof BuildState)[] = ['cpu', 'mother', 'ram', 'storage', 'gpu', 'psu', 'case', 'cooling'];
    return keys[step];
  };

  const totalPrice = useMemo(() => {
    return Object.values(build).reduce((sum, p) => sum + (p?.price || 0), 0);
  }, [build]);

  const compatibilityIssues = useMemo(() => {
    return CompatibilityEngine.validateBuild(build as any);
  }, [build]);

  const handleAddToCart = () => {
    const selectedProducts = Object.values(build).filter(p => p !== undefined) as Product[];
    dispatch({ type: 'ADD_MULTIPLE_TO_CART', payload: selectedProducts });
    // Opcional: Redirigir al carrito
    window.location.href = '/cart';
  };

  if (activeStep === STEPS.length) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper elevation={0} sx={{ p: 6, borderRadius: 4, textAlign: 'center', border: '1px solid rgba(0,0,0,0.05)' }}>
          <CheckCircle2 size={64} color="#4caf50" style={{ marginBottom: 24 }} />
          <Typography variant="h3" fontWeight={800} gutterBottom>¡Build Terminada!</Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 6 }}>
            Revisá tu configuración antes de añadirla al carrito.
          </Typography>

          <Grid container spacing={4} sx={{ textAlign: 'left', mb: 6 }}>
            {STEPS.map((step, idx) => {
              const product = build[getStepKey(idx)];
              if (!product) return null;
              return (
                <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                  <Card variant="outlined" sx={{ display: 'flex', borderRadius: 2 }}>
                    <CardMedia
                      component="img"
                      sx={{ width: 80, objectFit: 'contain', p: 1 }}
                      image={product.images?.[0] || '/placeholder.png'}
                    />
                    <Box sx={{ p: 2 }}>
                      <Typography variant="caption" color="primary" fontWeight={700}>{step.name}</Typography>
                      <Typography variant="body2" fontWeight={600} noWrap>{product.name}</Typography>
                      <Typography variant="body2" color="text.secondary">${product.price.toLocaleString('es-ES')}</Typography>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Divider sx={{ mb: 4 }} />
          
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 6 }}>
             <Typography variant="h4" fontWeight={800}>Total: ${totalPrice.toLocaleString('es-ES')}</Typography>
             <Stack direction="row" spacing={2}>
               <Button variant="outlined" onClick={handleBack}>Volver y Editar</Button>
               <Button variant="contained" size="large" onClick={handleAddToCart} startIcon={<ShoppingCart />}>
                 Añadir Todo al Carrito
               </Button>
             </Stack>
          </Stack>
        </Paper>
      </Container>
    );
  }

  const currentStep = STEPS[activeStep];
  const StepIcon = currentStep.icon;

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', pb: 10 }}>
      {/* Header / Stepper */}
      <Box sx={{ bgcolor: 'white', pt: 6, pb: 4, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <Container maxWidth="xl">
          <Typography variant="h4" fontWeight={800} gutterBottom align="center">
            Armá tu PC Gamer
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 6 }}>
            Seleccioná componente por componente. Validaremos la compatibilidad por vos.
          </Typography>

          <Stepper activeStep={activeStep} alternativeLabel>
            {STEPS.map((step) => (
              <Step key={step.name}>
                <StepLabel>{step.name}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 6 }}>
        <Grid container spacing={4}>
          {/* Main Content - Product Selection */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ p: 1.5, bgcolor: 'primary.main', borderRadius: 2, color: 'white' }}>
                  <StepIcon size={24} />
                </Box>
                <Typography variant="h5" fontWeight={800}>Seleccioná tu {currentStep.name}</Typography>
              </Stack>
              <Button onClick={handleSkip} color="inherit" sx={{ fontWeight: 600 }}>Saltear este paso</Button>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                {products.length === 0 ? (
                  <Grid size={12}>
                    <Alert severity="info">No hay productos disponibles en esta categoría actualmente.</Alert>
                  </Grid>
                ) : (
                  products.map((p) => {
                    const stepKey = getStepKey(activeStep);
                    const isSelected = build[stepKey]?.id === p.id;
                    
                    // Validar compatibilidad en tiempo real para este producto específico
                    // Simulamos un build con este producto para ver si rompe algo
                    const potentialBuild = { ...build, [stepKey]: p };
                    const issues = CompatibilityEngine.validateBuild(potentialBuild as any);
                    
                    // Consideramos incompatible si hay errores (no warnings) relacionados con este producto
                    const compatibilityError = issues.find(i => i.type === 'error');
                    const isCompatible = !compatibilityError;

                    return (
                      <Grid size={{ xs: 12, sm: 6 }} key={p.id}>
                        <Card 
                          elevation={0}
                          sx={{ 
                            borderRadius: 3, 
                            border: '1px solid', 
                            borderColor: isSelected ? 'primary.main' : 'rgba(0,0,0,0.05)',
                            transition: 'all 0.2s',
                            opacity: isCompatible ? 1 : 0.6,
                            filter: isCompatible ? 'none' : 'grayscale(0.8)',
                            '&:hover': { 
                              transform: isCompatible ? 'translateY(-4px)' : 'none', 
                              boxShadow: isCompatible ? '0 10px 20px rgba(0,0,0,0.05)' : 'none' 
                            },
                            position: 'relative',
                            overflow: 'visible'
                          }}
                        >
                          {!isCompatible && (
                            <Box sx={{ 
                              position: 'absolute', 
                              top: 10, 
                              right: 10, 
                              zIndex: 10,
                              bgcolor: 'rgba(0,0,0,0.6)',
                              backdropFilter: 'blur(4px)',
                              color: 'white',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 2,
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: 1
                            }}>
                              Incompatible
                            </Box>
                          )}

                          <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
                            <Box 
                              component="img" 
                              src={p.images?.[0] || '/placeholder.png'} 
                              sx={{ 
                                width: 100, 
                                height: 100, 
                                objectFit: 'contain', 
                                bgcolor: '#f4f4f4', 
                                borderRadius: 2 
                              }} 
                            />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" fontWeight={800} sx={{ mb: 0.5 }}>{p.name}</Typography>
                              <Typography variant="body1" color="primary" fontWeight={700} sx={{ mb: 1 }}>
                                ${p.price.toLocaleString('es-ES')}
                              </Typography>
                              <Button 
                                variant={isSelected ? "contained" : "outlined"} 
                                size="small" 
                                fullWidth
                                onClick={() => isCompatible && handleSelectProduct(p)}
                                disabled={!isCompatible && !isSelected}
                                color={!isCompatible ? "error" : "primary"}
                              >
                                {isSelected ? 'Seleccionado' : isCompatible ? 'Seleccionar' : 'Incompatible'}
                              </Button>
                            </Box>
                          </Box>
                        </Card>
                      </Grid>
                    );
                  })
                )}
              </Grid>
            )}
          </Grid>

          {/* Sidebar - Summary & Compatibility */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ position: 'sticky', top: 100 }}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 4, mb: 3, border: '1px solid rgba(0,0,0,0.05)' }}>
                <Typography variant="h6" fontWeight={800} gutterBottom>Tu Configuración</Typography>
                <Divider sx={{ my: 2 }} />
                
                <Stack spacing={2}>
                  {STEPS.map((step, idx) => {
                    const product = build[getStepKey(idx)];
                    return (
                      <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">{step.name}:</Typography>
                        {product ? (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" fontWeight={700} sx={{ maxWidth: 150 }} noWrap>{product.name}</Typography>
                            <IconButton size="small" color="error" onClick={() => setBuild(prev => ({ ...prev, [getStepKey(idx)]: undefined }))}>
                              <Trash2 size={14} />
                            </IconButton>
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>Pendiente</Typography>
                        )}
                      </Box>
                    );
                  })}
                </Stack>

                <Divider sx={{ my: 3 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                  <Typography variant="h6" fontWeight={800}>Total Estimado:</Typography>
                  <Typography variant="h6" fontWeight={800} color="primary">${totalPrice.toLocaleString('es-ES')}</Typography>
                </Box>
              </Paper>

              <AnimatePresence>
                {compatibilityIssues.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
                    <Alert 
                      severity={compatibilityIssues.some(i => i.type === 'error') ? 'error' : 'warning'}
                      icon={<AlertTriangle size={20} />}
                      sx={{ borderRadius: 3, mb: 2 }}
                    >
                      <Typography variant="subtitle2" fontWeight={700}>Alertas de Compatibilidad</Typography>
                      <Box sx={{ mt: 1 }}>
                        {compatibilityIssues.map((issue, idx) => (
                          <Typography key={idx} variant="caption" display="block">• {issue.message}</Typography>
                        ))}
                      </Box>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {activeStep > 0 && (
                <Button fullWidth onClick={handleBack} startIcon={<ChevronLeft />} sx={{ mt: 2 }}>
                  Paso Anterior
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PCBuilderPage;
