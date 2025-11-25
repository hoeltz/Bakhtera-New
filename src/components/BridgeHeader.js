import React from 'react';
import { Box, Typography } from '@mui/material';

const BridgeHeader = ({ title, subtitle, actions }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
        pb: 2,
        borderBottom: '2px solid',
        borderColor: 'divider',
      }}
    >
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && <Box>{actions}</Box>}
    </Box>
  );
};

export default BridgeHeader;
