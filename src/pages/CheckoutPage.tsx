import { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  TextField, 
  Stack, 
  Divider, 
  Stepper, 
  Step, 
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Alert
} from '@mui/material';
import { CheckCircle2, CreditCard, Truck, ListChecks, ArrowLeft } from 'lucide-react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const steps = ['Envío', 'Pago', 'Confirmación'];

const CheckoutPage = () => {
  const { state, dispatch } = useCart();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const subtotal = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 15;
  const total = subtotal + shipping;

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Finalize order (mock)
      dispatch({ type: 'CLEAR_CART' });
      setActiveStep(activeStep + 1);
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  if (state.items.length === 0 && activeStep < 3) {
    return (
      <Container sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 800 }}>Tu carrito está vacío</Typography>
        <Button component={RouterLink} to="/shop" variant="contained">Volver a la Tienda</Button>
      </Container>
    );
  }

  const renderShippingForm = () => (
    <Stack spacing={3}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>Información de Envío</Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Nombre" required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Apellidos" required />
        </Grid>
        <Grid size={12}>
          <TextField fullWidth label="Dirección" required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Ciudad" required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Código Postal" required />
        </Grid>
        <Grid size={12}>
          <TextField fullWidth label="Teléfono" required />
        </Grid>
      </Grid>
    </Stack>
  );

  const renderPaymentForm = () => (
    <Stack spacing={3}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>Método de Pago</Typography>
      <FormControl component="fieldset">
        <RadioGroup defaultValue="card">
          <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid #eee', borderRadius: 2 }}>
            <FormControlLabel 
              value="card" 
              control={<Radio />} 
              label={
                <Stack direction="row" spacing={2} alignItems="center">
                  <CreditCard size={20} />
                  <Typography sx={{ fontWeight: 600 }}>Tarjeta de Crédito / Débito</Typography>
                </Stack>
              } 
            />
            <Box sx={{ mt: 2, pl: 4 }}>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <TextField fullWidth label="Número de Tarjeta" placeholder="0000 0000 0000 0000" />
                </Grid>
                <Grid size={{ xs: 6, sm: 6 }}>
                  <TextField fullWidth label="Fecha Expiración" placeholder="MM/YY" />
                </Grid>
                <Grid size={{ xs: 6, sm: 6 }}>
                  <TextField fullWidth label="CVV" placeholder="123" />
                </Grid>
              </Grid>
            </Box>
          </Paper>
          <Paper elevation={0} sx={{ p: 2, border: '1px solid #eee', borderRadius: 2 }}>
            <FormControlLabel 
              value="paypal" 
              control={<Radio />} 
              label={<Typography sx={{ fontWeight: 600 }}>PayPal</Typography>} 
            />
          </Paper>
        </RadioGroup>
      </FormControl>
    </Stack>
  );

  const renderConfirmation = () => (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <CheckCircle2 size={80} color="#4caf50" style={{ marginBottom: '24px' }} />
      <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>¡Pedido Confirmado!</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Gracias por tu compra. Tu pedido #DG-{Math.floor(Math.random() * 1000000)} ha sido procesado con éxito.
        Recibirás un correo electrónico con los detalles del envío en breve.
      </Typography>
      <Button 
        variant="contained" 
        size="large" 
        onClick={() => navigate('/')}
        sx={{ py: 1.5, px: 4, fontWeight: 700 }}
      >
        Volver al Inicio
      </Button>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: '#f4f4f4', minHeight: '100vh', py: 8 }}>
      <Container maxWidth="lg">
        {activeStep < 3 ? (
          <>
            <Typography variant="h4" sx={{ mb: 6, fontWeight: 800, textAlign: 'center' }}>Finalizar Compra</Typography>
            
            <Stepper activeStep={activeStep} sx={{ mb: 8 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid rgba(0,0,0,0.05)' }}>
                  {activeStep === 0 && renderShippingForm()}
                  {activeStep === 1 && renderPaymentForm()}
                  {activeStep === 2 && (
                    <Stack spacing={3}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>Resumen Final</Typography>
                      <Alert severity="info">
                        Por favor, revisa que todos los datos sean correctos antes de finalizar el pedido.
                      </Alert>
                      <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Destinatario:</Typography>
                        <Typography variant="body2">Juan Pérez - Calle Falsa 123, Madrid, 28001</Typography>
                      </Box>
                    </Stack>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6 }}>
                    <Button
                      variant="text"
                      color="inherit"
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      startIcon={<ArrowLeft size={18} />}
                      sx={{ fontWeight: 600 }}
                    >
                      Atrás
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ px: 6, py: 1.5, fontWeight: 800 }}
                    >
                      {activeStep === steps.length - 1 ? 'Pagar Ahora' : 'Continuar'}
                    </Button>
                  </Box>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(0,0,0,0.05)' }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 800 }}>Tu Pedido</Typography>
                  <Stack spacing={2}>
                    {state.items.map((item) => (
                      <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item.quantity}x {item.name}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                          ${(item.price * item.quantity).toLocaleString('es-ES')}
                        </Typography>
                      </Box>
                    ))}
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Subtotal</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>${subtotal.toLocaleString('es-ES')}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Envío</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{shipping === 0 ? 'Gratis' : `$${shipping}`}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>Total</Typography>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 800 }}>
                        ${total.toLocaleString('es-ES')}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
                
                <Stack spacing={2} sx={{ mt: 3, px: 2 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Truck size={18} opacity={0.5} />
                    <Typography variant="caption" color="text.secondary">Entrega estimada: 48h hábiles</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <ListChecks size={18} opacity={0.5} />
                    <Typography variant="caption" color="text.secondary">Devoluciones gratuitas hasta 30 días</Typography>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </>
        ) : (
          renderConfirmation()
        )}
      </Container>
    </Box>
  );
};

export default CheckoutPage;
