import React, { useState, useEffect, useContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Paper, TextField, Button, Typography, Box, Alert, Grid } from '@mui/material';
import { useAuth } from '../../context/authContext';

const ReportForm = () => {
  const [formData, setFormData] = useState({
    week: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    achievements: '',
    challenges: '',
    nextWeekPlan: '',
    status: 'draft'
  });
  const [attachments, setAttachments] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const { user } = useAuth();
  const history = useHistory();
  const { id } = useParams();

  useEffect(() => {
    // Set current week by default
    const now = new Date();
    const week = getWeekNumber(now);
    setFormData(prev => ({ ...prev, week: week.toString(), year: now.getFullYear() }));

    // If editing, fetch report data
    if (id) {
      setIsEdit(true);
      const fetchReport = async () => {
        try {
          const res = await axios.get(`/api/reports/${id}`);
          setFormData({
            week: res.data.week,
            year: res.data.year,
            month: res.data.month || new Date().getMonth() + 1,
            achievements: res.data.achievements,
            challenges: res.data.challenges,
            nextWeekPlan: res.data.next_week_plan,
            status: res.data.status
          });
          // existing attachments
          setPreviews(res.data.attachments || []);
          setTags((res.data.tags || []).join(', '));
        } catch (err) {
          setError('Failed to fetch report data');
        }
      };
      fetchReport();
    }
  }, [id]);

  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  };

  const { week, year, achievements, challenges, nextWeekPlan, status } = formData;

  const parseTags = (tagsStr) => {
    if (!tagsStr) return [];
    return tagsStr.split(',').map(t => t.trim()).filter(t => t.length > 0);
  };

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
        if (isEdit) {
        // use multipart/form-data if attachments present
        if (attachments.length > 0 || tags) {
          const fd = new FormData();
          Object.entries({ ...formData, status: 'submitted' }).forEach(([k,v]) => fd.append(k, v));
          if (tags) fd.append('tags', tags);
          attachments.forEach(f => fd.append('attachments', f));
          await axios.put(`/api/reports/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        } else {
          // send JSON including parsed tags array
          await axios.put(`/api/reports/${id}`, { ...formData, status: 'submitted', tags: parseTags(tags) });
        }
        setSuccess('Report submitted successfully!');
      } else {
  if (attachments.length > 0) {
    const fd = new FormData();
    Object.entries({ ...formData, status: 'submitted' }).forEach(([k,v]) => fd.append(k, v));
    if (tags) fd.append('tags', tags);
    attachments.forEach(f => fd.append('attachments', f));
    await axios.post('/api/reports/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  } else {
    await axios.post('/api/reports/', { ...formData, status: 'submitted', tags: parseTags(tags) });
  }
        setSuccess('Report submitted successfully!');
      }
      
      setTimeout(() => {
        history.push('/reports');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitAsDraft = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      if (isEdit) {
          if (attachments.length > 0) {
            const fd = new FormData();
            Object.entries({ ...formData, status: 'draft' }).forEach(([k,v]) => fd.append(k, v));
            if (tags) fd.append('tags', tags);
            attachments.forEach(f => fd.append('attachments', f));
            await axios.put(`/api/reports/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
          } else {
            await axios.put(`/api/reports/${id}`, { ...formData, status: 'draft', tags: parseTags(tags) });
          }
        setSuccess('Report saved as draft!');
      } else {
    if (attachments.length > 0) {
      const fd = new FormData();
      Object.entries({ ...formData, status: 'draft' }).forEach(([k,v]) => fd.append(k, v));
      if (tags) fd.append('tags', tags);
      attachments.forEach(f => fd.append('attachments', f));
      await axios.post('/api/reports/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    } else {
      await axios.post('/api/reports/', { ...formData, status: 'draft', tags: parseTags(tags) });
    }
        setSuccess('Report saved as draft!');
      }
      
      setTimeout(() => {
        history.push('/reports');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to save report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            {isEdit ? 'Edit Report' : 'Create New Report'}
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <Box component="form" sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="week"
                  label="Week Number"
                  name="week"
                  type="number"
                  value={week}
                  onChange={onChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="year"
                  label="Year"
                  name="year"
                  type="number"
                  value={year}
                  onChange={onChange}
                />
              </Grid>
            </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="month"
                    label="Month"
                    name="month"
                    type="number"
                    inputProps={{ min: 1, max: 12 }}
                    value={formData.month}
                    onChange={onChange}
                  />
                </Grid>
              </Grid>
            <TextField
              margin="normal"
              required
              fullWidth
              id="achievements"
              label="Achievements"
              name="achievements"
              multiline
              rows={4}
              value={achievements}
              onChange={onChange}
              helperText="Describe what you accomplished this week"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="challenges"
              label="Challenges"
              name="challenges"
              multiline
              rows={4}
              value={challenges}
              onChange={onChange}
              helperText="Describe any challenges you faced and how you overcame them"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="nextWeekPlan"
              label="Next Week's Plan"
              name="nextWeekPlan"
              multiline
              rows={4}
              value={nextWeekPlan}
              onChange={onChange}
              helperText="Outline your plan for next week"
            />
            <TextField
              margin="normal"
              fullWidth
              id="tags"
              label="Tags (comma-separated)"
              name="tags"
              value={tags}
              onChange={e => setTags(e.target.value)}
              helperText="Add tags to categorize this report (e.g., projectX, blocker)"
            />
            <Box sx={{ mt: 2 }}>
              <input
                accept="*"
                id="attachments"
                multiple
                type="file"
                onChange={e => {
                  const files = Array.from(e.target.files || []);
                  setAttachments(files);
                  // create simple previews (for images) and metadata for server-returned previews
                  const imagePreviews = files.map(f => ({
                    original_name: f.name,
                    url: URL.createObjectURL(f),
                    mime: f.type
                  }));
                  setPreviews(imagePreviews);
                }}
              />
              <Box sx={{ mt: 1 }}>
                {previews.map((p, idx) => (
                  <Box key={idx} sx={{ mb: 1 }}>
                    {p.mime && p.mime.startsWith('image/') ? (
                      <img src={p.url} alt={p.original_name} style={{ maxWidth: 200, maxHeight: 120 }} />
                    ) : (
                      <Typography variant="body2">{p.original_name}</Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, mb: 2 }}>
              <Button
                type="button"
                variant="outlined"
                onClick={onSubmitAsDraft}
                disabled={loading}
              >
                Save as Draft
              </Button>
              <Button
                type="button"
                variant="contained"
                onClick={onSubmit}
                disabled={loading}
              >
                Submit Report
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ReportForm;