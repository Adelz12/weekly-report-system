import React, { useEffect, useState } from 'react';
import { Container, Paper, Typography, Box, CircularProgress, Alert, TextField, Button, IconButton, Table, TableHead, TableRow, TableCell, TableBody, Divider, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';
import { useAuth } from '../../context/authContext';

const MyAccount = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [originalUser, setOriginalUser] = useState(null);
  const { setUser: setAuthUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState('');
  const [reportsUser, setReportsUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/api/auth/me');
        setUser(res.data);
        setOriginalUser(res.data);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      if (!user || user.role !== 'admin') return;
      setUsersLoading(true);
      setUsersError('');
      try {
        const r = await axios.get('/api/auth/users');
        setUsers(r.data || []);
      } catch (e) {
        setUsersError(e.response?.data?.msg || 'Failed to load users');
      } finally {
        setUsersLoading(false);
      }
    };
    loadUsers();
  }, [user]);

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
      setOriginalUser(res.data);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => {
    setError('');
    setSuccess('');
    if (originalUser) {
      setUser({ ...originalUser, password: '' });
    }
    setIsEditing(false);
  };

  return (
    <Container component="main" maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>My Account</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <Box component="form" onSubmit={onSave} sx={{ mt: 2 }}>
          <TextField fullWidth label="Name" name="name" value={user?.name || ''} onChange={onChange} sx={{ mb: 2 }} disabled={!isEditing} />
          <TextField fullWidth label="Email" name="email" value={user?.email || ''} onChange={onChange} sx={{ mb: 2 }} disabled={!isEditing} />
          <TextField fullWidth label="Department" name="department" value={user?.department || ''} onChange={onChange} sx={{ mb: 2 }} disabled={!isEditing} />
          <TextField fullWidth label="Supervisor Email" name="supervisor_email" value={user?.supervisor_email || ''} onChange={onChange} helperText="Used for emailing submitted reports" sx={{ mb: 2 }} disabled={!isEditing} />
          <TextField fullWidth label="New Password" name="password" type="password" value={user?.password || ''} onChange={onChange} helperText="Leave blank to keep current password" sx={{ mb: 2 }} disabled={!isEditing} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            {!isEditing ? (
              <Button type="button" variant="outlined" onClick={() => setIsEditing(true)}>Edit</Button>
            ) : (
              <>
                <Button type="button" variant="text" onClick={onCancel} disabled={saving}>Cancel</Button>
                <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
              </>
            )}
          </Box>
        </Box>
        {user?.role === 'admin' && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>Admin • Users</Typography>
            {usersError && <Alert severity="error" sx={{ mb: 2 }}>{usersError}</Alert>}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">Total Users: <strong>{users.length}</strong></Typography>
              <Button variant="outlined" size="small" onClick={async () => {
                try {
                  setUsersLoading(true);
                  const r = await axios.get('/api/auth/users');
                  setUsers(r.data || []);
                } catch (e) {
                  setUsersError(e.response?.data?.msg || 'Failed to refresh');
                } finally {
                  setUsersLoading(false);
                }
              }}>Refresh</Button>
            </Box>
            {usersLoading ? (
              <CircularProgress size={24} />
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map(u => (
                    <TableRow key={u._id} hover>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.username || '-'}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.department || '-'}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" sx={{ mr: 1 }} onClick={async () => {
                          setReportsUser(u);
                          setReports([]);
                          setReportsError('');
                          setReportsLoading(true);
                          setReportsOpen(true);
                          try {
                            const authToken = localStorage.getItem('token') || sessionStorage.getItem('token');
                            const r = await axios.get(`/api/reports?user_id=${u._id}`, { headers: { ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) } });
                            setReports(r.data || []);
                          } catch (e) {
                            setReportsError(e.response?.data?.msg || 'Failed to load reports');
                          } finally {
                            setReportsLoading(false);
                          }
                        }}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" sx={{ mr: 1 }} onClick={async () => {
                          try {
                            const authToken = localStorage.getItem('token') || sessionStorage.getItem('token');
                            const r = await axios.get(`/api/reports?user_id=${u._id}`, { headers: { ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}) } });
                            const list = r.data || [];
                            if (!list.length) {
                              setUsersError('No reports to download for this user.');
                              return;
                            }
                            const latest = list[0];
                            const res = await axios.get(`/api/reports/${latest._id}/pdf`, { responseType: 'blob' });
                            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', `report_${latest._id}.pdf`);
                            document.body.appendChild(link);
                            link.click();
                            link.parentNode.removeChild(link);
                          } catch (e) {
                            setUsersError(e.response?.data?.msg || 'Failed to download PDF');
                          }
                        }}>
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => { setUserToDelete(u); setConfirmOpen(true); }} disabled={String(u._id) === String(user._id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        )}
      </Paper>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Delete user?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete {userToDelete?.name}'s account and their reports. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" onClick={async () => {
            try {
              if (!userToDelete) return;
              await axios.delete(`/api/auth/users/${userToDelete._id}`);
              setUsers(prev => prev.filter(x => x._id !== userToDelete._id));
              setConfirmOpen(false);
              setUserToDelete(null);
            } catch (e) {
              setUsersError(e.response?.data?.msg || 'Failed to delete user');
              setConfirmOpen(false);
            }
          }}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={reportsOpen} onClose={() => setReportsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>User Reports — {reportsUser?.name}</DialogTitle>
        <DialogContent>
          {reportsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress size={24} /></Box>
          ) : reportsError ? (
            <Alert severity="error" sx={{ mb: 2 }}>{reportsError}</Alert>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Week</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map(r => (
                  <>
                    <TableRow key={r._id} hover onClick={() => setExpanded(prev => ({ ...prev, [r._id]: !prev[r._id] }))} style={{ cursor: 'pointer' }}>
                      <TableCell>{r.week}</TableCell>
                      <TableCell>{r.year}</TableCell>
                      <TableCell>{r.status}</TableCell>
                      <TableCell>{r.created_at}</TableCell>
                    </TableRow>
                    {expanded[r._id] && (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <Box sx={{ p: 1.5 }}>
                            <Typography variant="subtitle2" gutterBottom>Achievements</Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>{r.achievements || '-'}</Typography>
                            <Typography variant="subtitle2" gutterBottom>Challenges</Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>{r.challenges || '-'}</Typography>
                            <Typography variant="subtitle2" gutterBottom>Next Week Plan</Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>{r.next_week_plan || '-'}</Typography>
                            <Typography variant="subtitle2" gutterBottom>Tags</Typography>
                            <Typography variant="body2">{(r.tags || []).join(', ') || '-'}</Typography>
                            <Box sx={{ mt: 2 }}>
                              <Button size="small" variant="outlined" onClick={async () => {
                                try {
                                  const res = await axios.get(`/api/reports/${r._id}/pdf`, { responseType: 'blob' });
                                  const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.setAttribute('download', `report_${r._id}.pdf`);
                                  document.body.appendChild(link);
                                  link.click();
                                  link.parentNode.removeChild(link);
                                } catch (err) {
                                  setReportsError(err.response?.data?.msg || 'Failed to download PDF');
                                }
                              }}>
                                Download PDF
                              </Button>
                            </Box>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyAccount;
