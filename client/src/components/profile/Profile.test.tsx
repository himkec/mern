import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AuthProvider } from '../../context/AuthContext';
import Profile from './Profile';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Create theme for Material-UI
const theme = createTheme();

// Mock useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ userId: '1' }),
  };
});

describe('Profile Component', () => {
  const mockProfile = {
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

  const mockCurrentUser = {
    _id: '2',
    username: 'currentuser',
    email: 'current@example.com',
    profilePicture: 'https://example.com/current-avatar.jpg',
    bio: 'Current user bio',
    location: 'Current Location',
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
    vi.clearAllMocks();
    // Mock localStorage.getItem for token
    Storage.prototype.getItem = vi.fn(() => 'fake-token');
    // Mock the auth user data
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/api/auth/me')) {
        return Promise.resolve({ data: { ...mockProfile, id: mockProfile._id } });
      }
      if (url.includes('/api/profile/1')) {
        return Promise.resolve({ data: mockProfile });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  it('renders profile information correctly', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockProfile });

    renderProfile();

    await waitFor(() => {
      expect(screen.getByText(mockProfile.username)).toBeInTheDocument();
      expect(screen.getByText(mockProfile.bio)).toBeInTheDocument();
      expect(screen.getByText(mockProfile.location)).toBeInTheDocument();
    });

    const profileImage = screen.getByAltText(`${mockProfile.username}'s profile`) as HTMLImageElement;
    expect(profileImage.src).toBe(mockProfile.profilePicture);
  });

  it('shows follow button for other users profiles', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockProfile });
    mockedAxios.get.mockResolvedValueOnce({ data: mockCurrentUser });

    renderProfile();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /follow/i })).toBeInTheDocument();
    });
  });

  it('handles follow action correctly', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockProfile });
    mockedAxios.get.mockResolvedValueOnce({ data: mockCurrentUser });
    mockedAxios.post.mockResolvedValueOnce({ data: { ...mockProfile, followers: [mockCurrentUser._id] } });

    renderProfile();

    await waitFor(() => {
      const followButton = screen.getByRole('button', { name: /follow/i });
      fireEvent.click(followButton);
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /unfollow/i })).toBeInTheDocument();
    });
  });

  it('handles unfollow action correctly', async () => {
    const profileWithFollower = {
      ...mockProfile,
      followers: [mockCurrentUser._id]
    };

    mockedAxios.get.mockResolvedValueOnce({ data: profileWithFollower });
    mockedAxios.get.mockResolvedValueOnce({ data: mockCurrentUser });
    mockedAxios.post.mockResolvedValueOnce({ data: mockProfile });

    renderProfile();

    await waitFor(() => {
      const unfollowButton = screen.getByRole('button', { name: /unfollow/i });
      fireEvent.click(unfollowButton);
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /follow/i })).toBeInTheDocument();
    });
  });

  it('shows edit button for own profile', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockCurrentUser });
    mockedAxios.get.mockResolvedValueOnce({ data: mockCurrentUser });

    renderProfile();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
    });
  });

  it('handles profile loading state', () => {
    mockedAxios.get.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    renderProfile();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('handles profile error state', async () => {
    const errorMessage = 'Failed to load profile';
    mockedAxios.get.mockRejectedValueOnce({ response: { data: { message: errorMessage } } });

    renderProfile();

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('displays correct follower and following counts', async () => {
    const userWithFollowers = {
      ...mockProfile,
      followers: ['1', '2', '3'],
      following: ['1', '2']
    };

    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/api/auth/me')) {
        return Promise.resolve({ data: mockProfile });
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