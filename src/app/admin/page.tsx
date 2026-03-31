"use client";

import { useEffect, useState, useMemo } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Stack, 
  CircularProgress,
  IconButton,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { 
  DollarSign,
  ArrowRight,
  Package,
  ShoppingBag,
  TrendingUp,
  Box as BoxIcon
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

const getDaysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
};

const Dashboard = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [metricType, setMetricType] = useState<'revenue' | 'units'>('revenue');

  useEffect(() => {
    const fetchData = async () => {
      const sixtyDaysAgo = getDaysAgo(60).toISOString();
      
      const [ordRes, catRes, prodRes] = await Promise.all([
        supabase.from('orders').select('*').gte('created_at', sixtyDaysAgo).order('created_at', { ascending: true }),
        supabase.from('categories').select('*'),
        supabase.from('products').select('id, name, category_id')
      ]);
        
      setOrders(ordRes.data || []);
      setCategories(catRes.data || []);
      setProducts(prodRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const metrics = useMemo(() => {
    const thirtyDaysAgo = getDaysAgo(30);

    // Solo ventas con estado 'Entregado' para las métricas de ingresos
    const completedOrdersLat60 = orders.filter(o => o.status === 'Entregado');
    const last30Completed = completedOrdersLat60.filter(o => new Date(o.created_at) >= thirtyDaysAgo);
    
    // Revenue calculations
    const sumTotal = (arr: any[]) => arr.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    const revenue30 = sumTotal(last30Completed);

    // Resumen de Pedidos (todos los estados, últimos 30 días)
    const allLast30Orders = orders.filter(o => new Date(o.created_at) >= thirtyDaysAgo);

    // Chart Data logic
    const chartDataMap = new Map();
    for (let i = 29; i >= 0; i--) {
      const d = getDaysAgo(i);
      chartDataMap.set(d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }), 0);
    }
    
    last30Completed.forEach(o => {
      const dateStr = new Date(o.created_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
      if (chartDataMap.has(dateStr)) {
        if (metricType === 'revenue') {
          chartDataMap.set(dateStr, chartDataMap.get(dateStr) + (parseFloat(o.total) || 0));
        } else {
          const itemsCount = o.items ? o.items.reduce((acc: number, item: any) => acc + item.quantity, 0) : 0;
          chartDataMap.set(dateStr, chartDataMap.get(dateStr) + itemsCount);
        }
      }
    });

    const chartData = Array.from(chartDataMap, ([date, value]) => ({ date, value }));

    // Cálculo de Categorías Top 3
    const productSales: Record<string, number> = {};
    completedOrdersLat60.forEach(o => {
        if (o.items && Array.isArray(o.items)) {
            o.items.forEach((item: any) => {
                productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
            });
        }
    });

    const catSales: Record<string, number> = {};
    products.forEach(p => {
        const sales = productSales[p.name] || 0;
        if (p.category_id) {
            catSales[p.category_id] = (catSales[p.category_id] || 0) + sales;
        }
    });

    const top3Cats = categories
        .map(c => ({ name: c.name, sales: catSales[c.id] || 0 }))
        .filter(c => c.sales > 0)
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 3);

    return {
      revenue30,
      chartData,
      totalOrders: allLast30Orders.length,
      top3Cats
    };
  }, [orders, categories, products, metricType]);

  if (loading) {
    return (
      <Box sx={{ p: 10, textAlign: 'center' }}>
        <CircularProgress color="primary" />
        <Typography sx={{ mt: 2 }} color="text.secondary">Cargando métricas...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 800 }}>Dashboard General</Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Card Ventas */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden', height: '100%' }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, bgcolor: '#4caf50' }} />
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2, mt: 1 }}>
                    <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: '#4caf5015', color: '#4caf50', display: 'flex' }}>
                        <DollarSign />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Ventas</Typography>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                    ${metrics.revenue30.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>Solo pedidos entregados</Typography>
                <IconButton component={Link} href="/admin/dashboard/ventas" sx={{ position: 'absolute', bottom: 16, right: 16, bgcolor: '#4caf5010', color: '#4caf50' }}>
                    <ArrowRight size={20} />
                </IconButton>
            </Paper>
        </Grid>

        {/* Card Pedidos */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden', height: '100%' }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, bgcolor: '#ff9800' }} />
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2, mt: 1 }}>
                    <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: '#ff980015', color: '#ff9800', display: 'flex' }}>
                        <ShoppingBag />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Resumen de Pedidos</Typography>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>{metrics.totalOrders}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>En los últimos 30 días</Typography>
                <IconButton component={Link} href="/admin/dashboard/pedidos" sx={{ position: 'absolute', bottom: 16, right: 16, bgcolor: '#ff980010', color: '#ff9800' }}>
                    <ArrowRight size={20} />
                </IconButton>
            </Paper>
        </Grid>

        {/* Card Categorías Top 3 */}
        <Grid size={{ xs: 12, sm: 12, md: 4 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden', height: '100%' }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, bgcolor: '#2196f3' }} />
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2, mt: 1 }}>
                    <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: '#2196f315', color: '#2196f3', display: 'flex' }}>
                        <Package />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Categorías Populares</Typography>
                </Stack>
                
                {metrics.top3Cats.length > 0 ? (
                    <Stack spacing={0.5} sx={{ mt: 1 }}>
                        {metrics.top3Cats.map((cat, i) => (
                            <Typography key={i} variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                #{i+1} {cat.name}
                            </Typography>
                        ))}
                    </Stack>
                ) : (
                    <Typography variant="h6" sx={{ fontWeight: 800, mt: 1 }}>Sin datos</Typography>
                )}
                
                <IconButton component={Link} href="/admin/dashboard/categorias" sx={{ position: 'absolute', bottom: 16, right: 16, bgcolor: '#2196f310', color: '#2196f3' }}>
                    <ArrowRight size={20} />
                </IconButton>
            </Paper>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid rgba(0,0,0,0.05)', height: 450 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
            <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Evolución del Negocio</Typography>
                <Typography variant="caption" color="text.secondary">Datos de los últimos 30 días</Typography>
            </Box>
            
            <ToggleButtonGroup
                value={metricType}
                exclusive
                onChange={(e, val) => val && setMetricType(val)}
                size="small"
                sx={{ bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}
            >
                <ToggleButton value="revenue" sx={{ textTransform: 'none', px: 2, fontWeight: 700 }}>
                    Facturación ($)
                </ToggleButton>
                <ToggleButton value="units" sx={{ textTransform: 'none', px: 2, fontWeight: 700 }}>
                    Unidades Vendidas
                </ToggleButton>
            </ToggleButtonGroup>
        </Stack>

        <Box sx={{ height: 320, width: '100%' }}>
          {metrics.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.chartData}>
                <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#cc0000" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#cc0000" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#888', fontSize: 12 }} 
                  dy={10}
                  minTickGap={30}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#888', fontSize: 12 }}
                  tickFormatter={(val) => metricType === 'revenue' ? `$${val}` : `${val}`}
                />
                <RechartsTooltip 
                  formatter={(value: any) => [
                      metricType === 'revenue' 
                        ? `$${Number(value).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`
                        : `${value} unidades`, 
                      metricType === 'revenue' ? 'Facturación' : 'Unidades'
                  ]}
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#cc0000" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)"
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">Sin datos registrados recientemente.</Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Dashboard;
