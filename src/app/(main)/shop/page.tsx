"use client";

import { useMemo, useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  FormControl, 
  Select, 
  MenuItem, 
  InputLabel,
  Breadcrumbs,
  Link,
  IconButton,
  Paper,
  Button,
  CircularProgress,
  Drawer
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { LayoutGrid, List as ListIcon, Filter } from 'lucide-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import NextLink from 'next/link';

import { supabase } from '../../../lib/supabase';
import CategorySidebar from '../../../components/layout/CategorySidebar';
import ProductCard from '../../../components/product/ProductCard';

const ShopPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const category = searchParams?.get('category') || '';
  const minPrice = Number(searchParams?.get('minPrice')) || 0;
  const maxPrice = Number(searchParams?.get('maxPrice')) || 3000;
  const sortBy = searchParams?.get('sort') || 'newest';

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(name)');
      
      if (!error) {
        setProducts(data || []);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category Filter
    if (category) {
      result = result.filter(p => p.category?.name === category);
    }

    // Price Filter
    result = result.filter(p => p.price >= minPrice && p.price <= maxPrice);

    // Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      default:
        break;
    }

    return result;
  }, [products, category, minPrice, maxPrice, sortBy]);

  const handleSortChange = (event: SelectChangeEvent) => {
    const newParams = new URLSearchParams(searchParams?.toString() || '');
    newParams.set('sort', event.target.value);
    router.push(`${pathname}?${newParams.toString()}`);
  };

  return (
    <Box sx={{ bgcolor: '#f4f4f4', minHeight: '100vh', pb: 10 }}>
      {/* Header / Breadcrumbs */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid rgba(0,0,0,0.05)', py: 4, mb: 4 }}>
        <Container maxWidth="xl">
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link component={NextLink} href="/" color="inherit" underline="hover">Inicio</Link>
            <Typography color="text.primary">Tienda</Typography>
          </Breadcrumbs>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>
            {category || 'Todos los Productos'}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Sidebar */}
          <Grid size={{ xs: 12, md: 3, lg: 2.5 }} sx={{ display: { xs: 'none', md: 'block' } }}>
            <CategorySidebar />
          </Grid>

          {/* Product Grid */}
          <Grid size={{ xs: 12, md: 9, lg: 9.5 }}>
            {/* Toolbar */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                mb: 3, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderRadius: 2,
                border: '1px solid rgba(0,0,0,0.05)'
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Mostrando <strong>{filteredProducts.length}</strong> productos
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', sm: 'auto' }, justifyContent: 'space-between' }}>
                <Button 
                  startIcon={<Filter size={16} />} 
                  sx={{ display: { xs: 'flex', md: 'none' } }}
                  onClick={() => setMobileFiltersOpen(true)}
                  variant="outlined"
                  size="small"
                >
                  Filtros
                </Button>

                <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, mr: 2 }}>
                  <IconButton 
                    size="small" 
                    color={viewMode === 'grid' ? 'primary' : 'default'}
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid size={20} />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color={viewMode === 'list' ? 'primary' : 'default'}
                    onClick={() => setViewMode('list')}
                  >
                    <ListIcon size={20} />
                  </IconButton>
                </Box>
                
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel id="sort-label">Ordenar por</InputLabel>
                  <Select
                    labelId="sort-label"
                    value={sortBy}
                    label="Ordenar por"
                    onChange={handleSortChange}
                  >
                    <MenuItem value="newest">Lo más nuevo</MenuItem>
                    <MenuItem value="price-low">Precio: Menor a Mayor</MenuItem>
                    <MenuItem value="price-high">Precio: Mayor a Menor</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Paper>

            {/* Grid */}
            {loading ? (
              <Box sx={{ py: 10, textAlign: 'center' }}>
                <CircularProgress color="primary" />
                <Typography sx={{ mt: 2 }} color="text.secondary">Cargando productos...</Typography>
              </Box>
            ) : filteredProducts.length > 0 ? (
              <Grid container spacing={3}>
                {filteredProducts.map((product) => (
                  <Grid key={product.id} size={viewMode === 'grid' ? { xs: 12, sm: 6, lg: 4 } : { xs: 12 }}>
                    <ProductCard product={product} layout={viewMode} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ py: 10, textAlign: 'center' }}>
                <Typography variant="h5" color="text.secondary">No se encontraron productos con estos filtros.</Typography>
                <Button 
                  onClick={() => router.push(pathname || '/')} 
                  sx={{ mt: 2 }}
                >
                  Limpiar Filtros
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Mobile Filters Drawer */}
      <Drawer
        anchor="left"
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        PaperProps={{ sx: { width: 280, p: 2, bgcolor: '#f4f4f4' } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={800}>Filtros</Typography>
          <Button size="small" onClick={() => setMobileFiltersOpen(false)} color="inherit">Cerrar</Button>
        </Box>
        <CategorySidebar />
      </Drawer>
    </Box>
  );
};

export default ShopPage;
