import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const login = vi.fn();

// Mock the auth context so the form test stays isolated from network/session logic.
vi.mock('../context/AuthContext.js', () => ({
  useAuth: () => ({ login }),
}));

// Mock navigation to avoid needing a full router history assertion.
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => vi.fn() };
});

import { LoginPage } from './LoginPage.js';

const renderPage = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );

describe('LoginPage form', () => {
  beforeEach(() => login.mockReset());

  it('renders email + password fields', () => {
    renderPage();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('shows a validation error for an invalid email and does not call login', async () => {
    renderPage();
    await userEvent.type(screen.getByLabelText('Email'), 'not-an-email');
    await userEvent.type(screen.getByLabelText('Password'), 'secret');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Enter a valid email')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('calls login with valid credentials', async () => {
    login.mockResolvedValueOnce(undefined);
    renderPage();
    await userEvent.type(screen.getByLabelText('Email'), 'jane@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'Password@123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(login).toHaveBeenCalledWith('jane@example.com', 'Password@123');
  });
});
