import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Paper, Box, List, ListItem, ListItemText, Chip } from '@mui/material';

const ReportCalendar = () => {
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/api/reports/myreports');
        const reports = res.data || [];
        const map = {};
        reports.forEach(r => {
          const key = `${r.year}-W${r.week}`;
          map[key] = map[key] || [];
          map[key].push(r);
        });
        setGrouped(map);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Reports Timeline</Typography>
      {Object.keys(grouped).length === 0 ? (
        <Paper sx={{ p: 3 }}><Typography>No reports found.</Typography></Paper>
      ) : (
        Object.keys(grouped).sort().map(k => (
          <Paper key={k} sx={{ mb: 2, p: 2 }}>
            <Typography variant="h6">{k}</Typography>
            <List>
              {grouped[k].map(r => (
                <ListItem key={r._id} divider>
                  <ListItemText
                    primary={`Week ${r.week} — ${r.status}`}
                    secondary={r.achievements.substring(0, 140) + (r.achievements.length > 140 ? '...' : '')}
                  />
                  <Box>
                    {r.attachments && r.attachments.length > 0 && (
                      <Chip label={`${r.attachments.length} file(s)`} />
                    )}
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        ))
      )}
    </Container>
  );
};

export default ReportCalendar;
