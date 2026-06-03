"use client";

import { useMemo, useState, useEffect, Suspense } from 'react';
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

const ShopContent = () => {
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
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const ITEMS_PER_PAGE = 12;

  // Sincronizar local con búsqueda externa (navbar)
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Debounce para el buscador del catálogo
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== searchQuery) {
        updateSearch(localSearch);
      }
    }, 500);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch]);

  const fetchProducts = async (isNewSearch = true) => {
    if (isNewSearch) {
      setLoading(true);
      setPage(0);
    } else {
      setLoadingMore(true);
    }

    try {
      let query = supabase
        .from('products')
        .select('*, category:categories(name)', { count: 'exact' });

      // Apply Filters
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (category && categories.length > 0) {
        const selectedCat = categories.find(c => c.name.toLowerCase() === category.toLowerCase());
        if (selectedCat) {
          const allowedIds = getRecursiveIds(selectedCat.id, categories);
          query = query.in('category_id', allowedIds);
        }
      } else if (!category && categories.length > 0) {
        const specialCats = categories.filter(c => {
          const lower = c.name.toLowerCase();
          return lower.includes('armada') || lower.includes('outlet');
        });
        
        let forbiddenIds: string[] = [];
        specialCats.forEach(sc => {
           forbiddenIds = [...forbiddenIds, ...getRecursiveIds(sc.id, categories)];
        });

        if (forbiddenIds.length > 0) {
          query = query.not('category_id', 'in', `(${forbiddenIds.join(',')})`);
        }
      }

      if (minPrice > 0) query = query.gte('price', minPrice);
      if (maxPrice < 10000000) query = query.lte('price', maxPrice);

      if (stockFilter === 'in-stock') query = query.gt('stock', 0);
      else if (stockFilter === 'out-of-stock') query = query.eq('stock', 0);

      if (featuredFilter) query = query.eq('featured', true);

      // Sorting
      switch (sortBy) {
        case 'price-low': query = query.order('price', { ascending: true }); break;
        case 'price-high': query = query.order('price', { ascending: false }); break;
        case 'newest': query = query.order('created_at', { ascending: false }); break;
        case 'oldest': query = query.order('created_at', { ascending: true }); break;
      }

      // Pagination
      const start = isNewSearch ? 0 : (page + 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;

      const { data, count, error } = await query.range(start, end);

      if (error) throw error;

      if (isNewSearch) {
        setProducts(data || []);
      } else {
        setProducts(prev => [...prev, ...(data || [])]);
        setPage(prev => prev + 1);
      }

      setHasMore(count ? (isNewSearch ? data.length : products.length + data.length) < count : false);

    } catch (error) {
      console.error("Error fetching shop data:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Fetch categories only once
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await supabase.from('categories').select('*');
        if (data) setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setCategoriesLoaded(true);
      }
    };
    fetchCats();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    if (categoriesLoaded) {
      fetchProducts(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, category, minPrice, maxPrice, sortBy, stockFilter, featuredFilter, categoriesLoaded]);

  // Función para obtener IDs de categorías de forma recursiva (hijos, nietos, etc)
  const getRecursiveIds = (parentId: string, allCats: any[]): string[] => {
    let ids = [parentId];
    const children = allCats.filter(c => c.parent_id === parentId);
    children.forEach(child => {
      ids = [...ids, ...getRecursiveIds(child.id, allCats)];
    });
    return ids;
  };

  // We removed client-side filteredProducts since it's now server-side

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

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (category) count++;
    if (searchQuery) count++;
    if (minPrice > 0 || maxPrice < 10000000) count++;
    if (stockFilter) count++;
    if (featuredFilter) count++;
    return count;
  }, [category, searchQuery, minPrice, maxPrice, stockFilter, featuredFilter]);

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', pb: 10 }}>
      {/* Header / Breadcrumbs */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid rgba(0,0,0,0.05)', py: { xs: 2.5, md: 4 }, mb: { xs: 2.5, md: 4 } }}>
        <Container maxWidth="xl">
          <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link component={NextLink} href="/" color="inherit" underline="hover">Inicio</Link>
            <Link component={NextLink} href="/shop" color="inherit" underline="hover">Tienda</Link>
            {category && <Typography color="text.secondary">{category}</Typography>}
            {searchQuery && <Typography color="primary" sx={{ fontWeight: 700 }}>Búsqueda: {searchQuery}</Typography>}
          </Breadcrumbs>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: 0 }}>
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
            {/* Contenedor Sticky en Mobile */}
            <Box
              sx={{
                position: { xs: 'sticky', md: 'static' },
                top: { xs: '120px', md: 'auto' }, // Posiciona la barra debajo del navbar móvil
                zIndex: 1000,
                bgcolor: '#f8f9fa',
                pt: { xs: 1.5, md: 0 },
                pb: { xs: 1, md: 0 },
                mx: { xs: -2, md: 0 },
                px: 0, // Sin padding horizontal en el contenedor sticky para scroll edge-to-edge
                mb: { xs: 2, md: 0 }
              }}
            >
              {/* Toolbar */}
              <Paper
                elevation={0}
                sx={{
                  mx: { xs: 2, md: 0 }, // Margen horizontal en mobile para mantenerlo centrado
                  p: { xs: 1.5, md: 2 },
                  mb: { xs: 1.5, md: 3 },
                  display: 'flex',
                  borderRadius: 3,
                  border: '1px solid rgba(0,0,0,0.05)',
                  bgcolor: 'white',

                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: { xs: 'flex-start', md: 'center' },
                  justifyContent: { xs: 'flex-start', md: 'space-between' },
                  gap: { xs: 1, md: 0 }
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'stretch', md: 'center' }, width: { xs: '100%', md: 'auto' }, gap: { xs: 1, md: 2 } }}>
                  <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 500, mr: 3 }}>
                    Mostrando <strong style={{ color: '#000' }}>{products.length}</strong> productos
                  </Typography>

                  <TextField
                    size="small"
                    placeholder="Buscar en el catálogo..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && updateSearch(localSearch)}
                    InputProps={{
                      sx: { borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)', fontSize: '0.85rem', width: { xs: '100%', md: 250 } },
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

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'flex-start', md: 'space-between' } }}>
                  <Button
                    startIcon={<Filter size={16} />}
                    sx={{ display: { xs: 'flex', md: 'none' }, borderRadius: 2, fontWeight: 700, width: { xs: '45%', md: 'auto' } }}
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

                  <FormControl size="small"
                    sx={{
                      minWidth: { md: 200 },
                      width: { xs: '50%', md: 'auto' }
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
              {(searchQuery || category || minPrice > 0 || maxPrice < 10000000 || stockFilter || featuredFilter || searchParams?.get('sort')) && (
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    overflowX: 'auto',
                    pt: { xs: 0.5, md: 0 },
                    pb: { xs: 1, md: 0 },
                    px: { xs: 2, md: 0 }, // Padding horizontal para alinear los chips pero permitir scroll edge-to-edge
                    mb: { xs: 1.5, md: 3 },
                    '&::-webkit-scrollbar': { display: 'none' },
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none',
                    flexWrap: { xs: 'nowrap', md: 'wrap' }
                  }}
                >
                  {category && (
                    <Chip
                      label={`Categoría: ${category}`}
                      onDelete={() => removeFilter('category')}
                      sx={{ fontWeight: 600, borderRadius: 2, bgcolor: 'rgba(204,0,0,0.08)', color: 'primary.main', border: '1px solid rgba(204,0,0,0.2)', flexShrink: 0 }}
                    />
                  )}
                  {searchQuery && (
                    <Chip
                      label={`Búsqueda: "${searchQuery}"`}
                      onDelete={() => removeFilter('q')}
                      sx={{ fontWeight: 600, borderRadius: 2, bgcolor: 'rgba(204,0,0,0.08)', color: 'primary.main', border: '1px solid rgba(204,0,0,0.2)', flexShrink: 0 }}
                    />
                  )}
                  {(minPrice > 0 || maxPrice < 10000000) && (
                    <Chip
                      label={`Precio: $${minPrice.toLocaleString('es-ES')} - $${maxPrice.toLocaleString('es-ES')}`}
                      onDelete={() => removeFilter('price')}
                      sx={{ fontWeight: 600, borderRadius: 2, bgcolor: 'rgba(204,0,0,0.08)', color: 'primary.main', border: '1px solid rgba(204,0,0,0.2)', flexShrink: 0 }}
                    />
                  )}
                  {stockFilter === 'in-stock' && (
                    <Chip
                      label="En Stock"
                      onDelete={() => removeFilter('stock')}
                      sx={{ fontWeight: 600, borderRadius: 2, bgcolor: 'rgba(204,0,0,0.08)', color: 'primary.main', border: '1px solid rgba(204,0,0,0.2)', flexShrink: 0 }}
                    />
                  )}
                  {stockFilter === 'out-of-stock' && (
                    <Chip
                      label="Sin Stock"
                      onDelete={() => removeFilter('stock')}
                      sx={{ fontWeight: 600, borderRadius: 2, bgcolor: 'rgba(204,0,0,0.08)', color: 'primary.main', border: '1px solid rgba(204,0,0,0.2)', flexShrink: 0 }}
                    />
                  )}
                  {featuredFilter && (
                    <Chip
                      label="Destacados"
                      onDelete={() => removeFilter('featured')}
                      sx={{ fontWeight: 600, borderRadius: 2, bgcolor: 'rgba(204,0,0,0.08)', color: 'primary.main', border: '1px solid rgba(204,0,0,0.2)', flexShrink: 0 }}
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
                      sx={{ fontWeight: 600, borderRadius: 2, bgcolor: 'rgba(204,0,0,0.08)', color: 'primary.main', border: '1px solid rgba(204,0,0,0.2)', flexShrink: 0 }}
                    />
                  )}
                  {activeFiltersCount > 1 && (
                    <Chip
                      label="Limpiar filtros"
                      onClick={() => {
                        const newParams = new URLSearchParams();
                        const currentSort = searchParams?.get('sort');
                        if (currentSort) {
                          newParams.set('sort', currentSort);
                        }
                        setLocalSearch('');
                        router.push(`${pathname}?${newParams.toString()}`);
                      }}
                      sx={{
                        fontWeight: 700,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        color: 'white',
                        border: '1px solid',
                        borderColor: 'primary.main',
                        flexShrink: 0,
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        }
                      }}
                    />
                  )}
                </Box>
              )}
            </Box>

            {/* Grid */}
            {loading ? (
              <Box sx={{ py: 10, textAlign: 'center' }}>
                <CircularProgress color="primary" thickness={5} />
                <Typography sx={{ mt: 2, fontWeight: 500 }} color="text.secondary">Cargando productos...</Typography>
              </Box>
            ) : products.length > 0 ? (
              <>
                <Grid container spacing={{ xs: 1.5, sm: 3 }}>
                  {products.map((product) => (
                    <Grid key={product.id} size={viewMode === 'grid' ? { xs: 6, sm: 6, md: 4, lg: 3 } : { xs: 12 }}>
                      <ProductCard product={product} layout={viewMode} />
                    </Grid>
                  ))}
                </Grid>

                {hasMore && (
                  <Box sx={{ mt: 6, textAlign: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={() => fetchProducts(false)}
                      disabled={loadingMore}
                      sx={{ borderRadius: 2, px: 6, py: 1.5, fontWeight: 800 }}
                    >
                      {loadingMore ? <CircularProgress size={24} /> : 'Cargar más productos'}
                    </Button>
                  </Box>
                )}
              </>
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
        <CategorySidebar onFilterChange={() => setMobileFiltersOpen(false)} />
      </Drawer>
    </Box>
  );
};

export default function ShopPage() {
  return (
    <Suspense fallback={
      <Box sx={{ py: 20, textAlign: 'center' }}>
        <CircularProgress color="primary" thickness={5} />
        <Typography sx={{ mt: 2, fontWeight: 500 }} color="text.secondary">Cargando tienda...</Typography>
      </Box>
    }>
      <ShopContent />
    </Suspense>
  );
}

