import {
  Container,
  Box,
  Typography,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Button,
  Paper,
  Grid
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Feed from '../post/Feed';

interface Profile {
  _id: string;
  username: string;
  profilePicture: string;
  bio: string;
  location: string;
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Social Media App
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate(`/profile/${profile?._id}`)}>
              <Avatar
                src={profile?.profilePicture}
                alt={profile?.username}
                sx={{ width: 40, height: 40, cursor: 'pointer' }}
              />
            </IconButton>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: 2
              }}
            >
              <Avatar
                src={profile?.profilePicture}
                alt={profile?.username}
                sx={{ width: 120, height: 120, mb: 2 }}
              />
              <Typography variant="h5" component="h1" gutterBottom>
                {profile?.username}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {profile?.bio || 'No bio yet'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profile?.location || 'No location set'}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={8}>
            <Feed />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
} 