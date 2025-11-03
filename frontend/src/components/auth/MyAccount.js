import React, { useEffect, useState } from 'react';
import { Container, Paper, Typography, Box, CircularProgress, Alert, TextField, Button } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../context/authContext';

const MyAccount = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const { setUser: setAuthUser } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/api/auth/me');
        setUser(res.data);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) return (
    <Container sx={{ mt: 4 }}>
      <CircularProgress />
    </Container>
  );

  if (error) return (
    <Container sx={{ mt: 4 }}>
      <Alert severity="error">{error}</Alert>
    </Container>
  );

  const onChange = e => setUser(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const onSave = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const payload = {
        name: user.name,
        email: user.email,
        department: user.department
      };
      if (user.password && user.password.length > 0) payload.password = user.password;

      const res = await axios.patch('/api/auth/me', payload);
      setUser(res.data);
      setAuthUser(res.data);
      setSuccess('Profile updated');
      // clear password field
      setUser(prev => ({ ...prev, password: '' }));
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>My Account</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <Box component="form" onSubmit={onSave} sx={{ mt: 2 }}>
          <TextField fullWidth label="Name" name="name" value={user?.name || ''} onChange={onChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Email" name="email" value={user?.email || ''} onChange={onChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="Department" name="department" value={user?.department || ''} onChange={onChange} sx={{ mb: 2 }} />
          <TextField fullWidth label="New Password" name="password" type="password" value={user?.password || ''} onChange={onChange} helperText="Leave blank to keep current password" sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default MyAccount;
