import React, { useState, useEffect } from 'react';
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
  Card,
  CardContent,
  IconButton,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import { api } from '../api';

interface Goal {
  id?: number;
  type: string;
  target: string;
  target_date: Date | null;
  date_created?: string;
  completed?: string | null;
}

const Goals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState<Goal>({
    type: '',
    target: '',
    target_date: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchGoals = async () => {
    try {
      const response = await api.get('/api/v1/goals');
      setGoals(response.data);
    } catch (error) {
      console.error('Error fetching goals:', error);
      setError('Failed to load goals');
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleGoalSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newGoal.type || !newGoal.target || !newGoal.target_date) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await api.post('/api/v1/goals', {
        ...newGoal,
        target_date: newGoal.target_date.toISOString(),
      });
      setSuccess('Goal created successfully');
      setNewGoal({
        type: '',
        target: '',
        target_date: null,
      });
      fetchGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
      setError('Failed to create goal');
    }
  };

  const handleDeleteGoal = async (goalId: number) => {
    try {
      await api.delete(`/api/v1/goals/${goalId}`);
      setSuccess('Goal deleted successfully');
      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      setError('Failed to delete goal');
    }
  };

  const formatGoalTarget = (goal: Goal) => {
    switch (goal.type) {
      case 'distance':
        return `${goal.target} miles`;
      case 'time':
        return `${goal.target}`;
      case 'race':
        return goal.target;
      default:
        return goal.target;
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Set a New Goal
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
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
                    value={newGoal.target_date}
                    onChange={(date) => setNewGoal({ ...newGoal, target_date: date })}
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
          {goals.length === 0 ? (
            <Typography variant="body1" color="text.secondary">
              No goals set yet. Add a goal above to get started!
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {goals.map((goal) => (
                <Grid item xs={12} sm={6} md={4} key={goal.id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography color="textSecondary" gutterBottom>
                            {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)} Goal
                          </Typography>
                          <Typography variant="h6" component="div">
                            {formatGoalTarget(goal)}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Target: {format(new Date(goal.target_date!), 'MMM d, yyyy')}
                          </Typography>
                          {goal.completed && (
                            <Typography variant="body2" color="success.main">
                              Completed: {format(new Date(goal.completed), 'MMM d, yyyy')}
                            </Typography>
                          )}
                        </Box>
                        <IconButton
                          onClick={() => goal.id && handleDeleteGoal(goal.id)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Goals; 