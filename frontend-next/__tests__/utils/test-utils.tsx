// Mock utilities for testing
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AuthProvider } from '@/lib/auth';

// Mock API responses
export const mockApiResponses = {
    user: {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        full_name: 'Test User',
        is_active: true,
        is_superuser: false,
    },

    superuser: {
        id: 2,
        email: 'admin@example.com',
        username: 'admin',
        full_name: 'Admin User',
        is_active: true,
        is_superuser: true,
    },

    employees: [
        {
            id: 1,
            employee_id: 'EMP001',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            mobile_number: '+92-300-1234567',
            cnic: '12345-1234567-1',
            department: 'Security',
            designation: 'Guard',
            employment_status: 'Active',
            created_at: '2024-01-01T00:00:00',
            warning_count: 0,
        },
        {
            id: 2,
            employee_id: 'EMP002',
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane.smith@example.com',
            mobile_number: '+92-300-7654321',
            cnic: '54321-7654321-1',
            department: 'Security',
            designation: 'Supervisor',
            employment_status: 'Active',
            created_at: '2024-01-02T00:00:00',
            warning_count: 1,
        },
    ],

    employeeListResponse: {
        employees: [
            {
                id: 1,
                employee_id: 'EMP001',
                first_name: 'John',
                last_name: 'Doe',
                department: 'Security',
                designation: 'Guard',
                employment_status: 'Active',
            },
        ],
        total: 1,
    },

    roles: ['Employee', 'Guard'],

    permissions: ['employees:view', 'attendance:manage'],

    attendanceRecords: [
        {
            id: 1,
            employee_id: 'EMP001',
            date: '2024-01-15',
            status: 'Present',
            check_in_time: '09:00:00',
            check_out_time: '17:00:00',
        },
    ],

    vehicles: [
        {
            id: 1,
            vehicle_number: 'ABC-123',
            make: 'Toyota',
            model: 'Corolla',
            year: 2022,
            status: 'Active',
        },
    ],

    clients: [
        {
            id: 1,
            name: 'Test Client',
            contact_person: 'John Manager',
            email: 'contact@testclient.com',
            phone: '+92-300-1111111',
            address: '123 Test Street',
        },
    ],
};

// Mock fetch for API calls
export function mockFetch(response: any, status = 200, ok = true) {
    global.fetch = jest.fn().mockResolvedValue({
        ok,
        status,
        text: async () => JSON.stringify(response),
        json: async () => response,
    });
}

export function mockFetchError(status = 500, message = 'Server error') {
    global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status,
        text: async () => JSON.stringify({ detail: message }),
    });
}

// Custom render with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    withAuth?: boolean;
}

export function renderWithProviders(
    ui: ReactElement,
    { withAuth = true, ...options }: CustomRenderOptions = {}
) {
    function Wrapper({ children }: { children: React.ReactNode }) {
        if (withAuth) {
            return <AuthProvider>{children}</AuthProvider>;
        }
        return <>{children}</>;
    }

    return render(ui, { wrapper: Wrapper, ...options });
}

// Mock localStorage
export function setupLocalStorage() {
    let store: Record<string, string> = {};

    const mockLocalStorage = {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
            store[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            store = {};
        }),
    };

    Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
    });

    return mockLocalStorage;
}

// Mock router
export function mockRouter(pathname = '/') {
    const push = jest.fn();
    const replace = jest.fn();
    const prefetch = jest.fn();
    const back = jest.fn();
    const forward = jest.fn();

    jest.mock('next/navigation', () => ({
        useRouter: () => ({
            push,
            replace,
            prefetch,
            back,
            forward,
            pathname,
        }),
        usePathname: () => pathname,
        useSearchParams: () => new URLSearchParams(),
    }));

    return { push, replace, prefetch, back, forward };
}

// Utility to wait for async updates
export async function waitForAsync() {
    await new Promise(resolve => setTimeout(resolve, 0));
}

// Mock auth context values
export const mockAuthContext = {
    authenticated: {
        user: mockApiResponses.user,
        roles: mockApiResponses.roles,
        permissions: new Set(mockApiResponses.permissions),
        loading: false,
        refresh: jest.fn(),
        logout: jest.fn(),
        has: jest.fn((perm: string) => mockApiResponses.permissions.includes(perm)),
    },

    superuser: {
        user: mockApiResponses.superuser,
        roles: ['Admin'],
        permissions: new Set(),
        loading: false,
        refresh: jest.fn(),
        logout: jest.fn(),
        has: jest.fn(() => true),
    },

    unauthenticated: {
        user: null,
        roles: [],
        permissions: new Set(),
        loading: false,
        refresh: jest.fn(),
        logout: jest.fn(),
        has: jest.fn(() => false),
    },

    loading: {
        user: null,
        roles: [],
        permissions: new Set(),
        loading: true,
        refresh: jest.fn(),
        logout: jest.fn(),
        has: jest.fn(() => false),
    },
};

// Re-export everything from testing library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
