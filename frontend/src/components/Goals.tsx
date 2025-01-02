import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AddIcon from '@mui/icons-material/Add';

interface Goal {
  type: string;
  target: string;
  date: Date | null;
}

const Goals: React.FC = () => {
  const [newGoal, setNewGoal] = useState<Goal>({
    type: '',
    target: '',
    date: null,
  });

  const handleGoalSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // TODO: Implement goal submission
    console.log('New goal:', newGoal);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Set a New Goal
          </Typography>
          <Box component="form" onSubmit={handleGoalSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id="goal-type-label">Goal Type</InputLabel>
                  <Select
                    labelId="goal-type-label"
                    value={newGoal.type}
                    label="Goal Type"
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, type: e.target.value })
                    }
                  >
                    <MenuItem value="distance">Distance</MenuItem>
                    <MenuItem value="time">Time</MenuItem>
                    <MenuItem value="race">Race</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Target"
                  value={newGoal.target}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, target: e.target.value })
                  }
                  helperText={
                    newGoal.type === 'distance'
                      ? 'Enter distance in miles'
                      : newGoal.type === 'time'
                      ? 'Enter time (HH:MM:SS)'
                      : 'Enter race name'
                  }
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Target Date"
                    value={newGoal.date}
                    onChange={(date) => setNewGoal({ ...newGoal, date })}
                    sx={{ width: '100%' }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{ mt: 2 }}
                >
                  Set Goal
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Current Goals
          </Typography>
          <Typography variant="body1" color="text.secondary">
            No goals set yet. Add a goal above to get started!
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Goals; 