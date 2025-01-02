import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Container, Box } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import ImportRuns from './components/ImportRuns';
import Goals from './components/Goals';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navigation />
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/import" element={<ImportRuns />} />
            <Route path="/goals" element={<Goals />} />
          </Routes>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default App; 