import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

function Probe() {
  const { user, loading, login } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? user.email : 'none'}</span>
      <button onClick={() => login('a@example.com', 'pw')}>login</button>
    </div>
  );
}

const fakeApi = (overrides) => ({
  me: jest.fn().mockRejectedValue(new Error('401')),
  login: jest.fn(),
  logout: jest.fn(),
  signup: jest.fn(),
  ...overrides,
});

test('hydrates the user from me() on mount', async () => {
  const api = fakeApi({ me: jest.fn().mockResolvedValue({ user: { id: '1', email: 'a@example.com' } }) });
  render(<AuthProvider api={api}><Probe /></AuthProvider>);
  await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
  expect(screen.getByTestId('user').textContent).toBe('a@example.com');
});

test('starts logged out when me() rejects', async () => {
  const api = fakeApi();
  render(<AuthProvider api={api}><Probe /></AuthProvider>);
  await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
  expect(screen.getByTestId('user').textContent).toBe('none');
});

test('login updates the current user', async () => {
  const api = fakeApi({ login: jest.fn().mockResolvedValue({ user: { id: '1', email: 'a@example.com' } }) });
  render(<AuthProvider api={api}><Probe /></AuthProvider>);
  await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
  await act(async () => { screen.getByText('login').click(); });
  await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('a@example.com'));
});

test('openAuth and closeAuth toggle the auth-modal flag', async () => {
  const api = fakeApi();
  let ctx;
  function Capture() { ctx = useAuth(); return null; }
  render(<AuthProvider api={api}><Capture /></AuthProvider>);
  await waitFor(() => expect(ctx.loading).toBe(false));

  expect(ctx.authModalOpen).toBe(false);
  await act(async () => { ctx.openAuth(); });
  expect(ctx.authModalOpen).toBe(true);
  await act(async () => { ctx.closeAuth(); });
  expect(ctx.authModalOpen).toBe(false);
});
