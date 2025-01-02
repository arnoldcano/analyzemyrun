import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';

const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <DirectionsRunIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
              flexGrow: 1,
            }}
          >
            AnalyzeMyRun
          </Typography>
          <Box>
            <Button
              component={RouterLink}
              to="/"
              color="inherit"
              sx={{ fontWeight: isActive('/') ? 700 : 400 }}
            >
              Dashboard
            </Button>
            <Button
              component={RouterLink}
              to="/import"
              color="inherit"
              sx={{ fontWeight: isActive('/import') ? 700 : 400 }}
            >
              Import Runs
            </Button>
            <Button
              component={RouterLink}
              to="/goals"
              color="inherit"
              sx={{ fontWeight: isActive('/goals') ? 700 : 400 }}
            >
              Goals
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navigation; 