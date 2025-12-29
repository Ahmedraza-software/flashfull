import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotificationDropdown from '@/components/NotificationDropdown';

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
    }),
}));

// Mock the auth hook
jest.mock('@/lib/auth', () => ({
    useAuth: () => ({
        user: {
            id: 1,
            email: 'test@example.com',
            username: 'testuser',
            full_name: 'Test User',
            is_active: true,
            is_superuser: false,
        },
        roles: ['Employee'],
        permissions: new Set(['employees:view']),
        loading: false,
        refresh: jest.fn(),
        logout: jest.fn(),
        has: jest.fn(),
    }),
}));

describe('NotificationDropdown', () => {
    test('renders notification dropdown', () => {
        render(<NotificationDropdown />);

        // The notification bell icon should be present
        const dropdown = screen.getByRole('img', { hidden: true });
        expect(dropdown).toBeInTheDocument();
    });

    test('renders with correct initial state', () => {
        const { container } = render(<NotificationDropdown />);

        // Should have the dropdown trigger
        const dropdownTrigger = container.querySelector('.ant-dropdown-trigger');
        expect(dropdownTrigger).toBeInTheDocument();
    });
});
