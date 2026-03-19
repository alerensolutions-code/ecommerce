import React, { useEffect } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Paper,
  Divider,
  Slider
} from '@mui/material';
import { 
  Monitor, 
  Cpu, 
  Gamepad, 
  Keyboard, 
  Mouse, 
  Layers,
  ChevronRight
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const categories = [
  { name: 'Todas', icon: <Layers size={20} />, value: '' },
  { name: 'Monitores', icon: <Monitor size={20} />, value: 'Monitores' },
  { name: 'Tarjetas Gráficas', icon: <Cpu size={20} />, value: 'Tarjetas Gráficas' },
  { name: 'Procesadores', icon: <Cpu size={20} />, value: 'Procesadores' },
  { name: 'Periféricos', icon: <Keyboard size={20} />, value: 'Periféricos' },
  { name: 'Consolas', icon: <Gamepad size={20} />, value: 'Consolas' },
  { name: 'Accesorios', icon: <Mouse size={20} />, value: 'Accesorios' },
];

const CategorySidebar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || '';
  
  // Get price range from URL or default
  const minPrice = Number(searchParams.get('minPrice')) || 0;
  const maxPrice = Number(searchParams.get('maxPrice')) || 3000;
  
  const [priceRange, setPriceRange] = React.useState<number[]>([minPrice, maxPrice]);

  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);

  const handleCategoryClick = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === '') {
      newParams.delete('category');
    } else {
      newParams.set('category', value);
    }
    setSearchParams(newParams);
  };

  const handlePriceChange = (_event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
  };

  const handlePriceChangeCommitted = (_event: React.SyntheticEvent | Event, newValue: number | number[]) => {
    const newParams = new URLSearchParams(searchParams);
    const [min, max] = newValue as number[];
    newParams.set('minPrice', min.toString());
    newParams.set('maxPrice', max.toString());
    setSearchParams(newParams);
  };

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.05)' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, px: 1 }}>Categorías</Typography>
      <List disablePadding>
        {categories.map((cat) => (
          <ListItem key={cat.name} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={currentCategory === cat.value}
              onClick={() => handleCategoryClick(cat.value)}
              sx={{
                borderRadius: 1,
                '&.Mui-selected': {
                  bgcolor: 'rgba(204, 0, 0, 0.08)',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'rgba(204, 0, 0, 0.12)' },
                  '& .MuiListItemIcon-root': { color: 'primary.main' }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                {cat.icon}
              </ListItemIcon>
              <ListItemText 
                primary={cat.name} 
                primaryTypographyProps={{ fontWeight: 500, fontSize: '0.9rem' }} 
              />
              <ChevronRight size={14} opacity={0.5} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 4, px: 1 }}>Filtro de Precio</Typography>
      <Box sx={{ px: 2 }}>
        <Slider
          value={priceRange}
          onChange={handlePriceChange}
          onChangeCommitted={handlePriceChangeCommitted}
          valueLabelDisplay="auto"
          min={0}
          max={3000}
          step={50}
          color="primary"
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">${priceRange[0]}</Typography>
          <Typography variant="caption" color="text.secondary">${priceRange[1]}</Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, px: 1 }}>Disponibilidad</Typography>
      <List disablePadding>
        <ListItem disablePadding>
          <ListItemButton sx={{ borderRadius: 1 }}>
            <ListItemText primary="En Stock" primaryTypographyProps={{ fontSize: '0.9rem' }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton sx={{ borderRadius: 1 }}>
            <ListItemText primary="Próximamente" primaryTypographyProps={{ fontSize: '0.9rem' }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Paper>
  );
};

export default CategorySidebar;
