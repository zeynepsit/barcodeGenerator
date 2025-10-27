import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  AdminPanelSettings as AdminIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { userApi } from '../services/api';
import { User } from '../types';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialog, setEditDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError('Kullanıcılar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditDialog({ open: true, user });
  };

  const handleDelete = (user: User) => {
    setDeleteDialog({ open: true, user });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.user) return;

    try {
      await userApi.deleteUser(deleteDialog.user.id);
      setUsers(users.filter(u => u.id !== deleteDialog.user!.id));
      setDeleteDialog({ open: false, user: null });
    } catch (err) {
      setError('Kullanıcı silinirken bir hata oluştu.');
    }
  };

  const handleStatusToggle = async (user: User) => {
    // Admin kullanıcısı değiştirilemez
    if (user.role === 'ADMIN') {
      setError('Admin kullanıcısının durumu değiştirilemez!');
      return;
    }
    
    try {
      if (user.isActive) {
        await userApi.deactivateUser(user.id);
      } else {
        await userApi.activateUser(user.id);
      }
      loadUsers();
    } catch (err) {
      setError('Kullanıcı durumu güncellenirken bir hata oluştu.');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'error';
      case 'MANAGER': return 'warning';
      case 'USER': return 'primary';
      default: return 'default';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Yönetici';
      case 'MANAGER': return 'Müdür';
      case 'USER': return 'Kullanıcı';
      default: return role;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  if (loading && users.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
        >
          Geri
        </Button>
        <AdminIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Admin Paneli
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h4">{users.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Toplam Kullanıcı
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AdminIcon sx={{ mr: 2, color: 'error.main' }} />
                <Box>
                  <Typography variant="h4">
                    {users.filter(u => u.role === 'ADMIN').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Admin
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleIcon sx={{ mr: 2, color: 'success.main' }} />
                <Box>
                  <Typography variant="h4">
                    {users.filter(u => u.isActive).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Aktif Kullanıcı
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PeopleIcon sx={{ mr: 2, color: 'warning.main' }} />
                <Box>
                  <Typography variant="h4">
                    {users.filter(u => !u.isActive).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pasif Kullanıcı
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Kullanıcı</TableCell>
              <TableCell>E-posta</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Kayıt Tarihi</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    @{user.username}
                  </Typography>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={getRoleLabel(user.role)}
                    color={getRoleColor(user.role) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.isActive ? 'Aktif' : 'Pasif'}
                    color={user.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell>
                  {user.role !== 'ADMIN' && (
                    <IconButton
                      size="small"
                      onClick={() => handleStatusToggle(user)}
                      color={user.isActive ? 'error' : 'success'}
                      title={user.isActive ? 'Pasifleştir' : 'Aktifleştir'}
                    >
                      {user.isActive ? <CancelIcon /> : <CheckCircleIcon />}
                    </IconButton>
                  )}
                  {user.role !== 'ADMIN' && (
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(user)}
                      title="Düzenle"
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                  {user.role !== 'ADMIN' && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(user)}
                      title="Sil"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Düzenleme Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, user: null })}>
        <DialogTitle>Kullanıcı Düzenle</DialogTitle>
        <DialogContent>
          <Typography>
            Kullanıcı düzenleme özelliği yakında eklenecek.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, user: null })}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Silme Onay Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, user: null })}>
        <DialogTitle>Kullanıcıyı Sil</DialogTitle>
        <DialogContent>
          <Typography>
            "{deleteDialog.user?.firstName} {deleteDialog.user?.lastName}" kullanıcısını silmek istediğinizden emin misiniz?
            Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, user: null })}>
            İptal
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPage;

