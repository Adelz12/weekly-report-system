import React, { useState } from 'react';
import axios from 'axios';
import { Box, Typography, TextField, Button, Alert, IconButton, InputAdornment } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useParams, useHistory } from 'react-router-dom';

const ResetPassword = () => {
  const { token } = useParams();
  const history = useHistory();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!password || password.length < 6) return setError('Password must be at least 6 characters');
    if (password !== confirm) return setError('Passwords do not match');
    setLoading(true);
    try {
      await axios.post('/api/auth/reset-password', { token, password });
      setSuccess('Password has been reset. You can now log in.');
      setTimeout(() => history.push('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.msg || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box
        sx={{
          width: 400,
          maxWidth: '100%',
          bgcolor: 'transparent',
          border: '2px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(13px)',
          p: '30px 35px',
          borderRadius: '12px',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          color: '#fff',
        }}
      >
        <Typography component="h1" variant="h4" align="center" gutterBottom sx={{ color: '#fff', fontWeight: 700, fontSize: 32 }}>
          Reset Password
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={onSubmit}>
          <TextField
            required
            fullWidth
            id="password"
            name="password"
            type={show1 ? 'text' : 'password'}
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                borderRadius: '30px',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                '&.Mui-focused fieldset': { borderColor: '#fff' },
                '& input::placeholder': { color: '#fff', opacity: 1 },
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShow1(s => !s)} sx={{ color: '#fff' }}>
                    {show1 ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <TextField
            required
            fullWidth
            id="confirm"
            name="confirm"
            type={show2 ? 'text' : 'password'}
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                borderRadius: '30px',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                '&.Mui-focused fieldset': { borderColor: '#fff' },
                '& input::placeholder': { color: '#fff', opacity: 1 },
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShow2(s => !s)} sx={{ color: '#fff' }}>
                    {show2 ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mt: 3,
              bgcolor: '#fff',
              color: '#0a2862',
              borderRadius: '30px',
              height: 45,
              fontWeight: 600,
              boxShadow: '0 0 5px rgba(0,0,0,0.1)',
              '&:hover': { bgcolor: '#f5f5f5' },
            }}
          >
            Reset Password
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ResetPassword;
