import React from 'react';
import { Box, Typography } from '@mui/material';

const BridgeHeader = ({ title, subtitle, actions }) => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }} color="primary">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="subtitle1" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      <Box>
        {actions}
      </Box>
    </Box>
  );
};

export default BridgeHeader;
