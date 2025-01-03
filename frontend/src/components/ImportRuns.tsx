import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  TextField,
  Alert,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SyncIcon from '@mui/icons-material/Sync';
import api from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`import-tabpanel-${index}`}
      aria-labelledby={`import-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const ImportRuns: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [mapmyrunCredentials, setMapmyrunCredentials] = useState({
    username: '',
    password: '',
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setUploadStatus(null);
    }
  };

  const handleMapmyrunChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMapmyrunCredentials({
      ...mapmyrunCredentials,
      [event.target.name]: event.target.value,
    });
  };

  const handleCsvUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/workouts/upload-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadStatus({
        type: 'success',
        message: `Successfully uploaded ${response.data.length} workouts`,
      });
      setFile(null);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadStatus({
        type: 'error',
        message: error.response?.data?.detail || 'Failed to upload file. Please try again.',
      });
    }
  };

  const handleMapmyrunSync = async () => {
    // TODO: Implement MapMyRun sync
  };

  return (
    <Paper sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="import tabs">
          <Tab label="CSV Upload" />
          <Tab label="MapMyRun Sync" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom>
          Upload CSV File
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Upload a CSV file containing your running data. The file should include columns for date, distance, time, and pace.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <input
            accept=".csv"
            style={{ display: 'none' }}
            id="csv-file-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="csv-file-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUploadIcon />}
            >
              Choose File
            </Button>
          </label>
          {file && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info">Selected file: {file.name}</Alert>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCsvUpload}
                sx={{ mt: 2 }}
              >
                Upload
              </Button>
            </Box>
          )}
          {uploadStatus && (
            <Box sx={{ mt: 2 }}>
              <Alert severity={uploadStatus.type}>{uploadStatus.message}</Alert>
            </Box>
          )}
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Sync with MapMyRun
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Connect your MapMyRun account to automatically import your running data.
        </Typography>
        <Box
          component="form"
          sx={{
            '& .MuiTextField-root': { m: 1, width: '25ch' },
            mt: 2,
          }}
          noValidate
          autoComplete="off"
        >
          <div>
            <TextField
              required
              name="username"
              label="Username"
              value={mapmyrunCredentials.username}
              onChange={handleMapmyrunChange}
            />
            <TextField
              required
              name="password"
              label="Password"
              type="password"
              value={mapmyrunCredentials.password}
              onChange={handleMapmyrunChange}
            />
          </div>
          <Button
            variant="contained"
            color="primary"
            onClick={handleMapmyrunSync}
            startIcon={<SyncIcon />}
            sx={{ mt: 2, ml: 1 }}
          >
            Sync
          </Button>
        </Box>
      </TabPanel>
    </Paper>
  );
};

export default ImportRuns;
