import { useMemo } from 'react';
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
  Button
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { LayoutGrid, List as ListIcon } from 'lucide-react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { products } from '../data/mockData';
import CategorySidebar from '../components/layout/CategorySidebar';
import ProductCard from '../components/product/ProductCard';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const category = searchParams.get('category') || '';
  const minPrice = Number(searchParams.get('minPrice')) || 0;
  const maxPrice = Number(searchParams.get('maxPrice')) || 3000;
  const sortBy = searchParams.get('sort') || 'newest';

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category Filter
    if (category) {
      result = result.filter(p => p.category === category);
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
        // Mocking newest by id descending
        result.sort((a, b) => b.id.localeCompare(a.id));
        break;
      default:
        break;
    }

    return result;
  }, [category, minPrice, maxPrice, sortBy]);

  const handleSortChange = (event: SelectChangeEvent) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', event.target.value);
    setSearchParams(newParams);
  };

  return (
    <Box sx={{ bgcolor: '#f4f4f4', minHeight: '100vh', pb: 10 }}>
      {/* Header / Breadcrumbs */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid rgba(0,0,0,0.05)', py: 4, mb: 4 }}>
        <Container maxWidth="xl">
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link component={RouterLink} to="/" color="inherit" underline="hover">Inicio</Link>
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
          <Grid size={{ xs: 12, md: 3, lg: 2.5 }}>
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
              <Typography variant="body2" color="text.secondary">
                Mostrando <strong>{filteredProducts.length}</strong> productos
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, mr: 2 }}>
                  <IconButton size="small" color="primary"><LayoutGrid size={20} /></IconButton>
                  <IconButton size="small"><ListIcon size={20} /></IconButton>
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
            {filteredProducts.length > 0 ? (
              <Grid container spacing={3}>
                {filteredProducts.map((product) => (
                  <Grid key={product.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ py: 10, textAlign: 'center' }}>
                <Typography variant="h5" color="text.secondary">No se encontraron productos con estos filtros.</Typography>
                <Button 
                  onClick={() => setSearchParams({})} 
                  sx={{ mt: 2 }}
                >
                  Limpiar Filtros
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ShopPage;
