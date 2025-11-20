import React, { useState } from 'react';
import { useHistory, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import setAuthToken from '../../utils/setAuthToken';
import { TextField, Button, Typography, Box, Alert, Checkbox, FormControlLabel, Link, IconButton, InputAdornment } from '@mui/material';
import { useAuth } from '../../context/authContext';
import PersonIcon from '@mui/icons-material/Person';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const { setIsAuthenticated, setUser } = useAuth();
  const history = useHistory();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const { username, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await axios.post('/api/auth/login', {
        username: (formData.username || '').trim(),
        password
      });
      const { token, user } = res.data;

      try {
        if (remember) {
          localStorage.setItem('token', token);
          try { sessionStorage.removeItem('token'); } catch (_) {}
        } else {
          sessionStorage.setItem('token', token);
          try { localStorage.removeItem('token'); } catch (_) {}
        }
      } catch (_) {}

      setAuthToken(token);
      setIsAuthenticated(true);
      setUser(user);
      history.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
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
        <Typography component="h1" variant="h4" align="center" gutterBottom sx={{ color: '#fff', fontWeight: 700, fontSize: 38 }}>
          Login
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={onSubmit} sx={{ mt: 1 }}>
          <TextField
            required
            fullWidth
            id="username"
            name="username"
            type="text"
            placeholder="Username"
            autoComplete="username"
            value={username}
            onChange={onChange}
            autoFocus
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
              '& .MuiInputAdornment-root .MuiSvgIcon-root': { color: '#fff' },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <PersonIcon />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            required
            fullWidth
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            autoComplete="new-password"
            value={password}
            onChange={onChange}
            sx={{
              mt: 3,
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                borderRadius: '30px',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                '&.Mui-focused fieldset': { borderColor: '#fff' },
                '& input::placeholder': { color: '#fff', opacity: 1 },
              },
              '& .MuiInputAdornment-root .MuiSvgIcon-root': { color: '#fff' },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword((s) => !s)}
                    edge="end"
                    sx={{ color: '#fff' }}
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
            <FormControlLabel
              control={<Checkbox size="small" checked={remember} onChange={(e) => setRemember(e.target.checked)} sx={{ color: '#fff', '&.Mui-checked': { color: '#fff' } }} />}
              label="Remember me"
              sx={{ color: '#fff' }}
            />
            <Link component={RouterLink} to="/forgot-password" underline="hover" sx={{ color: '#fff' }}>
              Forgot Password?
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 2,
              mb: 3,
              bgcolor: '#fff',
              color: '#0a2862',
              borderRadius: '30px',
              height: 45,
              fontWeight: 600,
              boxShadow: '0 0 5px rgba(0,0,0,0.1)',
              '&:hover': { bgcolor: '#f5f5f5' },
            }}
          >
            Login
          </Button>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link component={RouterLink} to="/register" underline="hover" sx={{ color: '#fff', fontWeight: 500 }}>
              Create an account
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;