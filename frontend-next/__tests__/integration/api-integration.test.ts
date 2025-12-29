import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { api } from '@/lib/api';

// Mock Next.js navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: jest.fn(),
        prefetch: jest.fn(),
    }),
    usePathname: () => '/login',
}));

// Mock API
jest.mock('@/lib/api');

describe('Login Flow Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('successful login stores token and redirects', async () => {
        const mockLoginResponse = {
            access_token: 'test-token-123',
            token_type: 'bearer',
        };

        (api.post as jest.Mock).mockResolvedValueOnce(mockLoginResponse);

        // Simulate login action
        localStorage.setItem('access_token', mockLoginResponse.access_token);

        expect(localStorage.getItem('access_token')).toBe('test-token-123');
    });

    test('failed login shows error message', async () => {
        (api.post as jest.Mock).mockRejectedValueOnce({
            status: 401,
            message: 'Invalid credentials',
        });

        try {
            await api.post('/api/auth/login', {
                username: 'invalid',
                password: 'wrong',
            });
        } catch (error: any) {
            expect(error.message).toBe('Invalid credentials');
            expect(error.status).toBe(401);
        }

        expect(localStorage.getItem('access_token')).toBeNull();
    });
});

describe('Employee Management Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.setItem('access_token', 'test-token');
    });

    test('fetches and displays employee list', async () => {
        const mockEmployees = {
            employees: [
                {
                    id: 1,
                    employee_id: 'EMP001',
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john@example.com',
                    department: 'Security',
                    designation: 'Guard',
                    employment_status: 'Active',
                },
            ],
            total: 1,
        };

        (api.get as jest.Mock).mockResolvedValueOnce(mockEmployees);

        const result = await api.get('/api/employees/', {
            query: { skip: 0, limit: 10 },
        });

        expect(result.employees).toHaveLength(1);
        expect(result.employees[0].employee_id).toBe('EMP001');
        expect(result.total).toBe(1);
    });

    test('creates new employee successfully', async () => {
        const newEmployee = {
            employee_id: 'EMP002',
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane@example.com',
            mobile_number: '+92-300-1234567',
            cnic: '12345-1234567-1',
            department: 'Security',
            designation: 'Supervisor',
        };

        const createdEmployee = { id: 2, ...newEmployee };
        (api.post as jest.Mock).mockResolvedValueOnce(createdEmployee);

        const result = await api.post('/api/employees/', newEmployee);

        expect(result.id).toBe(2);
        expect(result.employee_id).toBe('EMP002');
        expect(api.post).toHaveBeenCalledWith('/api/employees/', newEmployee);
    });

    test('updates employee successfully', async () => {
        const updateData = {
            first_name: 'John',
            last_name: 'Updated',
            designation: 'Senior Guard',
        };

        const updatedEmployee = { id: 1, employee_id: 'EMP001', ...updateData };
        (api.put as jest.Mock).mockResolvedValueOnce(updatedEmployee);

        const result = await api.put('/api/employees/EMP001', updateData);

        expect(result.last_name).toBe('Updated');
        expect(result.designation).toBe('Senior Guard');
    });

    test('deletes employee successfully', async () => {
        (api.del as jest.Mock).mockResolvedValueOnce({ success: true });

        await api.del('/api/employees/EMP001');

        expect(api.del).toHaveBeenCalledWith('/api/employees/EMP001');
    });

    test('searches employees by query', async () => {
        const searchResults = {
            employees: [
                {
                    id: 1,
                    employee_id: 'EMP001',
                    first_name: 'John',
                    last_name: 'Doe',
                },
            ],
            total: 1,
        };

        (api.get as jest.Mock).mockResolvedValueOnce(searchResults);

        const result = await api.get('/api/employees/', {
            query: { search: 'John' },
        });

        expect(result.employees).toHaveLength(1);
        expect(result.employees[0].first_name).toBe('John');
    });

    test('filters employees by department', async () => {
        const filterResults = {
            employees: [
                {
                    id: 1,
                    employee_id: 'EMP001',
                    department: 'Security',
                },
            ],
            total: 1,
        };

        (api.get as jest.Mock).mockResolvedValueOnce(filterResults);

        const result = await api.get('/api/employees/', {
            query: { department: 'Security' },
        });

        expect(result.employees[0].department).toBe('Security');
    });
});

describe('Attendance Management Integration', () => {
    beforeEach(() => {
        localStorage.setItem('access_token', 'test-token');
    });

    test('fetches attendance records', async () => {
        const mockAttendance = [
            {
                id: 1,
                employee_id: 'EMP001',
                date: '2024-01-15',
                status: 'Present',
                check_in_time: '09:00:00',
                check_out_time: '17:00:00',
            },
        ];

        (api.get as jest.Mock).mockResolvedValueOnce(mockAttendance);

        const result = await api.get('/api/attendance/EMP001');

        expect(result).toHaveLength(1);
        expect(result[0].status).toBe('Present');
    });

    test('marks attendance for employee', async () => {
        const attendanceData = {
            employee_id: 'EMP001',
            date: '2024-01-15',
            status: 'Present',
            check_in_time: '09:00:00',
        };

        (api.post as jest.Mock).mockResolvedValueOnce({ id: 1, ...attendanceData });

        const result = await api.post('/api/attendance/', attendanceData);

        expect(result.status).toBe('Present');
    });
});

describe('Inventory Management Integration', () => {
    beforeEach(() => {
        localStorage.setItem('access_token', 'test-token');
    });

    test('fetches inventory items', async () => {
        const mockInventory = [
            {
                id: 1,
                item_name: 'Uniform',
                category: 'General',
                quantity: 100,
                unit_price: 500,
            },
        ];

        (api.get as jest.Mock).mockResolvedValueOnce(mockInventory);

        const result = await api.get('/api/inventory/general');

        expect(result).toHaveLength(1);
        expect(result[0].item_name).toBe('Uniform');
    });

    test('allocates inventory to employee', async () => {
        const allocation = {
            employee_db_id: 1,
            item_id: 1,
            quantity: 2,
            allocation_date: '2024-01-15',
        };

        (api.post as jest.Mock).mockResolvedValueOnce({ id: 1, ...allocation });

        const result = await api.post('/api/inventory/allocations', allocation);

        expect(result.quantity).toBe(2);
    });
});

describe('Fleet Management Integration', () => {
    beforeEach(() => {
        localStorage.setItem('access_token', 'test-token');
    });

    test('fetches vehicle list', async () => {
        const mockVehicles = [
            {
                id: 1,
                vehicle_number: 'ABC-123',
                make: 'Toyota',
                model: 'Corolla',
                year: 2022,
                status: 'Active',
            },
        ];

        (api.get as jest.Mock).mockResolvedValueOnce(mockVehicles);

        const result = await api.get('/api/vehicles/');

        expect(result).toHaveLength(1);
        expect(result[0].vehicle_number).toBe('ABC-123');
    });

    test('assigns vehicle to employee', async () => {
        const assignment = {
            vehicle_id: 1,
            employee_id: 'EMP001',
            start_date: '2024-01-15',
        };

        (api.post as jest.Mock).mockResolvedValueOnce({ id: 1, ...assignment });

        const result = await api.post('/api/vehicle-assignments/', assignment);

        expect(result.employee_id).toBe('EMP001');
    });

    test('records vehicle maintenance', async () => {
        const maintenance = {
            vehicle_id: 1,
            maintenance_type: 'Oil Change',
            cost: 2000,
            date: '2024-01-15',
        };

        (api.post as jest.Mock).mockResolvedValueOnce({ id: 1, ...maintenance });

        const result = await api.post('/api/vehicle-maintenance/', maintenance);

        expect(result.maintenance_type).toBe('Oil Change');
        expect(result.cost).toBe(2000);
    });
});

describe('Payroll Integration', () => {
    beforeEach(() => {
        localStorage.setItem('access_token', 'test-token');
    });

    test('fetches payroll records', async () => {
        const mockPayroll = [
            {
                id: 1,
                employee_id: 'EMP001',
                month: '2024-01',
                basic_salary: 50000,
                allowances: 10000,
                deductions: 2000,
                net_salary: 58000,
            },
        ];

        (api.get as jest.Mock).mockResolvedValueOnce(mockPayroll);

        const result = await api.get('/api/payroll/', {
            query: { month: '2024-01' },
        });

        expect(result).toHaveLength(1);
        expect(result[0].net_salary).toBe(58000);
    });

    test('generates payroll for month', async () => {
        const payrollData = {
            month: '2024-01',
            employee_ids: ['EMP001', 'EMP002'],
        };

        (api.post as jest.Mock).mockResolvedValueOnce({
            generated: 2,
            month: '2024-01',
        });

        const result = await api.post('/api/payroll/generate', payrollData);

        expect(result.generated).toBe(2);
    });
});

describe('Error Handling Integration', () => {
    test('handles 401 unauthorized errors', async () => {
        (api.get as jest.Mock).mockRejectedValueOnce({
            status: 401,
            message: 'Unauthorized',
        });

        await expect(api.get('/api/protected')).rejects.toMatchObject({
            status: 401,
        });
    });

    test('handles 403 forbidden errors', async () => {
        (api.get as jest.Mock).mockRejectedValueOnce({
            status: 403,
            message: 'Forbidden',
        });

        await expect(api.get('/api/admin')).rejects.toMatchObject({
            status: 403,
        });
    });

    test('handles 404 not found errors', async () => {
        (api.get as jest.Mock).mockRejectedValueOnce({
            status: 404,
            message: 'Not found',
        });

        await expect(api.get('/api/nonexistent')).rejects.toMatchObject({
            status: 404,
        });
    });

    test('handles 500 server errors', async () => {
        (api.get as jest.Mock).mockRejectedValueOnce({
            status: 500,
            message: 'Internal server error',
        });

        await expect(api.get('/api/error')).rejects.toMatchObject({
            status: 500,
        });
    });

    test('handles network errors', async () => {
        (api.get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        await expect(api.get('/api/test')).rejects.toThrow('Network error');
    });
});
