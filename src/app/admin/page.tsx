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
  ToggleButtonGroup,
  Button,
  TextField,
  Chip
} from '@mui/material';

import {
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  History,
  Calendar,
  ShoppingBag,
  ArrowRight,
  ArrowUpRight,
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

  // Filtros de fecha (Default: Últimos 30 días)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Traemos más histórico para el gráfico pero el filtrado será en cliente para mayor rapidez visual al cambiar fechas
        const historicalDate = new Date(startDate);
        historicalDate.setDate(historicalDate.getDate() - 30); // Un poco más de margen

        const [ordRes, catRes, prodRes] = await Promise.all([
          supabase.from('orders').select('*').gte('created_at', historicalDate.toISOString()).order('created_at', { ascending: true }),
          supabase.from('categories').select('*'),
          supabase.from('products').select('id, name, category_id, stock')
        ]);

        setOrders(ordRes.data || []);
        setCategories(catRes.data || []);
        setProducts(prodRes.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [startDate]); // Recarga si la fecha de inicio cambia significativamente

  const metrics = useMemo(() => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Filtrar órdenes por rango
    const rangeOrders = orders.filter(o => {
      const d = new Date(o.created_at);
      return d >= start && d <= end;
    });

    const completedOrdersInRange = rangeOrders.filter(o => o.status === 'Entregado');
    const revenueInRange = completedOrdersInRange.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    const totalOrdersInRange = rangeOrders.length;
    const pendingOrdersInRange = rangeOrders.filter(o => o.status === 'Pendiente');

    // Chart Data logic (dinámico según el rango)
    const chartDataMap = new Map();
    const tempDate = new Date(start);
    while (tempDate <= end) {
      chartDataMap.set(tempDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }), 0);
      tempDate.setDate(tempDate.getDate() + 1);
    }

    completedOrdersInRange.forEach(o => {
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

    // Top 5 Productos Global con Categoría
    const productStats: Record<string, { quantity: number, category: string }> = {};
    completedOrdersInRange.forEach(o => {
      if (o.items && Array.isArray(o.items)) {
        o.items.forEach((item: any) => {
          if (!productStats[item.name]) {
            const product = products.find(p => p.name === item.name);
            const category = categories.find(c => c.id === product?.category_id)?.name || 'Sin categoría';
            productStats[item.name] = { quantity: 0, category };
          }
          productStats[item.name].quantity += item.quantity;
        });
      }
    });

    const top5Products = Object.entries(productStats)
      .map(([name, data]) => ({ name, quantity: data.quantity, category: data.category }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Stock Crítico (Global, actual)
    const lowStockCount = products.filter(p => (p.stock || 0) < 5).length;

    // Pedidos Pendientes (Últimos 5 creados en el rango)
    const lastPendingOrders = rangeOrders
      .filter(o => o.status === 'Pendiente')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    return {
      revenueInRange,
      totalOrdersInRange,
      pendingTotalCount: rangeOrders.filter(o => o.status === 'Pendiente').length,
      lastPendingOrders,
      chartData,
      top5Products,
      lowStockCount
    };
  }, [orders, products, metricType, startDate, endDate]);

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
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" sx={{ mb: 4, gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Dashboard</Typography>

        <Paper elevation={0} sx={{ p: 1, borderRadius: 3, border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 1 }}>
            <Calendar size={18} color="#666" />
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>RANGO:</Typography>
          </Stack>
          <TextField
            type="date"
            size="small"
            label="Desde"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
            onClick={(e) => (e.target as any).showPicker?.()}
            sx={{
              '& .MuiInputBase-input': { fontSize: '0.8rem', py: 0.5, cursor: 'pointer' },
              width: 150
            }}
          />
          <TextField
            type="date"
            size="small"
            label="Hasta"
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
            onClick={(e) => (e.target as any).showPicker?.()}
            sx={{
              '& .MuiInputBase-input': { fontSize: '0.8rem', py: 0.5, cursor: 'pointer' },
              width: 150
            }}
          />
        </Paper>
      </Stack>

      <Grid container spacing={4} sx={{ mb: 6 }}>
        {/* Ventas Finalizadas */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex' }}>
          <Paper elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: 'white',
              border: '1px solid rgba(0,0,0,0.08)',
              height: '100%',
              width: '100%',
              position: 'relative'
            }}>

            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#4caf5008', color: '#4caf50', display: 'flex' }}><DollarSign size={18} /></Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem' }}>Ganancia</Typography>
            </Stack>
            <Typography sx={{ fontWeight: 800, mb: 0.5, fontSize: 'clamp(1.1rem, 2.5vw, 1.75rem)', lineHeight: 1.2, wordBreak: 'break-word' }}>
              ${metrics.revenueInRange.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </Typography>
            <Typography variant="caption" color="text.secondary">Ventas entregadas</Typography>
          </Paper>
        </Grid>

        {/* Pedidos del Periodo */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex' }}>
          <Paper elevation={0}
            component={Link}
            href="/admin/orders"
            sx={{
              p: 3, borderRadius: 3, bgcolor: 'white',
              border: '1px solid rgba(0,0,0,0.08)',
              height: '100%',
              width: '100%',
              position: 'relative',
              textDecoration: 'none',
              transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: '#fafafa',
                borderColor: '#2196f3',
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.04)',
                '& .nav-arrow': { transform: 'translate(2px, -2px)', opacity: 1 }
              }
            }}>
            <Box className="nav-arrow" sx={{
              position: 'absolute', top: 20, right: 20, color: 'text.disabled', opacity: 0.5, transition: '0.3s'
            }}>
              <ArrowUpRight size={18} />
            </Box>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#2196f308', color: '#2196f3', display: 'flex' }}><ShoppingBag size={18} /></Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem' }}>Pedidos</Typography>
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>{metrics.totalOrdersInRange}</Typography>
            <Typography variant="caption" color="text.secondary">Total periodo</Typography>
          </Paper>
        </Grid>

        {/* Pedidos Pendientes */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex' }}>
          <Paper elevation={0}
            component={Link}
            href="/admin/orders?status=Pendiente"
            sx={{
              p: 3, borderRadius: 3, bgcolor: 'white',
              border: '1px solid rgba(0,0,0,0.08)',
              height: '100%',
              width: '100%',
              position: 'relative',
              textDecoration: 'none',
              transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: '#fafafa',
                borderColor: '#ff9800',
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.04)',
                '& .nav-arrow': { transform: 'translate(2px, -2px)', opacity: 1 }
              }
            }}>
            <Box className="nav-arrow" sx={{
              position: 'absolute', top: 20, right: 20, color: 'text.disabled', opacity: 0.5, transition: '0.3s'
            }}>
              <ArrowUpRight size={18} />
            </Box>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: metrics.pendingTotalCount > 0 ? '#ff980008' : '#f5f5f5', color: metrics.pendingTotalCount > 0 ? '#ff9800' : 'text.disabled', display: 'flex' }}><Clock size={18} /></Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem' }}>Pendientes</Typography>
            </Stack>
            <Typography variant="h4" sx={{
              fontWeight: 800,
              color: metrics.pendingTotalCount > 0 ? '#ff9800' : 'text.primary',
              mb: 0.5
            }}>
              {metrics.pendingTotalCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">Por preparar</Typography>
          </Paper>
        </Grid>

        {/* Stock Bajo */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex' }}>
          <Paper elevation={0}
            component={Link}
            href="/admin/products?filter=critical"
            sx={{
              p: 3, borderRadius: 3, bgcolor: 'white',
              border: '1px solid rgba(0,0,0,0.08)',
              height: '100%',
              width: '100%',
              position: 'relative',
              textDecoration: 'none',
              transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: '#fafafa',
                borderColor: '#f44336',
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.04)',
                '& .nav-arrow': { transform: 'translate(2px, -2px)', opacity: 1 }
              }
            }}>
            <Box className="nav-arrow" sx={{
              position: 'absolute', top: 20, right: 20, color: 'text.disabled', opacity: 0.5, transition: '0.3s'
            }}>
              <ArrowUpRight size={18} />
            </Box>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: metrics.lowStockCount > 0 ? '#f4433608' : '#f5f5f5', color: metrics.lowStockCount > 0 ? '#f44336' : 'text.disabled', display: 'flex' }}><AlertTriangle size={18} /></Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem' }}>Bajo Stock</Typography>
            </Stack>
            <Typography variant="h4" sx={{
              fontWeight: 800,
              color: metrics.lowStockCount > 0 ? '#f44336' : 'text.primary',
              mb: 0.5
            }}>
              {metrics.lowStockCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">Críticos</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Próximos Envíos (Pendientes) */}
        <Grid size={{ xs: 12, lg: 8 }} sx={{ display: 'flex' }}>
          <Paper elevation={0} sx={{ p: 0, borderRadius: 4, border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden', height: '100%', width: '100%' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <History size={20} color="#666" />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Últimos Pendientes</Typography>
              </Stack>
            </Box>
            <Box sx={{ p: 0 }}>
              {metrics.lastPendingOrders.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: 'rgba(0,0,0,0.02)', textAlign: 'left' }}>
                    <tr>
                      <th style={{ padding: '12px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#666' }}>FECHA</th>
                      <th style={{ padding: '12px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#666' }}>CLIENTE</th>
                      <th style={{ padding: '12px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#666' }}>TOTAL</th>
                      <th style={{ padding: '12px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#666' }}>ACCION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.lastPendingOrders.map((order) => (
                      <tr key={order.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                        <td style={{ padding: '16px 24px', fontSize: '0.8rem', color: '#666' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                        <td style={{ padding: '16px 24px', fontSize: '0.85rem', fontWeight: 600 }}>{order.customer_name}</td>
                        <td style={{ padding: '16px 24px', fontSize: '0.85rem', fontWeight: 700 }}>${order.total}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <IconButton size="small" component={Link} href={`/admin/orders?orderId=${encodeURIComponent(order.id)}`} color="primary"><ArrowRight size={18} /></IconButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">No hay pedidos pendientes en este rango.</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Top 5 Ventas */}
        <Grid size={{ xs: 12, lg: 4 }} sx={{ display: 'flex' }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(0,0,0,0.05)', height: '100%', width: '100%' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
              <TrendingUp size={20} color="#888" />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Top 5 Vendidos</Typography>
            </Stack>

            <Stack spacing={2.5}>
              {metrics.top5Products.map((prod, idx) => (
                <Box key={idx} sx={{ position: 'relative' }}>
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1
                      }}
                    >
                      {prod.name}
                    </Typography>
                    {prod.category && (
                      <Chip
                        label={prod.category}
                        size="small"
                        sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', bgcolor: 'rgba(204,0,0,0.08)', color: '#cc0000', border: 'none', flexShrink: 0 }}
                      />
                    )}
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                    <Box sx={{ width: '100%', height: 6, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 1, overflow: 'hidden', mr: 2 }}>
                      <Box sx={{
                        width: `${(prod.quantity / metrics.top5Products[0].quantity) * 100}%`,
                        height: '100%',
                        bgcolor: '#cc0000',
                        borderRadius: 1
                      }} />
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary', flexShrink: 0 }}>{prod.quantity} ud.</Typography>
                  </Stack>
                </Box>
              ))}
              {metrics.top5Products.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>Sin ventas en el periodo.</Typography>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid rgba(0,0,0,0.05)', height: 380 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <History size={20} color="#cc0000" />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Evolución del Rango</Typography>
                <Typography variant="caption" color="text.secondary">Resumen visual del periodo seleccionado</Typography>
              </Box>
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
                Unidades
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          <Box sx={{ height: 260, width: '100%' }}>
            {metrics.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#cc0000" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#cc0000" stopOpacity={0} />
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
    </Box>
  );
};

export default Dashboard;
