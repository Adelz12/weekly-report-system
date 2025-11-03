import React, { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { Container, Grid, Paper, Typography, Box, Button, Card, CardContent, CardActions } from '@mui/material';
import { useAuth } from '../../context/authContext';

const Dashboard = () => {
  const [userReports, setUserReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const history = useHistory();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get('/api/reports/myreports');
        setUserReports(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const getCurrentWeekReport = () => {
    const now = new Date();
    const week = getWeekNumber(now);
    const year = now.getFullYear();
    
    return userReports.find(report => 
      report.week === week.toString() && report.year === year
    );
  };

  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  };

  const currentWeekReport = getCurrentWeekReport();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.name}!
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              This Week's Report
            </Typography>
            {currentWeekReport ? (
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div">
                    Week {currentWeekReport.week}, {currentWeekReport.year}
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    Status: {currentWeekReport.status}
                  </Typography>
                  <Typography variant="body2">
                    {currentWeekReport.status === 'draft' ? 
                      'You have a draft report in progress. Complete and submit it before the deadline.' :
                      'Your report for this week has been submitted.'
                    }
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => history.push(`/reports/edit/${currentWeekReport._id}`)}>
                    {currentWeekReport.status === 'draft' ? 'Continue Editing' : 'View Report'}
                  </Button>
                </CardActions>
              </Card>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body1" gutterBottom>
                  You haven't started your report for this week yet.
                </Typography>
                <Button variant="contained" onClick={() => history.push('/reports/new')}>
                  Create New Report
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button variant="outlined" onClick={() => history.push('/reports/new')}>
                Create New Report
              </Button>
              <Button variant="outlined" onClick={() => history.push('/reports')}>
                View All Reports
              </Button>
              {user?.role === 'admin' && (
                <Button variant="outlined" onClick={() => history.push('/admin')}>
                  Admin Dashboard
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Recent Reports
            </Typography>
            {userReports.length > 0 ? (
              userReports.slice(0, 3).map(report => (
                <Card key={report._id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h5" component="div">
                      Week {report.week}, {report.year}
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                      Status: {report.status}
                    </Typography>
                    <Typography variant="body2">
                      {report.achievements.substring(0, 100)}...
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => history.push(`/reports/edit/${report._id}`)}>
                      View
                    </Button>
                  </CardActions>
                </Card>
              ))
            ) : (
              <Typography variant="body1">
                No reports yet. Create your first report!
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;