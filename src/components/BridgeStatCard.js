import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const BridgeStatCard = ({ title, value, gradient }) => {
  return (
    <Card
      sx={{
        background: gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
        },
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: 100,
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
            {title}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              wordBreak: 'break-word',
            }}
          >
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BridgeStatCard;
