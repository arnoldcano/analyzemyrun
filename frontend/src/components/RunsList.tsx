import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Typography,
  Link,
  CircularProgress,
  Box,
} from '@mui/material';
import { api } from '../api';
import { format } from 'date-fns';

interface Run {
  id: number;
  workout_date: string;
  activity_type: string;
  distance_mi: number | null;
  workout_time_seconds: number | null;
  avg_pace_min_mi: number | null;
  avg_speed_mph: number | null;
  calories_burned: number | null;
  avg_heart_rate: number | null;
  steps: number | null;
  external_link: string | null;
}

interface RunsResponse {
  items: Run[];
  total: number;
}

type Order = 'asc' | 'desc';
type OrderBy = keyof Run;

const RunsList: React.FC = () => {
  const [runs, setRuns] = useState<Run[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<OrderBy>('workout_date');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchRuns = async () => {
    try {
      setLoading(true);
      const skip = page * rowsPerPage;
      const response = await api.get<RunsResponse>('/api/v1/workouts', {
        params: {
          skip,
          limit: rowsPerPage,
          sort_by: orderBy,
          sort_order: order,
        },
      });
      setRuns(response.data.items);
      setTotal(response.data.total);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching runs:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, [page, rowsPerPage, order, orderBy]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return '-';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours > 0 ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatPace = (pace: number | null) => {
    if (pace === null) return '-';
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Runs
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'workout_date'}
                  direction={orderBy === 'workout_date' ? order : 'asc'}
                  onClick={() => handleRequestSort('workout_date')}
                >
                  Date
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'activity_type'}
                  direction={orderBy === 'activity_type' ? order : 'asc'}
                  onClick={() => handleRequestSort('activity_type')}
                >
                  Activity
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'distance_mi'}
                  direction={orderBy === 'distance_mi' ? order : 'asc'}
                  onClick={() => handleRequestSort('distance_mi')}
                >
                  Distance (mi)
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Time</TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'avg_pace_min_mi'}
                  direction={orderBy === 'avg_pace_min_mi' ? order : 'asc'}
                  onClick={() => handleRequestSort('avg_pace_min_mi')}
                >
                  Avg Pace
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'calories_burned'}
                  direction={orderBy === 'calories_burned' ? order : 'asc'}
                  onClick={() => handleRequestSort('calories_burned')}
                >
                  Calories
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'avg_heart_rate'}
                  direction={orderBy === 'avg_heart_rate' ? order : 'asc'}
                  onClick={() => handleRequestSort('avg_heart_rate')}
                >
                  Heart Rate
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'steps'}
                  direction={orderBy === 'steps' ? order : 'asc'}
                  onClick={() => handleRequestSort('steps')}
                >
                  Steps
                </TableSortLabel>
              </TableCell>
              <TableCell>Link</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : runs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                  No runs found
                </TableCell>
              </TableRow>
            ) : (
              runs.map((run) => (
                <TableRow key={run.id}>
                  <TableCell>{format(new Date(run.workout_date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{run.activity_type}</TableCell>
                  <TableCell align="right">{run.distance_mi?.toFixed(2) ?? '-'}</TableCell>
                  <TableCell align="right">{formatDuration(run.workout_time_seconds)}</TableCell>
                  <TableCell align="right">{formatPace(run.avg_pace_min_mi)}</TableCell>
                  <TableCell align="right">{run.calories_burned ?? '-'}</TableCell>
                  <TableCell align="right">{run.avg_heart_rate ?? '-'}</TableCell>
                  <TableCell align="right">{run.steps ?? '-'}</TableCell>
                  <TableCell>
                    {run.external_link && (
                      <Link href={run.external_link} target="_blank" rel="noopener noreferrer">
                        View
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Container>
  );
};

export default RunsList; 