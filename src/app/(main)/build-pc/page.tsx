"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, Container, Typography, Paper, Button, CircularProgress, 
  Grid, IconButton, Divider, Snackbar, Alert
} from '@mui/material';
import { 
  Cpu, Server, Zap, HardDrive, ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, X, Play
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { useCart } from '../../../context/CartContext';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  { id: 'procesador', label: 'Procesador', keywords: ['procesador', 'cpu'], optional: false, icon: <Cpu size={20} /> },
  { id: 'motherboard', label: 'Motherboard', keywords: ['mother', 'placa base', 'placa madre'], optional: false, icon: <Server size={20} /> },
  { id: 'ram', label: 'Memoria RAM', keywords: ['ram', 'memoria'], optional: false, icon: <HardDrive size={20} /> },
  { id: 'storage', label: 'Almacenamiento', keywords: ['disco', 'ssd', 'hdd', 'm.2', 'm2'], optional: false, icon: <HardDrive size={20} /> },
  { id: 'gpu', label: 'Placa de Video', keywords: ['grafica', 'video', 'gpu'], optional: true, icon: <Play size={20} /> },
  { id: 'psu', label: 'Fuente', keywords: ['fuente', 'psu'], optional: false, icon: <Zap size={20} /> },
  { id: 'case', label: 'Gabinete', keywords: ['gabinete', 'case'], optional: false, icon: <Server size={20} /> },
  { id: 'cooler', label: 'Refrigeración', keywords: ['refrigeracion', 'cooler', 'disipador', 'water', 'líquido'], optional: true, icon: <Zap size={20} /> },
];

const BuildPcPage = () => {
  const router = useRouter();
  const { dispatch } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [toast, setToast] = useState<{show: boolean, msg: string}>({show: false, msg: ''});

  useEffect(() => {
    const fetchPCComponents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(name)');

      if (!error && data) {
        // Exclude consoles just in case
        const pcParts = data.filter(p => {
          const catName = p.category?.name?.toLowerCase() || '';
          return !catName.includes('consola') && !catName.includes('ps5') && !catName.includes('xbox');
        });
        setProducts(pcParts);
      }
      setLoading(false);
    };

    fetchPCComponents();
  }, []);

  const isSummary = currentStep === STEPS.length;
  const currentStepData = !isSummary ? STEPS[currentStep] : null;

  const currentProducts = useMemo(() => {
    if (isSummary || !currentStepData) return [];
    return products.filter(p => {
      const name = p.name.toLowerCase();
      const cat = p.category?.name?.toLowerCase() || '';
      return currentStepData.keywords.some(kw => cat.includes(kw) || name.includes(kw));
    });
  }, [products, currentStepData, isSummary]);

  const handleSelectProduct = (product: any) => {
    if (!currentStepData) return;
    
    // Save to configuration state
    setConfig(prev => ({
      ...prev,
      [currentStepData.id]: product
    }));

    // Auto-advance
    setCurrentStep(prev => prev + 1);
  };

  const handleOmitStep = () => {
    if (!currentStepData) return;
    const newConfig = { ...config };
    delete newConfig[currentStepData.id];
    setConfig(newConfig);
    setCurrentStep(prev => prev + 1);
  };

  const handleAddToCart = () => {
    const components = Object.values(config).filter(Boolean);
    components.forEach(comp => {
      dispatch({ type: 'ADD_TO_CART', payload: comp as any });
    });
    
    setToast({ show: true, msg: '¡Configuración agregada al arsenal exitosamente!' });
    setTimeout(() => {
      router.push('/cart');
    }, 1500);
  };

  return (
    <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh', pb: 10, color: 'white' }}>
      {/* Dynamic Header */}
      <Box sx={{ 
        pt: 8, pb: 4, 
        background: 'linear-gradient(to bottom, #1a0000 0%, #0a0a0a 100%)',
        borderBottom: '1px solid rgba(255,0,0,0.1)'
      }}>
        <Container maxWidth="xl" sx={{ textAlign: 'center' }}>
          <Typography variant="overline" sx={{ color: '#ff3333', fontWeight: 900, letterSpacing: 4 }}>
            SISTEMA DE ENSAMBLAJE ELITE
          </Typography>
          <Typography variant="h2" sx={{ 
            fontWeight: 900, mt: 1, mb: 1,
            background: 'linear-gradient(90deg, #ff0000, #cc0000)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 40px rgba(255,0,0,0.3)'
          }}>
            {isSummary ? "RESUMEN DE ENSAMBLAJE" : currentStepData?.label.toUpperCase()}
          </Typography>
          {!isSummary && (
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 300 }}>
              Paso {currentStep + 1} de {STEPS.length}
            </Typography>
          )}
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          
          {/* Main Content Area */}
          <Grid item xs={12} md={9}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {loading ? (
                  <Box sx={{ py: 10, textAlign: 'center' }}>
                    <CircularProgress color="primary" />
                    <Typography sx={{ mt: 2 }} color="rgba(255,255,255,0.6)">Buscando componentes compatibles...</Typography>
                  </Box>
                ) : isSummary ? (
                  /* SUMMARY SCREEN */
                  <Paper sx={{ p: 4, bgcolor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4 }}>
                    <Typography variant="h5" fontWeight={800} color="white" mb={4}>Tus Selecciones</Typography>
                    
                    {STEPS.map((step) => {
                      const selectedItem = config[step.id];
                      return (
                        <Box key={step.id} sx={{ mb: 2 }}>
                          <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
                            {step.label}
                          </Typography>
                          <Paper sx={{ 
                            mt: 1, p: 2, 
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            bgcolor: selectedItem ? 'rgba(255,255,255,0.03)' : 'rgba(255,0,0,0.05)',
                            border: `1px solid ${selectedItem ? 'rgba(255,255,255,0.1)' : 'rgba(255,0,0,0.2)'}`,
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {selectedItem?.images?.[0] ? (
                                <Box component="img" src={selectedItem.images[0]} sx={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 1 }} />
                              ) : (
                                <Box sx={{ width: 40, height: 40, bgcolor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1, color: 'white' }}>
                                  {step.icon}
                                </Box>
                              )}
                              <Box>
                                <Typography fontWeight={700} color="white">
                                  {selectedItem ? selectedItem.name : "— Omitido / No seleccionado —"}
                                </Typography>
                                {selectedItem && (
                                  <Typography variant="body2" sx={{ color: '#ff3333', fontWeight: 600 }}>
                                    ${selectedItem.discountPrice || selectedItem.price}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                            <Button 
                              size="small" 
                              variant="outlined" 
                              onClick={() => setCurrentStep(STEPS.indexOf(step))}
                              sx={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { borderColor: 'white' } }}
                            >
                              Cambiar
                            </Button>
                          </Paper>
                        </Box>
                      );
                    })}
                  </Paper>
                ) : (
                  /* CATALOG GRID FOR ACTIVE STEP */
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" fontWeight={800} color="white">
                        Selecciona tu {currentStepData?.label}
                      </Typography>
                      {currentStepData?.optional && (
                        <Button 
                          onClick={handleOmitStep}
                          variant="text" 
                          endIcon={<ChevronRight size={16} />}
                          sx={{ color: '#ff3333', fontWeight: 700 }}
                        >
                          Ignorar componente (Ya tengo uno) 
                        </Button>
                      )}
                    </Box>

                    {currentProducts.length > 0 ? (
                      <Grid container spacing={3}>
                        {currentProducts.map((product) => {
                          const isSelected = config[currentStepData!.id]?.id === product.id;
                          return (
                            <Grid item xs={12} sm={6} lg={4} key={product.id}>
                              <Paper 
                                onClick={() => handleSelectProduct(product)}
                                sx={{ 
                                  height: '100%',
                                  p: 2, 
                                  bgcolor: isSelected ? 'rgba(204,0,0,0.1)' : '#111', 
                                  border: `2px solid ${isSelected ? '#cc0000' : 'rgba(255,255,255,0.05)'}`,
                                  borderRadius: 4,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  position: 'relative',
                                  overflow: 'hidden',
                                  '&:hover': {
                                    borderColor: '#ff3333',
                                    transform: 'translateY(-4px)'
                                  }
                                }}
                              >
                                {isSelected && (
                                  <Box sx={{ position: 'absolute', top: 12, right: 12, color: '#ff3333' }}>
                                    <CheckCircle2 size={24} fill="currentColor" stroke="#111" />
                                  </Box>
                                )}
                                
                                <Box sx={{ bgcolor: 'white', borderRadius: 2, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, p: 2 }}>
                                  {product.images?.[0] ? (
                                    <Box component="img" src={product.images[0]} sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                  ) : (
                                    <Typography color="text.secondary">Sin Imagen</Typography>
                                  )}
                                </Box>
                                
                                <Typography variant="overline" sx={{ color: '#ff3333', fontWeight: 800, display: 'block', lineHeight: 1 }}>
                                  {product.brand}
                                </Typography>
                                <Typography variant="subtitle1" fontWeight={700} color="white" sx={{ mb: 1, minHeight: 48, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                  {product.name}
                                </Typography>
                                <Typography variant="h6" fontWeight={800} color="white">
                                  ${product.discountPrice || product.price}
                                </Typography>
                              </Paper>
                            </Grid>
                          );
                        })}
                      </Grid>
                    ) : (
                      <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#111', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Typography variant="h6" color="white" mb={2}>Ups, no encontramos hardware para este paso.</Typography>
                        <Button variant="outlined" onClick={handleOmitStep} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                          Continuar de todas formas
                        </Button>
                      </Paper>
                    )}
                  </Box>
                )}
              </motion.div>
            </AnimatePresence>
          </Grid>

          {/* Sticky Sidebar / Mini Summary */}
          <Grid item xs={12} md={3}>
            <Box sx={{ position: 'sticky', top: 100 }}>
              <Paper sx={{ p: 3, bgcolor: '#0a0a0a', border: '1px solid rgba(255,0,0,0.3)', borderRadius: 4 }}>
                <Typography variant="h6" fontWeight={900} color="white" mb={3} display="flex" alignItems="center" gap={1}>
                  <Zap size={20} color="#ff3333" /> TU ARSENAL
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                  {STEPS.map((step, idx) => {
                    const isPassed = idx < currentStep || isSummary;
                    const isActive = idx === currentStep;
                    const selectedItem = config[step.id];

                    return (
                      <Box key={step.id} sx={{ 
                        opacity: isPassed || isActive ? 1 : 0.4,
                        transition: 'opacity 0.3s'
                      }}>
                        <Typography variant="caption" sx={{ color: isActive ? '#ff3333' : 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase' }}>
                          {step.label}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: selectedItem ? 'white' : isActive ? '#ff3333' : 'rgba(255,255,255,0.3)', 
                          fontWeight: selectedItem ? 600 : 400,
                          fontSize: '0.85rem',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                        }}>
                          {selectedItem ? selectedItem.name : isActive ? "Eligiendo..." : "Pendiente"}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
                
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', mb: 3 }}>
                  <Typography variant="body2" color="rgba(255,255,255,0.6)">Total Estimado</Typography>
                  <Typography variant="h5" fontWeight={900} color="#ff3333">
                    ${Object.values(config).reduce((acc, item) => acc + (item.discountPrice || item.price), 0)}
                  </Typography>
                </Box>

                {isSummary ? (
                  <Button 
                    fullWidth 
                    variant="contained" 
                    size="large"
                    onClick={handleAddToCart}
                    sx={{ 
                      fontWeight: 800, 
                      py: 1.5, 
                      boxShadow: '0 0 20px rgba(204,0,0,0.5)',
                      '&:hover': { transform: 'scale(1.02)' }
                    }}
                  >
                    MANDAR AL CARRITO
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      fullWidth variant="outlined" 
                      disabled={currentStep === 0}
                      onClick={() => setCurrentStep(prev => prev - 1)}
                      sx={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white', '&:disabled': { color: 'rgba(255,255,255,0.1)' } }}
                    >
                      Atrás
                    </Button>
                    <Button 
                      fullWidth variant="contained"
                      onClick={() => setCurrentStep(prev => prev + 1)}
                      sx={{ fontWeight: 800 }}
                    >
                      Saltar
                    </Button>
                  </Box>
                )}
              </Paper>
            </Box>
          </Grid>

        </Grid>
      </Container>
      
      <Snackbar open={toast.show} autoHideDuration={3000} onClose={() => setToast({show: false, msg: ''})} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" sx={{ width: '100%', fontWeight: 700, bgcolor: '#cc0000' }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BuildPcPage;
