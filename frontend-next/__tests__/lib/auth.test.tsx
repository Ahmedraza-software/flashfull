import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

// Mock the API module
jest.mock('@/lib/api');

const mockApi = api as jest.Mocked<typeof api>;

// Test component that uses the auth hook
function TestConsumer() {
    const { user, roles, permissions, loading, has } = useAuth();

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div data-testid="user-email">{user?.email || 'No user'}</div>
            <div data-testid="user-name">{user?.full_name || 'No name'}</div>
            <div data-testid="roles">{roles.join(', ')}</div>
            <div data-testid="is-superuser">{user?.is_superuser ? 'Yes' : 'No'}</div>
            <div data-testid="has-employees-view">{has('employees:view') ? 'Yes' : 'No'}</div>
            <div data-testid="has-payroll-manage">{has('payroll:manage') ? 'Yes' : 'No'}</div>
        </div>
    );
}

describe('Auth Context and Provider', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('throws error when useAuth is used outside provider', () => {
        // Suppress console.error for this test
        const spy = jest.spyOn(console, 'error').mockImplementation(() => { });

        expect(() => {
            render(<TestConsumer />);
        }).toThrow('useAuth must be used within AuthProvider');

        spy.mockRestore();
    });

    test('shows loading state initially', async () => {
        localStorage.setItem('access_token', 'test-token');

        mockApi.get.mockImplementation(() => new Promise(() => { })); // Never resolves

        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('loads user data successfully', async () => {
        localStorage.setItem('access_token', 'test-token');

        const mockUser = {
            id: 1,
            email: 'test@example.com',
            username: 'testuser',
            full_name: 'Test User',
            is_active: true,
            is_superuser: false,
        };

        const mockRoles = ['Employee', 'Manager'];
        const mockPermissions = ['employees:view', 'attendance:manage'];

        mockApi.get
            .mockResolvedValueOnce(mockUser)
            .mockResolvedValueOnce(mockRoles)
            .mockResolvedValueOnce(mockPermissions);

        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
        });

        expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
        expect(screen.getByTestId('roles')).toHaveTextContent('Employee, Manager');
        expect(screen.getByTestId('has-employees-view')).toHaveTextContent('Yes');
        expect(screen.getByTestId('has-payroll-manage')).toHaveTextContent('No');
    });

    test('clears user data when no token exists', async () => {
        // No token in localStorage

        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
        });

        expect(screen.getByTestId('roles')).toHaveTextContent('');
    });

    test('superuser has all permissions', async () => {
        localStorage.setItem('access_token', 'test-token');

        const mockUser = {
            id: 1,
            email: 'admin@example.com',
            username: 'admin',
            full_name: 'Admin User',
            is_active: true,
            is_superuser: true,
        };

        mockApi.get
            .mockResolvedValueOnce(mockUser)
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([]);

        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('is-superuser')).toHaveTextContent('Yes');
        });

        expect(screen.getByTestId('has-employees-view')).toHaveTextContent('Yes');
        expect(screen.getByTestId('has-payroll-manage')).toHaveTextContent('Yes');
    });

    test('handles 401 error by clearing auth', async () => {
        localStorage.setItem('access_token', 'invalid-token');

        mockApi.get.mockRejectedValueOnce({
            name: 'ApiError',
            status: 401,
            message: 'Unauthorized',
            body: {},
        });

        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
        });

        expect(localStorage.getItem('access_token')).toBeNull();
    });

    test('handles 403 error by clearing auth', async () => {
        localStorage.setItem('access_token', 'forbidden-token');

        mockApi.get.mockRejectedValueOnce({
            name: 'ApiError',
            status: 403,
            message: 'Forbidden',
            body: {},
        });

        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
        });

        expect(localStorage.getItem('access_token')).toBeNull();
    });

    test('handles network errors by clearing auth', async () => {
        localStorage.setItem('access_token', 'test-token');

        mockApi.get.mockRejectedValueOnce(new Error('Network error'));

        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
        });
    });

    test('handles non-array roles gracefully', async () => {
        localStorage.setItem('access_token', 'test-token');

        const mockUser = {
            id: 1,
            email: 'test@example.com',
            username: 'testuser',
            full_name: 'Test User',
            is_active: true,
            is_superuser: false,
        };

        mockApi.get
            .mockResolvedValueOnce(mockUser)
            .mockResolvedValueOnce(null as any) // Invalid roles
            .mockResolvedValueOnce(['employees:view']);

        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
        });

        expect(screen.getByTestId('roles')).toHaveTextContent('');
    });
});

describe('Auth logout functionality', () => {
    test('logout clears localStorage and state', async () => {
        localStorage.setItem('access_token', 'test-token');

        const mockUser = {
            id: 1,
            email: 'test@example.com',
            username: 'testuser',
            full_name: 'Test User',
            is_active: true,
            is_superuser: false,
        };

        mockApi.get
            .mockResolvedValueOnce(mockUser)
            .mockResolvedValueOnce(['Employee'])
            .mockResolvedValueOnce(['employees:view']);

        function TestLogout() {
            const { user, logout } = useAuth();
            return (
                <div>
                    <div data-testid="user-status">{user ? 'Logged in' : 'Logged out'}</div>
                    <button onClick={logout}>Logout</button>
                </div>
            );
        }

        render(
            <AuthProvider>
                <TestLogout />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in');
        });

        const logoutButton = screen.getByRole('button', { name: /logout/i });
        logoutButton.click();

        await waitFor(() => {
            expect(screen.getByTestId('user-status')).toHaveTextContent('Logged out');
        });

        expect(localStorage.getItem('access_token')).toBeNull();
    });
});

describe('Auth refresh functionality', () => {
    test('refresh reloads user data', async () => {
        localStorage.setItem('access_token', 'test-token');

        const mockUser1 = {
            id: 1,
            email: 'test1@example.com',
            username: 'testuser1',
            full_name: 'Test User 1',
            is_active: true,
            is_superuser: false,
        };

        const mockUser2 = {
            id: 1,
            email: 'test2@example.com',
            username: 'testuser2',
            full_name: 'Test User 2',
            is_active: true,
            is_superuser: false,
        };

        mockApi.get
            .mockResolvedValueOnce(mockUser1)
            .mockResolvedValueOnce(['Employee'])
            .mockResolvedValueOnce(['employees:view'])
            .mockResolvedValueOnce(mockUser2)
            .mockResolvedValueOnce(['Manager'])
            .mockResolvedValueOnce(['employees:view', 'employees:edit']);

        function TestRefresh() {
            const { user, refresh } = useAuth();
            return (
                <div>
                    <div data-testid="user-email">{user?.email || 'No user'}</div>
                    <button onClick={refresh}>Refresh</button>
                </div>
            );
        }

        render(
            <AuthProvider>
                <TestRefresh />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('user-email')).toHaveTextContent('test1@example.com');
        });

        const refreshButton = screen.getByRole('button', { name: /refresh/i });
        refreshButton.click();

        await waitFor(() => {
            expect(screen.getByTestId('user-email')).toHaveTextContent('test2@example.com');
        });
    });
});
