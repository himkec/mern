import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import axios from 'axios';
import ProfileEdit from './ProfileEdit';
import { AuthProvider } from '../../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const theme = createTheme();

describe('ProfileEdit Component', () => {
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

  const mockOnUpdate = jest.fn();
  const mockOnCancel = jest.fn();

  const renderProfileEdit = () => {
    render(
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <AuthProvider>
            <ProfileEdit
              profile={mockProfile}
              onUpdate={mockOnUpdate}
              onCancel={mockOnCancel}
            />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'fake-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders profile edit form with initial values', () => {
    renderProfileEdit();
    
    expect(screen.getByLabelText(/username/i)).toHaveValue(mockProfile.username);
    expect(screen.getByLabelText(/bio/i)).toHaveValue(mockProfile.bio);
    expect(screen.getByLabelText(/location/i)).toHaveValue(mockProfile.location);
  });

  it('handles successful profile update', async () => {
    const updatedProfile = {
      ...mockProfile,
      username: 'newusername',
      bio: 'New bio',
      location: 'New Location'
    };

    mockedAxios.put.mockResolvedValueOnce({ data: updatedProfile });

    renderProfileEdit();

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: updatedProfile.username }
    });
    fireEvent.change(screen.getByLabelText(/bio/i), {
      target: { value: updatedProfile.bio }
    });
    fireEvent.change(screen.getByLabelText(/location/i), {
      target: { value: updatedProfile.location }
    });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        `/api/users/${mockProfile._id}`,
        expect.objectContaining({
          username: updatedProfile.username,
          bio: updatedProfile.bio,
          location: updatedProfile.location
        }),
        expect.any(Object)
      );
      expect(mockOnUpdate).toHaveBeenCalledWith(updatedProfile);
    });
  });

  it('handles profile update error', async () => {
    const error = { response: { data: { message: 'Error updating profile' } } };
    mockedAxios.put.mockRejectedValueOnce(error);

    renderProfileEdit();

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/error updating profile/i)).toBeInTheDocument();
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    renderProfileEdit();
    
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnCancel).toHaveBeenCalled();
  });
}); 