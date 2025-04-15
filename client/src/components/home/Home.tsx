import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Grid
} from '@mui/material';
import { Edit, Logout } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { getProfilePictureUrl } from '../../utils/imageUtils';

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  profilePicture: string;
  bio: string;
  location: string;
  followers: string[];
  following: string[];
  createdAt: string;
}

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5001/api/auth/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setProfile(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching profile');
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

  const handleEditProfile = () => {
    navigate(`/profile/${user?.id}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={getProfilePictureUrl(profile?.profilePicture, profile?.username)}
                alt={profile?.username}
                sx={{ width: 120, height: 120, mb: 2 }}
              />
              <Typography variant="h5" component="h1" gutterBottom>
                {profile?.username}
              </Typography>
              {profile?.location && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {profile.location}
                </Typography>
              )}
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={handleEditProfile}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Logout />}
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                About
              </Typography>
              <Typography variant="body1">
                {profile?.bio || "No bio provided"}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6">{profile?.followers.length || 0}</Typography>
                <Typography variant="body2" color="text.secondary">Followers</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6">{profile?.following.length || 0}</Typography>
                <Typography variant="body2" color="text.secondary">Following</Typography>
              </Box>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h4" component="div">
                    {profile?.followers.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Followers
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h4" component="div">
                    {profile?.following.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Following
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h4" component="div">
                    0
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Posts
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h4" component="div">
                    0
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Posts
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
} 