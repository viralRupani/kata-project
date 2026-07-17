import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute, AdminRoute } from './RouteGuards.js';

// Controllable mock of the auth context for each scenario.
const authState = { isAuthenticated: false, isAdmin: false, isLoading: false };
vi.mock('../context/AuthContext.js', () => ({
  useAuth: () => authState,
}));

const renderWithRouter = (initial = '/private') =>
  render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route path="/login" element={<div>Login Screen</div>} />
        <Route path="/" element={<div>Dashboard</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/private" element={<div>Secret Content</div>} />
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<div>Admin Panel</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe('ProtectedRoute', () => {
  it('redirects an unauthenticated user to /login', () => {
    Object.assign(authState, { isAuthenticated: false, isLoading: false });
    renderWithRouter('/private');
    expect(screen.getByText('Login Screen')).toBeInTheDocument();
    expect(screen.queryByText('Secret Content')).not.toBeInTheDocument();
  });

  it('renders the protected content for an authenticated user', () => {
    Object.assign(authState, { isAuthenticated: true, isLoading: false });
    renderWithRouter('/private');
    expect(screen.getByText('Secret Content')).toBeInTheDocument();
  });

  it('shows a loader while the session is restoring', () => {
    Object.assign(authState, { isAuthenticated: false, isLoading: true });
    const { container } = renderWithRouter('/private');
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });
});

describe('AdminRoute', () => {
  it('sends a non-admin back to the dashboard', () => {
    Object.assign(authState, { isAdmin: false, isLoading: false });
    renderWithRouter('/admin');
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
  });

  it('allows an admin through', () => {
    Object.assign(authState, { isAdmin: true, isLoading: false });
    renderWithRouter('/admin');
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });
});
