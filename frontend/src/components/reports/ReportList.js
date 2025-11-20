import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { Container, Paper, Typography, Box, Button, Card, CardContent, CardActions, Grid, Chip, Grow, Tooltip } from '@mui/material';
import { TextField, MenuItem } from '@mui/material';

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tagsFilter, setTagsFilter] = useState('');
  const history = useHistory();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const params = {};
        if (q) params.q = q;
        if (statusFilter) params.status = statusFilter;
        if (tagsFilter) params.tags = tagsFilter;
        const res = await axios.get('/api/reports/myreports', { params });
        setReports(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchReports();
  }, [q, statusFilter, tagsFilter]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          My Reports
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField size="small" placeholder="Search" value={q} onChange={e => setQ(e.target.value)} />
          <TextField select size="small" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} sx={{ minWidth: 140 }}>
            <MenuItem value="">All status</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="submitted">Submitted</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>
          <TextField size="small" placeholder="tags (comma)" value={tagsFilter} onChange={e => setTagsFilter(e.target.value)} />
          <Button variant="contained" onClick={() => history.push('/reports/new')}>Create New Report</Button>
        </Box>
        <Box sx={{ ml: 2, display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={async () => {
            try {
              const res = await axios.get('/api/reports/export?format=csv', { responseType: 'blob' });
              const url = window.URL.createObjectURL(new Blob([res.data]));
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', 'reports.csv');
              document.body.appendChild(link);
              link.click();
              link.parentNode.removeChild(link);
            } catch (err) {
              console.error('Export failed', err);
            }
          }}>
            Export CSV
          </Button>
          <Button variant="outlined" onClick={async () => {
            try {
              const res = await axios.get('/api/reports/export?format=xlsx', { responseType: 'blob' });
              const url = window.URL.createObjectURL(new Blob([res.data]));
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', 'reports.xlsx');
              document.body.appendChild(link);
              link.click();
              link.parentNode.removeChild(link);
            } catch (err) {
              console.error('Export XLSX failed', err);
            }
          }}>
            Export XLSX
          </Button>
        </Box>
      </Box>
      
      {reports.length > 0 ? (
        <Grid container spacing={3}>
          {reports.map((report, idx) => (
            <Grid item xs={12} md={6} lg={4} key={report._id}>
              <Grow in appear timeout={300 + idx * 80} style={{ transformOrigin: '0 0 0' }}>
                <Card>
                <CardContent>
                  <Typography variant="h5" component="div">
                    Week {report.week}, {report.year}
                  </Typography>
                  <Box sx={{ mt: 1, mb: 1.5 }}>
                    <Chip 
                      label={report.status} 
                      color={report.status === 'submitted' ? 'primary' : 'default'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Created: {new Date(report.created_at).toLocaleDateString()}
                  </Typography>
                  {report.submitted_at && (
                    <Typography variant="body2" color="text.secondary">
                      Submitted: {new Date(report.submitted_at).toLocaleDateString()}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {report.achievements.substring(0, 100)}...
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => history.push(`/reports/edit/${report._id}`)}>
                    View/Edit
                  </Button>
                  <Tooltip title="Emails the report link to all admins (or configured admin email)">
                    <Button size="small" onClick={async () => {
                      try {
                        await axios.post(`/api/reports/${report._id}/email`);
                        alert('Email sent (if email is configured).');
                      } catch (err) {
                        console.error('Email send failed', err);
                        alert(err.response?.data?.msg || 'Failed to send email');
                      }
                    }}>
                      Email Admin
                    </Button>
                  </Tooltip>
                  <Button size="small" onClick={async () => {
                    // Download PDF
                    try {
                      const res = await axios.get(`/api/reports/${report._id}/pdf`, { responseType: 'blob' });
                      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', `report_${report._id}.pdf`);
                      document.body.appendChild(link);
                      link.click();
                      link.parentNode.removeChild(link);
                    } catch (err) {
                      console.error('Download PDF failed', err);
                    }
                  }}>
                    Download PDF
                  </Button>
                  <Button size="small" color="error" onClick={async () => {
                    // Delete report with confirmation
                    if (!window.confirm('Delete this report? This action cannot be undone.')) return;
                    try {
                      await axios.delete(`/api/reports/${report._id}`);
                      setReports(prev => prev.filter(r => r._id !== report._id));
                    } catch (err) {
                      console.error('Delete failed', err);
                      alert('Failed to delete report');
                    }
                  }}>
                    Delete
                  </Button>
                </CardActions>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No reports yet
          </Typography>
          <Typography variant="body1" gutterBottom>
            Create your first weekly report to get started.
          </Typography>
          <Button variant="contained" onClick={() => history.push('/reports/new')}>
            Create New Report
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default ReportList;