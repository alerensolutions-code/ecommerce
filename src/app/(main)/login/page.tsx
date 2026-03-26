"use client";

import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Stack, 
  IconButton, 
  InputAdornment, 
  Alert 
} from '@mui/material';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useAuth } from '../../../context/AuthContext';

const LoginPage = () => {
  const router = useRouter();
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
        router.push('/admin');
      } else {
        setError('Credenciales de administrador incorrectas.');
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
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Acceso Admin</Typography>
            <Typography variant="body2" color="text.secondary">
              Inicia sesión en el panel del administrador
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
                Acceso restringido únicamente a personal autorizado.
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
