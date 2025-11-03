import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Paper, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid } from '@mui/material';
import { Button } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const AdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get('/api/reports');
        setReports(res.data);
        // fetch stats for charts
        const s = await axios.get('/api/reports/stats');
        setStats(s.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Button variant="outlined" href="/admin/activity">View Activity Feed</Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 360 }}>
            <Typography variant="h6" gutterBottom>Reports per Week</Typography>
            {stats && stats.weekly && (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={stats.weekly.map(w => ({ name: `${w.year}-W${w.week}`, total: w.total, submitted: w.submitted }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#8884d8" />
                  <Line type="monotone" dataKey="submitted" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 360 }}>
            <Typography variant="h6" gutterBottom>Completion Rate by Department</Typography>
            {stats && stats.departments && (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.departments.map(d => ({ name: d.department, completion: d.total ? (d.submitted / d.total * 100) : 0 }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis unit="%" />
                  <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                  <Bar dataKey="completion" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            )}
            {stats && stats.overall && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Overall completion: {stats.overall.completion_rate.toFixed(1)}%</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              All Reports
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Week</TableCell>
                    <TableCell>Year</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Submitted</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map(report => (
                    <TableRow key={report._id}>
                      <TableCell>{report.user?.name || 'N/A'}</TableCell>
                      <TableCell>{report.user?.department || 'N/A'}</TableCell>
                      <TableCell>{report.week}</TableCell>
                      <TableCell>{report.year}</TableCell>
                      <TableCell>{report.status}</TableCell>
                      <TableCell>
                        {report.submitted_at ? new Date(report.submitted_at).toLocaleDateString() : 'Not submitted'}
                      </TableCell>
                      <TableCell>
                        {report.status === 'submitted' && (
                          <>
                            <button onClick={async () => {
                              try {
                                await axios.post(`/api/reports/${report._id}/approve`, {});
                                // refresh
                                const res = await axios.get('/api/reports');
                                setReports(res.data);
                                const s = await axios.get('/api/reports/stats');
                                setStats(s.data);
                              } catch (err) {
                                console.error(err);
                              }
                            }}>Approve</button>
                            <button onClick={async () => {
                              const comment = prompt('Reason for rejection (required)');
                              if (!comment) return alert('Rejection requires a comment');
                              try {
                                await axios.post(`/api/reports/${report._id}/reject`, { comment });
                                const res = await axios.get('/api/reports');
                                setReports(res.data);
                                const s = await axios.get('/api/reports/stats');
                                setStats(s.data);
                              } catch (err) {
                                console.error(err);
                              }
                            }}>Reject</button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;