"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography, Paper, Avatar, Rating, Stack, Button, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';

const FALLBACK_REVIEWS_API_DATA = [
  {
    author: { name: "Lazaro cerrajeria 24 horas" },
    originalText: "Excelente servicio y cálidad 💪",
    rating: { value: 5 },
    publishedAt: "2026-03-12T22:44:34.000Z"
  },
  {
    author: { name: "Alejandro Morreale" },
    originalText: "Servicio profesional y prolijo. Recomendable!",
    rating: { value: 5 },
    publishedAt: "2026-03-23T11:25:36.000Z"
  },
  {
    author: { name: "Esteban Fernandez" },
    originalText: "Excelente atención.",
    rating: { value: 5 },
    publishedAt: "2026-03-13T13:02:20.000Z"
  }
];

const parseReviewsData = (rawReviews: any[]) => {
  return rawReviews.map((r: any) => {
    const dateStr = r.publishedAt || r.createdAt;
    const date = dateStr ? new Date(dateStr) : new Date();
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let timeStr = "";
    const diffInDays = Math.floor(diffInSeconds / (3600 * 24));
    if (diffInDays < 7) {
      timeStr = diffInDays <= 0 ? "hoy" : `hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      timeStr = `hace ${weeks} semana${weeks !== 1 ? 's' : ''}`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      timeStr = `hace ${months} mes${months !== 1 ? 'es' : ''}`;
    } else {
      const years = Math.floor(diffInDays / 365);
      timeStr = `hace ${years} año${years !== 1 ? 's' : ''}`;
    }

    return {
      author_name: r.author?.name || "Usuario",
      rating: r.rating?.value || 5,
      text: r.originalText || r.text || "",
      time: timeStr
    };
  });
};

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" style={{ marginRight: '10px' }}>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const GoogleReviews = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchReviews = async () => {
      let fetchedReviews = [];
      const widgetId = process.env.NEXT_PUBLIC_FEATURABLE_WIDGET_ID;

      if (widgetId) {
        try {
          const res = await fetch(`https://featurable.com/api/v2/widgets/${widgetId}`);
          if (res.ok) {
            const json = await res.json();
            fetchedReviews = json.reviews || json.data || (Array.isArray(json) ? json : []);
          }
        } catch (e) {
          console.error("Error fetching reviews from Featurable API, loading fallback:", e);
        }
      }

      if (!fetchedReviews || fetchedReviews.length === 0) {
        fetchedReviews = FALLBACK_REVIEWS_API_DATA;
      }
      setReviews(parseReviewsData(fetchedReviews));
    };

    fetchReviews();
  }, []);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      setActiveIndex(index);
    }
  };

  const handleBulletClick = (index: number) => {
    if (scrollContainerRef.current) {
      const clientWidth = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollTo({
        left: index * clientWidth,
        behavior: 'smooth'
      });
      setActiveIndex(index);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <Box sx={{ py: 10, bgcolor: '#fafafa', borderTop: '1px solid rgba(0,0,0,0.03)', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
      <Container maxWidth="xl">
        {/* Title */}
        <Box sx={{ textIndent: 0, textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              background: 'linear-gradient(90deg, #ff0000, #cc0000)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block',
              textShadow: '0 0 20px rgba(255,0,0,0.1)'
            }}
          >
            Los Gamers Opinaron de DevilGaming
          </Typography>
        </Box>

        {/* Carousel / Grid Container */}
        <Box sx={{ position: 'relative', width: '100%', mb: 4 }}>
          <Box
            ref={scrollContainerRef}
            onScroll={handleScroll}
            sx={{
              display: 'flex',
              gap: 3,
              overflowX: 'auto',
              scrollSnapType: isMobile ? 'x mandatory' : 'none',
              scrollbarWidth: 'none', // Firefox
              '&::-webkit-scrollbar': {
                display: 'none' // Safari/Chrome
              },
              pb: 2,
              px: { xs: 1, md: 0 }
            }}
          >
            {reviews.map((review, idx) => (
              <Box
                key={idx}
                component={motion.div}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                sx={{
                  flex: { xs: '0 0 100%', md: '1 1 0px' },
                  minWidth: { xs: '280px', md: '300px' },
                  scrollSnapAlign: 'center',
                  display: 'flex',
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    width: '100%',
                    bgcolor: 'white',
                    border: '1px solid rgba(0,0,0,0.06)',
                    borderRadius: 4,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    '&:hover': {
                      boxShadow: '0 15px 35px rgba(204,0,0,0.08)',
                      borderColor: 'rgba(204,0,0,0.15)',
                      transform: 'translateY(-6px)'
                    }
                  }}
                >
                  <Box>
                    {/* Header */}
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          width: 44,
                          height: 44,
                          boxShadow: '0 4px 10px rgba(204,0,0,0.2)'
                        }}
                      >
                        {getInitials(review.author_name)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                          {review.author_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {review.time}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Stars */}
                    <Rating
                      value={review.rating}
                      readOnly
                      size="small"
                      sx={{
                        mb: 2,
                        color: '#ffc107',
                        '& .MuiRating-iconFilled': {
                          color: '#ffc107'
                        }
                      }}
                    />

                    {/* Text */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontStyle: 'italic',
                        lineHeight: 1.6,
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      "{review.text}"
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Bullets (Only visible on mobile) */}
        {isMobile && reviews.length > 0 && (
          <Stack
            direction="row"
            spacing={1.5}
            justifyContent="center"
            sx={{ mb: 6 }}
          >
            {reviews.map((_, idx) => (
              <Box
                key={idx}
                onClick={() => handleBulletClick(idx)}
                sx={{
                  width: activeIndex === idx ? 12 : 8,
                  height: activeIndex === idx ? 12 : 8,
                  borderRadius: '50%',
                  bgcolor: activeIndex === idx ? 'primary.main' : 'rgba(0,0,0,0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    bgcolor: 'primary.light'
                  }
                }}
              />
            ))}
          </Stack>
        )}

        {/* Leave Review Button */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            component="a"
            href="https://www.google.com/maps/place/Devil+gaming/@-34.60554,-58.5658073,17z/data=!3m1!4b1!4m6!3m5!1s0x95bcb94c39e7b181:0x56eb15460566652c!8m2!3d-34.6055444!4d-58.5632324!16s%2Fg%2F11mdmtfnvp"
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            color="secondary"
            size="large"
            startIcon={<GoogleIcon />}
            sx={{
              py: 1.8,
              px: 4.5,
              fontWeight: 800,
              borderRadius: 3,
              bgcolor: '#121212',
              color: 'white',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              '&:hover': {
                bgcolor: '#000000',
                boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s'
            }}
          >
            DEJAR UNA RESEÑA EN GOOGLE
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default GoogleReviews;
