import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider } from './AuthContext';
import { BookmarksProvider, useBookmarks } from './BookmarksContext';

// Built inside each test: CRA's Jest resets mocks before every test, which would otherwise
// wipe implementations defined at module load.
const authWithUser = () => ({
  me: jest.fn().mockResolvedValue({ user: { id: '1', email: 'a@x.com' } }),
  login: jest.fn(), logout: jest.fn(), signup: jest.fn(),
});
const authNoUser = () => ({
  me: jest.fn().mockRejectedValue(new Error('401')),
  login: jest.fn(), logout: jest.fn(), signup: jest.fn(),
});

function Probe() {
  const { bookmarks, isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  return (
    <div>
      <span data-testid="count">{bookmarks.length}</span>
      <span data-testid="hasP1">{String(isBookmarked('p1'))}</span>
      <button onClick={() => addBookmark({ id: 'p2', title: 'Two' })}>add</button>
      <button onClick={() => removeBookmark('p1')}>remove</button>
    </div>
  );
}

const setup = (authApi, bookmarksApi) =>
  render(
    <AuthProvider api={authApi}>
      <BookmarksProvider api={bookmarksApi}><Probe /></BookmarksProvider>
    </AuthProvider>
  );

test('loads the user\'s bookmarks when authenticated', async () => {
  const bm = {
    listBookmarks: jest.fn().mockResolvedValue({ bookmarks: [{ id: 'p1', title: 'One' }] }),
    addBookmark: jest.fn(), removeBookmark: jest.fn(),
  };
  setup(authWithUser(), bm);
  await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('1'));
  expect(screen.getByTestId('hasP1').textContent).toBe('true');
});

test('does not load bookmarks when logged out', async () => {
  const bm = { listBookmarks: jest.fn().mockResolvedValue({ bookmarks: [] }), addBookmark: jest.fn(), removeBookmark: jest.fn() };
  setup(authNoUser(), bm);
  await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('0'));
  expect(bm.listBookmarks).not.toHaveBeenCalled();
});

test('addBookmark optimistically updates and calls the api', async () => {
  const bm = {
    listBookmarks: jest.fn().mockResolvedValue({ bookmarks: [{ id: 'p9' }] }),
    addBookmark: jest.fn().mockResolvedValue({ ok: true }), removeBookmark: jest.fn(),
  };
  setup(authWithUser(), bm);
  await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('1')); // load settled
  await act(async () => { screen.getByText('add').click(); });
  await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('2'));
  expect(bm.addBookmark).toHaveBeenCalled();
});

test('removeBookmark optimistically removes and calls the api', async () => {
  const bm = {
    listBookmarks: jest.fn().mockResolvedValue({ bookmarks: [{ id: 'p1' }] }),
    addBookmark: jest.fn(), removeBookmark: jest.fn().mockResolvedValue({ ok: true }),
  };
  setup(authWithUser(), bm);
  await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('1'));
  await act(async () => { screen.getByText('remove').click(); });
  await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('0'));
  expect(bm.removeBookmark).toHaveBeenCalledWith('p1');
});
