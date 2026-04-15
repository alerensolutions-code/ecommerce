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
  Drawer,
  TextField,
  InputAdornment,
  Chip
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { LayoutGrid, List as ListIcon, Filter, Search, X } from 'lucide-react';
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
  const maxPrice = Number(searchParams?.get('maxPrice')) || 10000000;
  const sortBy = searchParams?.get('sort') || 'newest';
  const stockFilter = searchParams?.get('stock') || '';
  const searchQuery = searchParams?.get('q') || '';
  const featuredFilter = searchParams?.get('featured') === 'true';

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Sincronizar local con búsqueda externa (navbar)
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const { data: allProducts, error: pError } = await supabase
        .from('products')
        .select('*, category:categories(name)');

      const { data: allCategories, error: cError } = await supabase
        .from('categories')
        .select('*');

      if (allProducts) setProducts(allProducts);
      if (allCategories) setCategories(allCategories);
    } catch (error) {
      console.error("Error fetching shop data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Función para obtener IDs de categorías de forma recursiva (hijos, nietos, etc)
  const getRecursiveIds = (parentId: string, allCats: any[]): string[] => {
    let ids = [parentId];
    const children = allCats.filter(c => c.parent_id === parentId);
    children.forEach(child => {
      ids = [...ids, ...getRecursiveIds(child.id, allCats)];
    });
    return ids;
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Category Filter (Soporte Jerárquico Completo)
    if (category) {
      const selectedCat = categories.find(c =>
        c.name.toLowerCase() === category.toLowerCase()
      );

      if (selectedCat) {
        const allowedIds = getRecursiveIds(selectedCat.id, categories);
        result = result.filter(p => allowedIds.includes(p.category_id));
      } else {
        // Fallback por si el nombre no coincide exactamente (case sensitive o tildes)
        result = result.filter(p =>
          p.category?.name?.toLowerCase().includes(category.toLowerCase())
        );
      }
    }

    // Price Filter
    result = result.filter(p => p.price >= minPrice && p.price <= maxPrice);

    // Stock Filter
    if (stockFilter === 'in-stock') {
      result = result.filter(p => (p.stock || 0) > 0);
    } else if (stockFilter === 'out-of-stock') {
      result = result.filter(p => (p.stock || 0) === 0);
    }

    // Featured Filter
    if (featuredFilter) {
      result = result.filter(p => p.featured === true);
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => (a.price - b.price) || (a.name || '').localeCompare(b.name || ''));
        break;
      case 'price-high':
        result.sort((a, b) => (b.price - a.price) || (a.name || '').localeCompare(b.name || ''));
        break;
      case 'newest':
        result.sort((a, b) => (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || (a.name || '').localeCompare(b.name || ''));
        break;
      case 'oldest':
        result.sort((a, b) => (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) || (a.name || '').localeCompare(b.name || ''));
        break;
      default:
        break;
    }

    return result;
  }, [products, category, minPrice, maxPrice, sortBy, stockFilter, categories, searchQuery, featuredFilter]);

  const handleSortChange = (event: SelectChangeEvent) => {
    const newParams = new URLSearchParams(searchParams?.toString() || '');
    newParams.set('sort', event.target.value);
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const updateSearch = (term: string) => {
    const newParams = new URLSearchParams(searchParams?.toString() || '');
    if (term) {
      newParams.set('q', term);
    } else {
      newParams.delete('q');
    }
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const removeFilter = (key: string) => {
    const newParams = new URLSearchParams(searchParams?.toString() || '');
    if (key === 'price') {
      newParams.delete('minPrice');
      newParams.delete('maxPrice');
    } else if (key === 'q') {
      setLocalSearch('');
      newParams.delete('q');
    } else {
      newParams.delete(key);
    }
    router.push(`${pathname}?${newParams.toString()}`);
  };

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', pb: 10 }}>
      {/* Header / Breadcrumbs */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid rgba(0,0,0,0.05)', py: 4, mb: 4 }}>
        <Container maxWidth="xl">
          <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link component={NextLink} href="/" color="inherit" underline="hover">Inicio</Link>
            <Link component={NextLink} href="/shop" color="inherit" underline="hover">Tienda</Link>
            {category && <Typography color="text.secondary">{category}</Typography>}
            {searchQuery && <Typography color="primary" sx={{ fontWeight: 700 }}>Búsqueda: {searchQuery}</Typography>}
          </Breadcrumbs>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -1 }}>
            {searchQuery ? `Resultados para: "${searchQuery}"` : (category || 'Todos los Productos')}
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
                borderRadius: 3,
                border: '1px solid rgba(0,0,0,0.05)',
                bgcolor: 'white',

                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'flex-start', md: 'center' },
                justifyContent: { xs: 'flex-start', md: 'space-between' },
                gap: { xs: 2, md: 0 }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 500, mr: 3 }}>
                  Mostrando <strong style={{ color: '#000' }}>{filteredProducts.length}</strong> productos
                </Typography>

                <TextField
                  size="small"
                  placeholder="Buscar en el catálogo..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && updateSearch(localSearch)}
                  InputProps={{
                    sx: { borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)', fontSize: '0.85rem', width: { xs: '100%', sm: 250 } },
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search size={16} />
                      </InputAdornment>
                    ),
                    endAdornment: localSearch ? (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => { setLocalSearch(''); updateSearch(''); }}>
                          <X size={14} />
                        </IconButton>
                      </InputAdornment>
                    ) : null
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', sm: 'auto' }, justifyContent: 'space-between' }}>
                <Button
                  startIcon={<Filter size={16} />}
                  sx={{ display: { xs: 'flex', md: 'none' }, borderRadius: 2, fontWeight: 700 }}
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
                    sx={{ bgcolor: viewMode === 'grid' ? 'rgba(204,0,0,0.05)' : 'transparent' }}
                  >
                    <LayoutGrid size={20} />
                  </IconButton>
                  <IconButton
                    size="small"
                    color={viewMode === 'list' ? 'primary' : 'default'}
                    onClick={() => setViewMode('list')}
                    sx={{ bgcolor: viewMode === 'list' ? 'rgba(204,0,0,0.05)' : 'transparent' }}
                  >
                    <ListIcon size={20} />
                  </IconButton>
                </Box>

                <FormControl size="small" fullWidth
                  sx={{
                    minWidth: { md: 200 }
                  }}>
                  <InputLabel id="sort-label">Ordenar por</InputLabel>
                  <Select
                    labelId="sort-label"
                    value={sortBy}
                    label="Ordenar por"
                    onChange={handleSortChange}
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                  >
                    <MenuItem value="newest">Lo más nuevo</MenuItem>
                    <MenuItem value="oldest">Lo más viejo</MenuItem>
                    <MenuItem value="price-low">Precio: Menor a Mayor</MenuItem>
                    <MenuItem value="price-high">Precio: Mayor a Menor</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Paper>

            {/* Active Filters */}
            {(searchQuery || minPrice > 0 || maxPrice < 10000000 || stockFilter || featuredFilter || searchParams?.get('sort')) && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {searchQuery && (
                  <Chip
                    label={`Búsqueda: "${searchQuery}"`}
                    onDelete={() => removeFilter('q')}
                    sx={{ fontWeight: 600, borderRadius: 2, bgcolor: 'rgba(204,0,0,0.08)', color: 'primary.main', border: '1px solid rgba(204,0,0,0.2)' }}
                  />
                )}
                {(minPrice > 0 || maxPrice < 10000000) && (
                  <Chip
                    label={`Precio: $${minPrice.toLocaleString('es-ES')} - $${maxPrice.toLocaleString('es-ES')}`}
                    onDelete={() => removeFilter('price')}
                    sx={{ fontWeight: 600, borderRadius: 2, bgcolor: 'rgba(204,0,0,0.08)', color: 'primary.main', border: '1px solid rgba(204,0,0,0.2)' }}
                  />
                )}
                {stockFilter === 'in-stock' && (
                  <Chip
                    label="En Stock"
                    onDelete={() => removeFilter('stock')}
                    sx={{ fontWeight: 600, borderRadius: 2, bgcolor: 'rgba(204,0,0,0.08)', color: 'primary.main', border: '1px solid rgba(204,0,0,0.2)' }}
                  />
                )}
                {stockFilter === 'out-of-stock' && (
                  <Chip
                    label="Sin Stock"
                    onDelete={() => removeFilter('stock')}
                    sx={{ fontWeight: 600, borderRadius: 2, bgcolor: 'rgba(204,0,0,0.08)', color: 'primary.main', border: '1px solid rgba(204,0,0,0.2)' }}
                  />
                )}
                {featuredFilter && (
                  <Chip
                    label="Destacados"
                    onDelete={() => removeFilter('featured')}
                    sx={{ fontWeight: 600, borderRadius: 2, bgcolor: 'rgba(204,0,0,0.08)', color: 'primary.main', border: '1px solid rgba(204,0,0,0.2)' }}
                  />
                )}
                {searchParams?.get('sort') && (
                  <Chip
                    label={
                      searchParams.get('sort') === 'price-low' ? 'Menor precio' :
                        searchParams.get('sort') === 'price-high' ? 'Mayor precio' :
                          searchParams.get('sort') === 'newest' ? 'Lo más nuevo' :
                            searchParams.get('sort') === 'oldest' ? 'Lo más antiguo' : 'Ordenamiento'
                    }
                    onDelete={() => removeFilter('sort')}
                    sx={{ fontWeight: 600, borderRadius: 2, bgcolor: 'rgba(204,0,0,0.08)', color: 'primary.main', border: '1px solid rgba(204,0,0,0.2)' }}
                  />
                )}
              </Box>
            )}

            {/* Grid */}
            {loading ? (
              <Box sx={{ py: 10, textAlign: 'center' }}>
                <CircularProgress color="primary" thickness={5} />
                <Typography sx={{ mt: 2, fontWeight: 500 }} color="text.secondary">Cargando productos...</Typography>
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
              <Paper elevation={0} sx={{ py: 10, textAlign: 'center', borderRadius: 4, border: '1px solid rgba(0,0,0,0.05)' }}>
                <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 700 }}>
                  {searchQuery ? `No encontramos resultados para "${searchQuery}"` : "No se encontraron productos."}
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>Intentá con otros filtros o categorías.</Typography>
                <Button
                  variant="contained"
                  onClick={() => router.push(pathname || '/')}
                  sx={{ borderRadius: 2, px: 4, fontWeight: 800 }}
                >
                  Limpiar Filtros
                </Button>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Mobile Filters Drawer */}
      <Drawer
        anchor="left"
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        PaperProps={{ sx: { width: 300, p: 3, bgcolor: '#f8f9fa' } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight={900}>Filtros</Typography>
          <IconButton onClick={() => setMobileFiltersOpen(false)} size="small">
            <Filter size={20} />
          </IconButton>
        </Box>
        <CategorySidebar />
      </Drawer>
    </Box>
  );
};

export default ShopPage;
