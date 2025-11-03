import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Paper, Typography, List, ListItem, ListItemText } from '@mui/material';

const AuditFeed = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/api/reports/audit');
        setLogs(res.data || []);
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
    <Container sx={{ mt: 4 }} maxWidth="md">
      <Typography variant="h4" gutterBottom>Activity Feed</Typography>
      <Paper>
        <List>
          {logs.map(l => (
            <ListItem key={l._id} divider>
              <ListItemText primary={`${l.action} by ${l.user_id}`} secondary={`${l.details?.comment || JSON.stringify(l.details)} — ${new Date(l.created_at).toLocaleString()}`} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default AuditFeed;
