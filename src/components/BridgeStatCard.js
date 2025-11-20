import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';

const BridgeStatCard = ({ title, value, gradient, icon, changeText }) => {
  const bg = gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  return (
    <Card sx={{
      position: 'relative',
      height: '100%',
      minHeight: 120,
      background: bg,
      color: 'common.white',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: '0 6px 30px rgba(0,0,0,0.12)'
    }}>
      {/* Dark overlay to increase contrast for white text */}
      <Box sx={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(rgba(0,0,0,0.18), rgba(0,0,0,0.18))',
        pointerEvents: 'none'
      }} />
      <CardContent sx={{ p: 2.5, position: 'relative' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="subtitle2" sx={{
              fontWeight: 700,
              mb: 1,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'common.white'
            }}>
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1.05, color: 'common.white' }}>
              {value}
            </Typography>
            {changeText && (
              <Typography variant="body2" sx={{ mt: 0.5, color: 'common.white', opacity: 0.95 }}>
                {changeText}
              </Typography>
            )}
          </Box>
          {icon && (
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.16)', width: 56, height: 56 }}>
              {icon}
            </Avatar>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default BridgeStatCard;
