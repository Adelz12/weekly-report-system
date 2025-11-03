import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
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

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('light');

  const toggleMode = () => setMode(prev => (prev === 'light' ? 'dark' : 'light'));

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: '#0d9488' }, // teal-ish
      secondary: { main: '#fb923c' } // orange accent
    },
    typography: {
      button: { textTransform: 'none' }
    }
  }), [mode]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);
  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, user, setUser }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Navbar toggleTheme={toggleMode} mode={mode} />
          <div className="container">
            <Switch>
              <Route exact path="/login" component={Login} />
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