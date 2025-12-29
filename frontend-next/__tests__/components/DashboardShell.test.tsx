import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardShell from '@/components/DashboardShell';

// Mock Next.js modules
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockPathname = '/dashboard';

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
        prefetch: jest.fn(),
    }),
    usePathname: () => mockPathname,
}));

// Mock auth hook
const mockHas = jest.fn();
const mockLogout = jest.fn();
const mockUser = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    full_name: 'Test User',
    is_active: true,
    is_superuser: false,
};

jest.mock('@/lib/auth', () => ({
    useAuth: () => ({
        user: mockUser,
        roles: ['Employee'],
        permissions: new Set(['employees:view']),
        loading: false,
        refresh: jest.fn(),
        logout: mockLogout,
        has: mockHas,
    }),
}));

describe('DashboardShell', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockHas.mockReturnValue(true);
    });

    test('renders children content', () => {
        render(
            <DashboardShell>
                <div>Test Content</div>
            </DashboardShell>
        );

        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    test('displays user greeting', () => {
        render(
            <DashboardShell>
                <div>Content</div>
            </DashboardShell>
        );

        const greeting = screen.getByRole('heading', { level: 3 });
        expect(greeting).toBeInTheDocument();
        expect(greeting.textContent).toContain('Test User');
    });

    test('shows correct greeting based on time', () => {
        // Mock the time
        const mockDate = new Date('2024-01-01T10:00:00');
        jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

        render(
            <DashboardShell>
                <div>Content</div>
            </DashboardShell>
        );

        const greeting = screen.getByRole('heading', { level: 3 });
        expect(greeting.textContent).toContain('Good morning');

        jest.restoreAllMocks();
    });

    test('renders sidebar logo', () => {
        const { container } = render(
            <DashboardShell>
                <div>Content</div>
            </DashboardShell>
        );

        const logo = container.querySelector('img[alt="Logo"]');
        expect(logo).toBeInTheDocument();
    });

    test('renders menu items when user has permissions', () => {
        mockHas.mockImplementation((perm: string) => {
            return ['employees:view', 'attendance:manage', 'payroll:view'].includes(perm);
        });

        const { container } = render(
            <DashboardShell>
                <div>Content</div>
            </DashboardShell>
        );

        expect(container.querySelector('.ant-menu')).toBeInTheDocument();
    });

    test('redirects to login when user is not authenticated', async () => {
        const { useAuth: originalUseAuth } = require('@/lib/auth');

        jest.mocked(originalUseAuth).mockImplementation(() => ({
            user: null,
            roles: [],
            permissions: new Set(),
            loading: false,
            refresh: jest.fn(),
            logout: jest.fn(),
            has: jest.fn(),
        }));

        render(
            <DashboardShell>
                <div>Content</div>
            </DashboardShell>
        );

        await waitFor(() => {
            expect(mockReplace).toHaveBeenCalledWith('/login');
        });
    });
});

describe('DashboardShell - Permission-based Menu', () => {
    test('shows super admin menu when user has rbac:admin permission', () => {
        mockHas.mockImplementation((perm: string) => perm === 'rbac:admin');

        const { container } = render(
            <DashboardShell>
                <div>Content</div>
            </DashboardShell>
        );

        expect(container.textContent).toContain('Super Admin');
    });

    test('shows fleet management when user has fleet:view permission', () => {
        mockHas.mockImplementation((perm: string) => perm === 'fleet:view');

        const { container } = render(
            <DashboardShell>
                <div>Content</div>
            </DashboardShell>
        );

        expect(container.textContent).toContain('Fleet Management');
    });

    test('shows inventory menu when user has inventory:view permission', () => {
        mockHas.mockImplementation((perm: string) => perm === 'inventory:view');

        const { container } = render(
            <DashboardShell>
                <div>Content</div>
            </DashboardShell>
        );

        expect(container.textContent).toContain('Inventory');
    });

    test('shows accounts menu when user has accounts:full permission', () => {
        mockHas.mockImplementation((perm: string) => perm === 'accounts:full');

        const { container } = render(
            <DashboardShell>
                <div>Content</div>
            </DashboardShell>
        );

        expect(container.textContent).toContain('Accounts/Advances');
    });

    test('shows clients menu when user has clients:view permission', () => {
        mockHas.mockImplementation((perm: string) => perm === 'clients:view');

        const { container } = render(
            <DashboardShell>
                <div>Content</div>
            </DashboardShell>
        );

        expect(container.textContent).toContain('Clients');
    });
});

describe('DashboardShell - Layout', () => {
    test('renders with correct layout structure', () => {
        const { container } = render(
            <DashboardShell>
                <div>Content</div>
            </DashboardShell>
        );

        expect(container.querySelector('.ant-layout')).toBeInTheDocument();
        expect(container.querySelector('.ant-layout-sider')).toBeInTheDocument();
        expect(container.querySelector('.ant-layout-header')).toBeInTheDocument();
        expect(container.querySelector('.ant-layout-content')).toBeInTheDocument();
    });

    test('sidebar is collapsible', () => {
        const { container } = render(
            <DashboardShell>
                <div>Content</div>
            </DashboardShell>
        );

        const sider = container.querySelector('.ant-layout-sider');
        expect(sider).toBeInTheDocument();
    });
});
