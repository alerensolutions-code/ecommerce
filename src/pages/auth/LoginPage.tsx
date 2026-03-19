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
  Alert 
} from '@mui/material';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      const success = login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Credenciales incorrectas. Prueba con user@example.com / password');
      }
    } else {
      setError('Por favor, completa todos los campos.');
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
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Bienvenido</Typography>
            <Typography variant="body2" color="text.secondary">
              Inicia sesión en tu cuenta de Devil Gaming
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Correo Electrónico"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              
              <Box sx={{ textAlign: 'right' }}>
                <Link component={RouterLink} to="/forgot-password" variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                  ¿Olvidaste tu contraseña?
                </Link>
              </Box>

              <Button
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                startIcon={<LogIn size={20} />}
                sx={{ py: 1.5, fontWeight: 700, fontSize: '1rem' }}
              >
                Iniciar Sesión
              </Button>

              <Typography variant="body2" align="center" color="text.secondary">
                ¿No tienes una cuenta?{' '}
                <Link component={RouterLink} to="/register" sx={{ fontWeight: 700, color: 'primary.main', textDecoration: 'none' }}>
                  Regístrate aquí
                </Link>
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
