import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AuthProvider } from '../../context/AuthContext';
import Login from './Login';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Create theme for Material-UI
const theme = createTheme();

describe('Login Component', () => {
  const renderLogin = () => {
    render(
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form', () => {
    renderLogin();
    expect(screen.getByRole('textbox', { name: /email address/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        token: 'fake-token',
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com'
        }
      }
    });

    renderLogin();

    fireEvent.change(screen.getByRole('textbox', { name: /email address/i }), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:5001/api/auth/login',
        {
          email: 'test@example.com',
          password: 'password123'
        }
      );
    });
  });

  it('handles login error', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Invalid credentials'
        }
      }
    });

    renderLogin();

    fireEvent.change(screen.getByRole('textbox', { name: /email address/i }), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' }
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
}); 