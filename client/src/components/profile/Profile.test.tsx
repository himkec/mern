import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AuthProvider } from '../../context/AuthContext';
import Profile from './Profile';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Create theme for Material-UI
const theme = createTheme();

// Mock useParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ userId: '1' })
}));

describe('Profile Component', () => {
  const mockUser = {
    _id: '1',
    username: 'testuser',
    email: 'test@example.com',
    profilePicture: 'https://example.com/avatar.jpg',
    bio: 'Test bio',
    location: 'Test Location',
    followers: [],
    following: [],
    createdAt: '2024-01-01'
  };

  const renderProfile = () => {
    render(
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <AuthProvider>
            <Profile />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the auth context
    localStorage.setItem('token', 'fake-token');
    // Mock the auth user data
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/api/auth/me')) {
        return Promise.resolve({ data: { ...mockUser, id: mockUser._id } });
      }
      if (url.includes('/api/profile/1')) {
        return Promise.resolve({ data: mockUser });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  it('renders profile information', async () => {
    renderProfile();

    await waitFor(() => {
      expect(screen.getByText(mockUser.username)).toBeInTheDocument();
      expect(screen.getByText(mockUser.bio)).toBeInTheDocument();
      expect(screen.getByText(mockUser.location)).toBeInTheDocument();
    });
  });

  it('handles profile loading error', async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/api/auth/me')) {
        return Promise.resolve({ data: mockUser });
      }
      return Promise.reject({
        response: {
          data: {
            message: 'Error fetching profile'
          }
        }
      });
    });

    renderProfile();

    await waitFor(() => {
      expect(screen.getByText(/error fetching profile/i)).toBeInTheDocument();
    });
  });

  it('displays correct follower and following counts', async () => {
    const userWithFollowers = {
      ...mockUser,
      followers: ['1', '2', '3'],
      following: ['1', '2']
    };

    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/api/auth/me')) {
        return Promise.resolve({ data: mockUser });
      }
      if (url.includes('/api/profile/1')) {
        return Promise.resolve({ data: userWithFollowers });
      }
      return Promise.reject(new Error('Not found'));
    });

    renderProfile();

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument(); // Followers count
      expect(screen.getByText('2')).toBeInTheDocument(); // Following count
    });
  });
}); 