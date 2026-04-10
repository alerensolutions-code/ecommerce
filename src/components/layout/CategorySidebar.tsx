"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText,
  Paper,
  Divider,
  Slider,
  Collapse,
  Stack
} from '@mui/material';
import { 
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { supabase } from '../../lib/supabase';

const CategorySidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentCategory = searchParams?.get('category') || '';
  
  const minPrice = Number(searchParams?.get('minPrice')) || 0;
  const maxPrice = Number(searchParams?.get('maxPrice')) || 10000;
  
  const [priceRange, setPriceRange] = React.useState<number[]>([minPrice, maxPrice]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [activeParent, setActiveParent] = useState<string | null>(null);

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
        setCategories(data);
        
        // Auto-expand parent if a subcategory is selected
        const current = data.find(c => c.name.toLowerCase() === currentCategory.toLowerCase());
        if (current?.parent_id) {
          setActiveParent(current.parent_id);
        } else if (current) {
          setActiveParent(current.id);
        }
      }
    };

    fetchCategories();
  }, [currentCategory]);

  const hierarchy = useMemo(() => {
    const roots = categories.filter(c => !c.parent_id);
    const childrenMap: Record<string, any[]> = {};
    
    categories.forEach(c => {
      if (c.parent_id) {
        if (!childrenMap[c.parent_id]) childrenMap[c.parent_id] = [];
        childrenMap[c.parent_id].push(c);
      }
    });

    return { roots, childrenMap };
  }, [categories]);

  const handleCategoryClick = (value: string, id?: string) => {
    const newParams = new URLSearchParams(searchParams?.toString() || '');
    if (value === '') {
      newParams.delete('category');
      setActiveParent(null);
    } else {
      newParams.set('category', value);
      if (id && !categories.find(c => c.id === id)?.parent_id) {
        setActiveParent(activeParent === id ? null : id);
      }
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

  const currentStock = searchParams?.get('stock') || '';
  const handleStockClick = (value: string) => {
    const newParams = new URLSearchParams(searchParams?.toString() || '');
    if (currentStock === value) {
      newParams.delete('stock');
    } else {
      newParams.set('stock', value);
    }
    router.push(`${pathname}?${newParams.toString()}`);
  };

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', bgcolor: 'white' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, px: 1, letterSpacing: -0.5 }}>
        CATEGORÍAS
      </Typography>
      
      <List disablePadding>
        {/* All categories option */}
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            selected={currentCategory === ''}
            onClick={() => handleCategoryClick('')}
            sx={{
              borderRadius: 2,
              '&.Mui-selected': {
                bgcolor: 'rgba(204, 0, 0, 0.08)',
                color: 'primary.main',
                '&:hover': { bgcolor: 'rgba(204, 0, 0, 0.12)' }
              }
            }}
          >
            <ListItemText 
              primary="Todos los Productos" 
              primaryTypographyProps={{ fontWeight: 600, fontSize: '0.85rem' }} 
            />
          </ListItemButton>
        </ListItem>

        {hierarchy.roots.map((root) => {
          const hasChildren = (hierarchy.childrenMap[root.id] || []).length > 0;
          const isSelected = currentCategory.toLowerCase() === root.name.toLowerCase();
          const isOpen = activeParent === root.id;

          return (
            <React.Fragment key={root.id}>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => handleCategoryClick(root.name, root.id)}
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    '&.Mui-selected': {
                      bgcolor: 'rgba(204, 0, 0, 0.08)',
                      color: 'primary.main',
                      fontWeight: 700,
                      '&:hover': { bgcolor: 'rgba(204, 0, 0, 0.12)' }
                    }
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%' }}>
                    <ListItemText 
                      primary={root.name} 
                      primaryTypographyProps={{ 
                        fontWeight: isSelected ? 800 : 700, 
                        fontSize: '0.85rem' 
                      }} 
                    />
                    {hasChildren && (
                      <Box sx={{ opacity: 0.5 }}>
                        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </Box>
                    )}
                  </Stack>
                </ListItemButton>
              </ListItem>

              {hasChildren && (
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <List disablePadding sx={{ pl: 2, mb: 1 }}>
                    {hierarchy.childrenMap[root.id].map((sub) => {
                      const isSubSelected = currentCategory.toLowerCase() === sub.name.toLowerCase();
                      return (
                        <ListItem key={sub.id} disablePadding sx={{ mb: 0.2 }}>
                          <ListItemButton
                            selected={isSubSelected}
                            onClick={() => handleCategoryClick(sub.name)}
                            sx={{
                              borderRadius: 1.5,
                              py: 0.5,
                              '&.Mui-selected': {
                                bgcolor: 'transparent',
                                color: 'primary.main',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }
                              }
                            }}
                          >
                            <ListItemText 
                              primary={sub.name} 
                              primaryTypographyProps={{ 
                                fontWeight: isSubSelected ? 700 : 600, 
                                fontSize: '0.8rem',
                                color: isSubSelected ? 'primary.main' : 'text.secondary'
                              }} 
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          );
        })}
      </List>

      <Divider sx={{ my: 3, opacity: 0.5 }} />

      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 4, px: 1, letterSpacing: -0.5 }}>
        PRECIO
      </Typography>
      <Box sx={{ px: 2 }}>
        <Slider
          value={priceRange}
          onChange={handlePriceChange}
          onChangeCommitted={handlePriceChangeCommitted}
          valueLabelDisplay="auto"
          min={0}
          max={10000}
          step={100}
          color="primary"
          sx={{ 
            mb: 2,
            '& .MuiSlider-thumb': {
              width: 18,
              height: 18,
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>${priceRange[0]}</Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>${priceRange[1]}+</Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 3, opacity: 0.5 }} />

      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, px: 1, letterSpacing: -0.5 }}>
        DISPONIBILIDAD
      </Typography>
      <List disablePadding>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton 
            selected={currentStock === 'in-stock'}
            onClick={() => handleStockClick('in-stock')}
            sx={{ 
              borderRadius: 2,
              '&.Mui-selected': {
                bgcolor: 'rgba(204, 0, 0, 0.08)',
                color: 'primary.main',
                '&:hover': { bgcolor: 'rgba(204, 0, 0, 0.12)' }
              }
            }}
          >
            <ListItemText 
              primary="En Stock" 
              primaryTypographyProps={{ 
                fontSize: '0.85rem', 
                fontWeight: currentStock === 'in-stock' ? 700 : 600,
                color: currentStock === 'in-stock' ? 'primary.main' : 'inherit'
              }} 
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton 
            selected={currentStock === 'out-of-stock'}
            onClick={() => handleStockClick('out-of-stock')}
            sx={{ 
              borderRadius: 2,
              '&.Mui-selected': {
                bgcolor: 'rgba(204, 0, 0, 0.08)',
                color: 'primary.main',
                '&:hover': { bgcolor: 'rgba(204, 0, 0, 0.12)' }
              }
            }}
          >
            <ListItemText 
              primary="Sin Stock" 
              primaryTypographyProps={{ 
                fontSize: '0.85rem', 
                fontWeight: currentStock === 'out-of-stock' ? 700 : 600,
                color: currentStock === 'out-of-stock' ? 'primary.main' : 'inherit'
              }} 
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Paper>
  );
};

export default CategorySidebar;
