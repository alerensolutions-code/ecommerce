"use client";

import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Stack, 
  LinearProgress 
} from '@mui/material';
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { title: 'Ventas Totales', value: '$12.450', icon: <DollarSign />, color: '#4caf50', trend: '+12%', up: true },
    { title: 'Pedidos Hoy', value: '28', icon: <ShoppingBag />, color: '#ff9800', trend: '-2%', up: false },
    { title: 'Tasa Conversión', value: '3.2%', icon: <TrendingUp />, color: '#f44336', trend: '+0.5%', up: true },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 800 }}>Dashboard</Typography>
      
      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={stat.title}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 4, 
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Box 
                  sx={{ 
                    p: 1.5, 
                    borderRadius: 3, 
                    bgcolor: `${stat.color}15`, 
                    color: stat.color,
                    display: 'flex'
                  }}
                >
                  {stat.icon}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{stat.title}</Typography>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>{stat.value}</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ display: 'flex', color: stat.up ? '#4caf50' : '#f44336' }}>
                  {stat.up ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                </Box>
                <Typography variant="caption" sx={{ color: stat.up ? '#4caf50' : '#f44336', fontWeight: 700 }}>
                  {stat.trend}
                </Typography>
                <Typography variant="caption" color="text.secondary">vs mes pasado</Typography>
              </Stack>
            </Paper>
          </Grid>
        ))}

        {/* Charts Mockups */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid rgba(0,0,0,0.05)', height: 400 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 800 }}>Rendimiento de Ventas</Typography>
            <Box sx={{ height: 280, display: 'flex', alignItems: 'flex-end', gap: 2, px: 2 }}>
              {[60, 40, 80, 50, 90, 70, 100, 85, 45, 75, 55, 95].map((height, i) => (
                <Box 
                  key={i} 
                  sx={{ 
                    flex: 1, 
                    height: `${height}%`, 
                    bgcolor: i === 6 ? 'primary.main' : 'rgba(0,0,0,0.05)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'all 0.3s ease',
                    '&:hover': { bgcolor: 'primary.main' }
                  }} 
                />
              ))}
            </Box>
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 2, px: 1 }}>
              <Typography variant="caption" color="text.secondary">ENE</Typography>
              <Typography variant="caption" color="text.secondary">JUN</Typography>
              <Typography variant="caption" color="text.secondary">DIC</Typography>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid rgba(0,0,0,0.05)', height: 400 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 800 }}>Categorías Populares</Typography>
            <Stack spacing={3}>
              {[
                { label: 'Tarjetas Gráficas', value: 75, color: '#f44336' },
                { label: 'Procesadores', value: 60, color: '#2196f3' },
                { label: 'Monitores', value: 45, color: '#4caf50' },
                { label: 'Periféricos', value: 30, color: '#ff9800' }
              ].map((item) => (
                <Box key={item.label}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.label}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.value}%</Typography>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={item.value} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4, 
                      bgcolor: 'rgba(0,0,0,0.05)',
                      '& .MuiLinearProgress-bar': { bgcolor: item.color }
                    }} 
                  />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
