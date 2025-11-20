import React, { useState } from 'react';
import axios from 'axios';
import { Box, Typography, TextField, Button, Alert } from '@mui/material';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setSuccess('If an account exists for this email, a reset link has been sent.');
    } catch (err) {
      setError(err.response?.data?.msg || 'Request failed');
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
          Forgot Password
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={onSubmit}>
          <TextField
            required
            fullWidth
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            Send Reset Link
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ForgotPassword;
