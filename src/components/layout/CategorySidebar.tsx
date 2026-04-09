"use client";

import React, { useEffect } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText,
  Paper,
  Divider,
  Slider
} from '@mui/material';
import { 
  ChevronRight,
  Layers,
  Package
} from 'lucide-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { supabase } from '../../lib/supabase';

const CategorySidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentCategory = searchParams?.get('category') || '';
  
  // Get price range from URL or default
  const minPrice = Number(searchParams?.get('minPrice')) || 0;
  const maxPrice = Number(searchParams?.get('maxPrice')) || 3000;
  
  const [priceRange, setPriceRange] = React.useState<number[]>([minPrice, maxPrice]);
  const [dynamicCategories, setDynamicCategories] = React.useState<any[]>([]);

  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (!error && data) {
        const formatted = [
          { name: 'Todas', value: '' },
          ...data.map((c: any) => ({
            name: c.name,
            value: c.name
          }))
        ];
        setDynamicCategories(formatted);
      }
    };

    fetchCategories();
  }, []);

  const currentStock = searchParams?.get('stock') || '';

  const handleCategoryClick = (value: string) => {
    const newParams = new URLSearchParams(searchParams?.toString() || '');
    if (value === '') {
      newParams.delete('category');
    } else {
      newParams.set('category', value);
    }
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const handleStockClick = (value: string) => {
    const newParams = new URLSearchParams(searchParams?.toString() || '');
    if (currentStock === value) {
      newParams.delete('stock');
    } else {
      newParams.set('stock', value);
    }
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const handlePriceChange = (_event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
  };

  const handlePriceChangeCommitted = (_event: React.SyntheticEvent | Event, newValue: number | number[]) => {
    const newParams = new URLSearchParams(searchParams?.toString() || '');
    const [min, max] = newValue as number[];
    newParams.set('minPrice', min.toString());
    newParams.set('maxPrice', max.toString());
    router.push(`${pathname}?${newParams.toString()}`);
  };

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.05)' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, px: 1 }}>Categorías</Typography>
      <List disablePadding>
        {dynamicCategories.map((cat) => (
          <ListItem key={cat.name} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={currentCategory === cat.value}
              onClick={() => handleCategoryClick(cat.value)}
              sx={{
                borderRadius: 1,
                '&.Mui-selected': {
                  bgcolor: 'rgba(204, 0, 0, 0.08)',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'rgba(204, 0, 0, 0.12)' }
                }
              }}
            >
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
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton 
            selected={currentStock === 'in-stock'}
            onClick={() => handleStockClick('in-stock')}
            sx={{ 
              borderRadius: 1,
              '&.Mui-selected': {
                bgcolor: 'rgba(204, 0, 0, 0.08)',
                color: 'primary.main',
                '&:hover': { bgcolor: 'rgba(204, 0, 0, 0.12)' }
              }
            }}
          >
            <ListItemText primary="En Stock" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: currentStock === 'in-stock' ? 700 : 500 }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton 
            selected={currentStock === 'out-of-stock'}
            onClick={() => handleStockClick('out-of-stock')}
            sx={{ 
              borderRadius: 1,
              '&.Mui-selected': {
                bgcolor: 'rgba(204, 0, 0, 0.08)',
                color: 'primary.main',
                '&:hover': { bgcolor: 'rgba(204, 0, 0, 0.12)' }
              }
            }}
          >
            <ListItemText primary="Sin Stock / Próximamente" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: currentStock === 'out-of-stock' ? 700 : 500 }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Paper>
  );
};

export default CategorySidebar;
