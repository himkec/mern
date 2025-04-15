import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ProfileEdit from './ProfileEdit';
import axios from 'axios';
import { AuthProvider } from '../../context/AuthContext';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

  const mockOnUpdate = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with initial values', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ProfileEdit
            profile={mockProfile}
            onUpdate={mockOnUpdate}
            onCancel={mockOnCancel}
          />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByDisplayValue(mockProfile.username)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockProfile.bio)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockProfile.location)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockProfile.profilePicture)).toBeInTheDocument();
  });

  it('handles form submission successfully', async () => {
    mockedAxios.put.mockResolvedValueOnce({ data: mockProfile });

    render(
      <BrowserRouter>
        <AuthProvider>
          <ProfileEdit
            profile={mockProfile}
            onUpdate={mockOnUpdate}
            onCancel={mockOnCancel}
          />
        </AuthProvider>
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        expect.stringContaining('/api/profile/'),
        expect.any(Object)
      );
      expect(mockOnUpdate).toHaveBeenCalledWith(mockProfile);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('handles form submission error', async () => {
    const errorMessage = 'Update failed';
    mockedAxios.put.mockRejectedValueOnce({ response: { data: { message: errorMessage } } });

    render(
      <BrowserRouter>
        <AuthProvider>
          <ProfileEdit
            profile={mockProfile}
            onUpdate={mockOnUpdate}
            onCancel={mockOnCancel}
          />
        </AuthProvider>
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('handles cancel button click', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ProfileEdit
            profile={mockProfile}
            onUpdate={mockOnUpdate}
            onCancel={mockOnCancel}
          />
        </AuthProvider>
      </BrowserRouter>
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows loading state during submission', async () => {
    mockedAxios.put.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <BrowserRouter>
        <AuthProvider>
          <ProfileEdit
            profile={mockProfile}
            onUpdate={mockOnUpdate}
            onCancel={mockOnCancel}
          />
        </AuthProvider>
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/saving/i)).toBeInTheDocument();
  });
}); 