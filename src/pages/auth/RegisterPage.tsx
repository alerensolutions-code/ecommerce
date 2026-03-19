import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Link, 
  Stack, 
  IconButton, 
  InputAdornment, 
  Alert,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!formData.acceptTerms) {
      setError('Debes aceptar los términos y condiciones.');
      return;
    }

    const success = register(formData.name, formData.email, formData.password);
    if (success) {
      navigate('/');
    } else {
      setError('Error al registrarse. Por favor, intenta de nuevo.');
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '80vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#f4f4f4',
        py: 8
      }}
    >
      <Container maxWidth="xs">
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            borderRadius: 4, 
            border: '1px solid rgba(0,0,0,0.05)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.05)'
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Crea tu Cuenta</Typography>
            <Typography variant="body2" color="text.secondary">
              Únete a la legión de Devil Gaming
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Nombre Completo"
                name="name"
                variant="outlined"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <TextField
                fullWidth
                label="Correo Electrónico"
                name="email"
                type="email"
                variant="outlined"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <TextField
                fullWidth
                label="Contraseña"
                name="password"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                value={formData.password}
                onChange={handleChange}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Confirmar Contraseña"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              
              <FormControlLabel
                control={
                  <Checkbox 
                    name="acceptTerms" 
                    checked={formData.acceptTerms} 
                    onChange={handleChange} 
                    color="primary" 
                  />
                }
                label={
                  <Typography variant="body2">
                    Acepto los <Link component={RouterLink} to="/terms" sx={{ fontWeight: 600 }}>Términos y Condiciones</Link>
                  </Typography>
                }
              />

              <Button
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                startIcon={<UserPlus size={20} />}
                sx={{ py: 1.5, fontWeight: 700, fontSize: '1rem', mt: 1 }}
              >
                Registrarse
              </Button>

              <Typography variant="body2" align="center" color="text.secondary">
                ¿Ya tienes una cuenta?{' '}
                <Link component={RouterLink} to="/login" sx={{ fontWeight: 700, color: 'primary.main', textDecoration: 'none' }}>
                  Inicia sesión
                </Link>
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;
