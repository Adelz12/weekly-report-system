import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { useAuth } from '../../context/authContext';

const Navbar = ({ toggleTheme, mode }) => {
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const history = useHistory();

  const onLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    history.push('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={RouterLink} to="/" style={{ textDecoration: 'none', color: 'white', flexGrow: 1 }}>
          Weekly Report System
        </Typography>
        {isAuthenticated ? (
          <Box>
            <Button color="inherit" component={RouterLink} to="/dashboard">
              Dashboard
            </Button>
            <Button color="inherit" component={RouterLink} to="/reports">
              My Reports
            </Button>
            <Button color="inherit" component={RouterLink} to="/calendar">
              Timeline
            </Button>
            <Button color="inherit" component={RouterLink} to="/reports/new">
              New Report
            </Button>
            <Button color="inherit" component={RouterLink} to="/account">
              My Account
            </Button>
            {/* Theme toggle button passed from App */}
            <IconButton color="inherit" onClick={() => (typeof toggleTheme === 'function' ? toggleTheme() : null)}>
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            <Button color="inherit" onClick={onLogout}>
              Logout
            </Button>
          </Box>
        ) : (
          <Box>
            <Button color="inherit" component={RouterLink} to="/login">
              Login
            </Button>
            <Button color="inherit" component={RouterLink} to="/register">
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;