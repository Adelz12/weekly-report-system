import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import Dashboard from './components/dashboard/Dashboard';
import ReportForm from './components/reports/ReportForm';
import ReportList from './components/reports/ReportList';
import AdminDashboard from './components/admin/AdminDashboard';
import MyAccount from './components/auth/MyAccount';
import ReportCalendar from './components/reports/ReportCalendar';
import AuditFeed from './components/admin/AuditFeed';
import Navbar from './components/layout/Navbar';
import setAuthToken from './utils/setAuthToken';
import AuthContext from './context/authContext';

const baseTheme = createTheme({});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('dark');

  const toggleMode = () => setMode(prev => {
    const next = prev === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('ui_mode', next); } catch (_) {}
    return next;
  });

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: '#6366F1', contrastText: '#0B1220' },
      secondary: { main: '#A78BFA' },
      background: mode === 'dark'
        ? { default: '#0B1220', paper: '#111827' }
        : { default: '#F9FAFB', paper: '#FFFFFF' },
      text: mode === 'dark'
        ? { primary: '#E5E7EB', secondary: '#9CA3AF' }
        : { primary: '#111827', secondary: '#374151' },
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: ['Inter', 'system-ui', 'Arial', 'sans-serif'].join(','),
      button: { textTransform: 'none', fontWeight: 600 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
    },
    shadows: [
      'none',
      '0px 2px 6px rgba(0,0,0,0.2)',
      '0px 4px 12px rgba(0,0,0,0.25)',
      ...baseTheme.shadows.slice(3)
    ],
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backdropFilter: 'saturate(180%) blur(8px)',
            backgroundColor: mode === 'dark' ? 'rgba(17,24,39,0.7)' : 'rgba(255,255,255,0.85)',
            color: mode === 'dark' ? '#E5E7EB' : '#111827'
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 9999,
            transition: 'transform 180ms ease, box-shadow 180ms ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0px 8px 20px rgba(0,0,0,0.25)'
            }
          },
          containedPrimary: {
            backgroundImage: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: { borderRadius: 12 }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            transition: 'transform 180ms ease, box-shadow 180ms ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0px 12px 24px rgba(0,0,0,0.28)'
            }
          }
        }
      }
    }
  }), [mode]);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        setAuthToken(token);
        setIsAuthenticated(true);
        try {
          const res = await (await import('axios')).default.get('/api/auth/me');
          setUser(res.data);
        } catch (_) {
          // ignore; user will remain null if token invalid
        }
      }
      // restore saved theme mode
      const saved = localStorage.getItem('ui_mode');
      if (saved === 'light' || saved === 'dark') {
        setMode(saved);
      }
      setLoading(false);
    };
    init();
  }, []);
  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, user, setUser }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          {(() => {
            const BackgroundImage = () => {
              const location = useLocation();
              const url = process.env.REACT_APP_BG_URL || '/wallpaper.jpg';
              const blurActive = isAuthenticated; // blur after login
              return (
                <Box
                  sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: -1,
                    backgroundImage: `url(${url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: blurActive ? 'blur(12px) brightness(0.85)' : 'none',
                    transform: blurActive ? 'scale(1.05)' : 'none',
                    transition: 'filter 280ms ease, transform 280ms ease',
                  }}
                />
              );
            };
            return <BackgroundImage />;
          })()}
          <Navbar toggleTheme={toggleMode} mode={mode} />
          <div className="container">
            <Switch>
              <Route exact path="/login" component={Login} />
              <Route exact path="/forgot-password" component={ForgotPassword} />
              <Route exact path="/reset-password/:token" component={ResetPassword} />
              <Route exact path="/register" component={Register} />
              <Route exact path="/dashboard" component={Dashboard} />
              <Route exact path="/reports/new" component={ReportForm} />
              <Route exact path="/reports/edit/:id" component={ReportForm} />
              <Route exact path="/account" component={MyAccount} />
              <Route exact path="/reports" component={ReportList} />
              <Route exact path="/calendar" component={ReportCalendar} />
              <Route exact path="/admin" component={AdminDashboard} />
              <Route exact path="/admin/activity" component={AuditFeed} />
              <Redirect from="/" to="/dashboard" />
            </Switch>
          </div>
        </Router>
      </ThemeProvider>
    </AuthContext.Provider>
  );
}

export default App;