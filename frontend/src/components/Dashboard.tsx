import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip as MuiTooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from 'recharts';
import { api } from '../api';
import { format, parseISO } from 'date-fns';
import InfoIcon from '@mui/icons-material/Info';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface Summary {
  period_days: number;
  total_runs: number;
  total_distance: number;
  avg_distance: number;
  longest_run: number;
  best_pace: number;
  avg_pace: number;
  total_time: number;
  weekly_mileage: Array<{ week: string; distance: number }>;
  recent_achievements: Array<{ type: string; value: string; date: string }>;
  pace_zones: { easy: number; moderate: number; tempo: number };
}

interface TrendData {
  metric: string;
  group_by: string;
  data: Array<{ period: string; value: number }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodDays, setPeriodDays] = useState(-1);
  const [customDateRange, setCustomDateRange] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('distance');
  const [groupBy, setGroupBy] = useState('week');

  const fetchSummary = async () => {
    try {
      let url = '/api/v1/workouts/analytics/summary';
      if (customDateRange && startDate && endDate) {
        url += `?days=-1&start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`;
      } else {
        url += `?days=${periodDays === -2 ? -1 : periodDays}`;
      }
      const response = await api.get(url);
      console.log('Summary response:', response.data);
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchTrends = async () => {
    try {
      let params: any = {
        metric: selectedMetric,
        group_by: groupBy,
      };
      if (customDateRange && startDate && endDate) {
        params.days = -1;
        params.start_date = startDate.toISOString();
        params.end_date = endDate.toISOString();
      } else {
        params.days = periodDays === -2 ? -1 : periodDays;
      }
      const response = await api.get('/api/v1/workouts/analytics/trends', { params });
      setTrendData(response.data);
    } catch (error) {
      console.error('Error fetching trends:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchSummary(), fetchTrends()]);
      setLoading(false);
    };
    fetchData();
  }, [periodDays, selectedMetric, groupBy]);

  const formatPace = (pace: number | null) => {
    if (pace === null) return '-';
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace % 1) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return '-';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours > 0 ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const calculateTrendLine = (data: Array<{ period: string; value: number }>) => {
    if (!data || data.length < 2) return null;

    const n = data.length;
    const xValues = Array.from({ length: n }, (_, i) => i);
    const yValues = data.map(d => d.value);

    // Calculate means
    const xMean = xValues.reduce((a, b) => a + b, 0) / n;
    const yMean = yValues.reduce((a, b) => a + b, 0) / n;

    // Calculate slope (m) and y-intercept (b)
    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i++) {
      numerator += (xValues[i] - xMean) * (yValues[i] - yMean);
      denominator += Math.pow(xValues[i] - xMean, 2);
    }
    const slope = numerator / denominator;
    const intercept = yMean - slope * xMean;

    // Return start and end points for the trend line
    return {
      start: intercept,
      end: slope * (n - 1) + intercept
    };
  };

  const handleCustomDateSelect = () => {
    setDatePickerOpen(true);
  };

  const handleDatePickerClose = () => {
    setDatePickerOpen(false);
  };

  const handleDatePickerSave = () => {
    if (startDate && endDate) {
      setCustomDateRange(true);
      setPeriodDays(-1);
      setDatePickerOpen(false);
    }
  };

  if (loading || !summary || !trendData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Time Period Selector */}
        <Grid item xs={12}>
          <Box display="flex" gap={2} alignItems="center">
            <FormControl>
              <InputLabel>Time Period</InputLabel>
              <Select
                value={periodDays}
                label="Time Period"
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setPeriodDays(value);
                  setCustomDateRange(false);
                  if (value === -2) { // Custom range option
                    handleCustomDateSelect();
                  }
                }}
              >
                <MenuItem value={-1}>All time</MenuItem>
                <MenuItem value={7}>Last 7 days</MenuItem>
                <MenuItem value={30}>Last 30 days</MenuItem>
                <MenuItem value={90}>Last 90 days</MenuItem>
                <MenuItem value={365}>Last year</MenuItem>
                <MenuItem value={-2}>Custom range...</MenuItem>
              </Select>
            </FormControl>
            {customDateRange && startDate && endDate && (
              <Typography variant="body2" color="textSecondary">
                {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
              </Typography>
            )}
          </Box>
        </Grid>

        {/* Custom Date Range Dialog */}
        <Dialog open={datePickerOpen} onClose={handleDatePickerClose}>
          <DialogTitle>Select Date Range</DialogTitle>
          <DialogContent>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 2 }}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  maxDate={endDate || undefined}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  minDate={startDate || undefined}
                />
              </Box>
            </LocalizationProvider>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDatePickerClose}>Cancel</Button>
            <Button onClick={handleDatePickerSave} disabled={!startDate || !endDate}>
              Apply
            </Button>
          </DialogActions>
        </Dialog>

        {/* Summary Stats */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography color="textSecondary" gutterBottom>
                  Total Runs
                </Typography>
                <MuiTooltip title="Number of runs completed in the selected time period">
                  <InfoIcon fontSize="small" color="action" />
                </MuiTooltip>
              </Box>
              <Typography variant="h4">{summary.total_runs}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography color="textSecondary" gutterBottom>
                  Total Distance
                </Typography>
                <MuiTooltip title="Total miles covered in all runs">
                  <InfoIcon fontSize="small" color="action" />
                </MuiTooltip>
              </Box>
              <Typography variant="h4">{summary.total_distance.toFixed(1)} mi</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography color="textSecondary" gutterBottom>
                  Average Pace
                </Typography>
                <MuiTooltip title="Average minutes per mile across all runs">
                  <InfoIcon fontSize="small" color="action" />
                </MuiTooltip>
              </Box>
              <Typography variant="h4">{formatPace(summary.avg_pace)} /mi</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography color="textSecondary" gutterBottom>
                  Total Time
                </Typography>
                <MuiTooltip title="Total time spent running (HH:MM:SS)">
                  <InfoIcon fontSize="small" color="action" />
                </MuiTooltip>
              </Box>
              <Typography variant="h4">{formatDuration(summary.total_time)}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Weekly Mileage Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6" gutterBottom>
                Weekly Mileage
              </Typography>
              <MuiTooltip title="Track your running volume week by week to monitor progress and consistency">
                <InfoIcon fontSize="small" color="action" />
              </MuiTooltip>
            </Box>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={summary.weekly_mileage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="week"
                    tickFormatter={(date) => format(parseISO(date), 'MMM d')}
                  />
                  <YAxis />
                  <RechartsTooltip
                    labelFormatter={(date: string) => format(parseISO(date), 'MMM d, yyyy')}
                    formatter={(value: number) => [`${value.toFixed(1)} mi`, 'Distance']}
                  />
                  <Line type="monotone" dataKey="distance" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Intensity Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6" gutterBottom>
                Intensity Distribution
              </Typography>
              <MuiTooltip title="Distribution of your runs by intensity: Easy (more than 10% slower than avg), Moderate (within 10% of avg), Tempo (more than 10% faster than avg)">
                <InfoIcon fontSize="small" color="action" />
              </MuiTooltip>
            </Box>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Easy', value: summary.pace_zones.easy },
                      { name: 'Moderate', value: summary.pace_zones.moderate },
                      { name: 'Tempo', value: summary.pace_zones.tempo },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Trends */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6">Trends</Typography>
                    <MuiTooltip title="Visualize your running metrics over time to identify patterns and progress">
                      <InfoIcon fontSize="small" color="action" />
                    </MuiTooltip>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Visualize your running metrics over time to identify patterns and progress
                  </Typography>
                </Grid>
                <Grid item>
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Metric</InputLabel>
                    <Select
                      value={selectedMetric}
                      label="Metric"
                      onChange={(e) => setSelectedMetric(e.target.value)}
                    >
                      <MenuItem value="distance">Distance</MenuItem>
                      <MenuItem value="pace">Pace</MenuItem>
                      <MenuItem value="time">Time</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item>
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Group By</InputLabel>
                    <Select
                      value={groupBy}
                      label="Group By"
                      onChange={(e) => setGroupBy(e.target.value)}
                    >
                      <MenuItem value="day">Day</MenuItem>
                      <MenuItem value="week">Week</MenuItem>
                      <MenuItem value="month">Month</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={trendData.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="period"
                    tickFormatter={(date) => format(parseISO(date), 'MMM d')}
                  />
                  <YAxis />
                  <RechartsTooltip
                    labelFormatter={(date: string) => format(parseISO(date), 'MMM d, yyyy')}
                    formatter={(value: number) => {
                      if (selectedMetric === 'pace') return [formatPace(value), 'Pace'];
                      if (selectedMetric === 'time') return [formatDuration(value), 'Time'];
                      return [`${value.toFixed(1)} mi`, 'Distance'];
                    }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" />
                  {calculateTrendLine(trendData.data) && (
                    <ReferenceLine
                      segment={[
                        { x: trendData.data[0].period, y: calculateTrendLine(trendData.data)?.start },
                        { x: trendData.data[trendData.data.length - 1].period, y: calculateTrendLine(trendData.data)?.end }
                      ]}
                      stroke="#ff7300"
                      strokeDasharray="3 3"
                      ifOverflow="extendDomain"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Achievements */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Achievements
            </Typography>
            <Grid container spacing={2}>
              {summary.recent_achievements.map((achievement, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        {achievement.type}
                      </Typography>
                      <Typography variant="h5">{achievement.value}</Typography>
                      <Typography color="textSecondary">
                        {format(parseISO(achievement.date), 'MMM d, yyyy')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 