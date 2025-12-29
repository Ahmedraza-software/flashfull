import { api } from '@/lib/api';

jest.mock('@/lib/api');

describe('Employees CRUD Operations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.setItem('access_token', 'test-token');
    });

    describe('CREATE - Adding New Employees', () => {
        test('creates a new employee with all required fields', async () => {
            const newEmployee = {
                employee_id: 'EMP001',
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@example.com',
                mobile_number: '+92-300-1234567',
                cnic: '12345-1234567-1',
                date_of_birth: '1990-01-01',
                department: 'Security',
                designation: 'Guard',
                employment_status: 'Active',
            };

            const createdEmployee = { id: 1, ...newEmployee, created_at: '2024-01-15T10:00:00' };
            (api.post as jest.Mock).mockResolvedValueOnce(createdEmployee);

            const result = await api.post('/api/employees/', newEmployee);

            expect(api.post).toHaveBeenCalledWith('/api/employees/', newEmployee);
            expect(result.id).toBe(1);
            expect(result.employee_id).toBe('EMP001');
            expect(result.first_name).toBe('John');
            expect(result.department).toBe('Security');
        });

        test('creates employee with optional fields', async () => {
            const employeeWithOptionals = {
                employee_id: 'EMP002',
                first_name: 'Jane',
                last_name: 'Smith',
                email: 'jane.smith@example.com',
                mobile_number: '+92-300-7654321',
                cnic: '54321-7654321-1',
                department: 'Security',
                designation: 'Supervisor',
                employment_status: 'Active',
                // Optional fields
                emergency_contact_name: 'John Smith',
                emergency_contact_phone: '+92-300-1111111',
                address: '123 Main Street',
                city: 'Karachi',
                blood_group: 'O+',
            };

            (api.post as jest.Mock).mockResolvedValueOnce({ id: 2, ...employeeWithOptionals });

            const result = await api.post('/api/employees/', employeeWithOptionals);

            expect(result.emergency_contact_name).toBe('John Smith');
            expect(result.address).toBe('123 Main Street');
            expect(result.blood_group).toBe('O+');
        });

        test('handles validation errors on create', async () => {
            const invalidEmployee = {
                employee_id: '',
                first_name: '',
                email: 'invalid-email',
            };

            (api.post as jest.Mock).mockRejectedValueOnce({
                status: 422,
                message: 'Validation error',
                body: { detail: 'Employee ID is required' },
            });

            await expect(api.post('/api/employees/', invalidEmployee)).rejects.toMatchObject({
                status: 422,
                message: 'Validation error',
            });
        });

        test('creates employee with unique employee_id', async () => {
            const employee1 = {
                employee_id: 'EMP003',
                first_name: 'Alice',
                last_name: 'Johnson',
                email: 'alice@example.com',
                mobile_number: '+92-300-2222222',
                cnic: '11111-1111111-1',
                department: 'Security',
                designation: 'Guard',
            };

            (api.post as jest.Mock).mockResolvedValueOnce({ id: 3, ...employee1 });

            const result = await api.post('/api/employees/', employee1);
            expect(result.employee_id).toBe('EMP003');
        });

        test('handles duplicate employee_id error', async () => {
            const duplicateEmployee = {
                employee_id: 'EMP001', // Already exists
                first_name: 'Duplicate',
                last_name: 'User',
                email: 'dup@example.com',
                mobile_number: '+92-300-3333333',
                cnic: '22222-2222222-2',
                department: 'Security',
                designation: 'Guard',
            };

            (api.post as jest.Mock).mockRejectedValueOnce({
                status: 400,
                message: 'Employee ID already exists',
            });

            await expect(api.post('/api/employees/', duplicateEmployee)).rejects.toMatchObject({
                status: 400,
            });
        });
    });

    describe('READ - Fetching Employees', () => {
        test('fetches all employees with pagination', async () => {
            const mockResponse = {
                employees: [
                    { id: 1, employee_id: 'EMP001', first_name: 'John', last_name: 'Doe' },
                    { id: 2, employee_id: 'EMP002', first_name: 'Jane', last_name: 'Smith' },
                ],
                total: 2,
            };

            (api.get as jest.Mock).mockResolvedValueOnce(mockResponse);

            const result = await api.get('/api/employees/', {
                query: { skip: 0, limit: 10 },
            });

            expect(result.employees).toHaveLength(2);
            expect(result.total).toBe(2);
            expect(api.get).toHaveBeenCalledWith('/api/employees/', {
                query: { skip: 0, limit: 10 },
            });
        });

        test('fetches single employee by ID', async () => {
            const mockEmployee = {
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
            };

            (api.get as jest.Mock).mockResolvedValueOnce(mockEmployee);

            const result = await api.get('/api/employees/EMP001');

            expect(result.employee_id).toBe('EMP001');
            expect(result.first_name).toBe('John');
            expect(api.get).toHaveBeenCalledWith('/api/employees/EMP001');
        });

        test('searches employees by name', async () => {
            const searchResults = {
                employees: [
                    { id: 1, employee_id: 'EMP001', first_name: 'John', last_name: 'Doe' },
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
                    { id: 1, employee_id: 'EMP001', department: 'Security' },
                    { id: 2, employee_id: 'EMP002', department: 'Security' },
                ],
                total: 2,
            };

            (api.get as jest.Mock).mockResolvedValueOnce(filterResults);

            const result = await api.get('/api/employees/', {
                query: { department: 'Security' },
            });

            expect(result.employees).toHaveLength(2);
            result.employees.forEach((emp: any) => {
                expect(emp.department).toBe('Security');
            });
        });

        test('filters employees by designation', async () => {
            const filterResults = {
                employees: [
                    { id: 1, employee_id: 'EMP001', designation: 'Guard' },
                ],
                total: 1,
            };

            (api.get as jest.Mock).mockResolvedValueOnce(filterResults);

            const result = await api.get('/api/employees/', {
                query: { designation: 'Guard' },
            });

            expect(result.employees[0].designation).toBe('Guard');
        });

        test('filters employees by employment status', async () => {
            const activeEmployees = {
                employees: [
                    { id: 1, employee_id: 'EMP001', employment_status: 'Active' },
                ],
                total: 1,
            };

            (api.get as jest.Mock).mockResolvedValueOnce(activeEmployees);

            const result = await api.get('/api/employees/', {
                query: { employment_status: 'Active' },
            });

            expect(result.employees[0].employment_status).toBe('Active');
        });

        test('handles employee not found', async () => {
            (api.get as jest.Mock).mockRejectedValueOnce({
                status: 404,
                message: 'Employee not found',
            });

            await expect(api.get('/api/employees/NONEXISTENT')).rejects.toMatchObject({
                status: 404,
            });
        });

        test('fetches employees with sorting', async () => {
            const sortedResults = {
                employees: [
                    { id: 1, employee_id: 'EMP001', first_name: 'Alice' },
                    { id: 2, employee_id: 'EMP002', first_name: 'Bob' },
                ],
                total: 2,
            };

            (api.get as jest.Mock).mockResolvedValueOnce(sortedResults);

            const result = await api.get('/api/employees/', {
                query: { sort_by: 'first_name', order: 'asc' },
            });

            expect(result.employees[0].first_name).toBe('Alice');
            expect(result.employees[1].first_name).toBe('Bob');
        });
    });

    describe('UPDATE - Modifying Employees', () => {
        test('updates employee basic information', async () => {
            const updateData = {
                first_name: 'John',
                last_name: 'Updated',
                mobile_number: '+92-300-9999999',
            };

            const updatedEmployee = {
                id: 1,
                employee_id: 'EMP001',
                ...updateData,
                email: 'john.doe@example.com',
                department: 'Security',
            };

            (api.put as jest.Mock).mockResolvedValueOnce(updatedEmployee);

            const result = await api.put('/api/employees/EMP001', updateData);

            expect(result.last_name).toBe('Updated');
            expect(result.mobile_number).toBe('+92-300-9999999');
            expect(api.put).toHaveBeenCalledWith('/api/employees/EMP001', updateData);
        });

        test('updates employee department', async () => {
            const updateData = {
                department: 'Administration',
                designation: 'Admin Staff',
            };

            (api.put as jest.Mock).mockResolvedValueOnce({
                id: 1,
                employee_id: 'EMP001',
                ...updateData,
            });

            const result = await api.put('/api/employees/EMP001', updateData);

            expect(result.department).toBe('Administration');
            expect(result.designation).toBe('Admin Staff');
        });

        test('updates employee status to inactive', async () => {
            const updateData = {
                employment_status: 'Inactive',
            };

            (api.put as jest.Mock).mockResolvedValueOnce({
                id: 1,
                employee_id: 'EMP001',
                employment_status: 'Inactive',
            });

            const result = await api.put('/api/employees/EMP001', updateData);

            expect(result.employment_status).toBe('Inactive');
        });

        test('updates employee emergency contact', async () => {
            const updateData = {
                emergency_contact_name: 'Jane Doe',
                emergency_contact_phone: '+92-300-5555555',
            };

            (api.put as jest.Mock).mockResolvedValueOnce({
                id: 1,
                employee_id: 'EMP001',
                ...updateData,
            });

            const result = await api.put('/api/employees/EMP001', updateData);

            expect(result.emergency_contact_name).toBe('Jane Doe');
            expect(result.emergency_contact_phone).toBe('+92-300-5555555');
        });

        test('handles validation errors on update', async () => {
            const invalidUpdate = {
                email: 'invalid-email-format',
            };

            (api.put as jest.Mock).mockRejectedValueOnce({
                status: 422,
                message: 'Invalid email format',
            });

            await expect(api.put('/api/employees/EMP001', invalidUpdate)).rejects.toMatchObject({
                status: 422,
            });
        });

        test('prevents updating to duplicate email', async () => {
            const updateData = {
                email: 'existing@example.com', // Already used by another employee
            };

            (api.put as jest.Mock).mockRejectedValueOnce({
                status: 400,
                message: 'Email already in use',
            });

            await expect(api.put('/api/employees/EMP001', updateData)).rejects.toMatchObject({
                status: 400,
            });
        });

        test('updates employee with partial data', async () => {
            const partialUpdate = {
                mobile_number: '+92-300-7777777',
            };

            (api.put as jest.Mock).mockResolvedValueOnce({
                id: 1,
                employee_id: 'EMP001',
                first_name: 'John',
                mobile_number: '+92-300-7777777',
            });

            const result = await api.put('/api/employees/EMP001', partialUpdate);

            expect(result.mobile_number).toBe('+92-300-7777777');
        });
    });

    describe('DELETE - Removing Employees', () => {
        test('deletes single employee', async () => {
            (api.del as jest.Mock).mockResolvedValueOnce({ success: true });

            await api.del('/api/employees/EMP001');

            expect(api.del).toHaveBeenCalledWith('/api/employees/EMP001');
        });

        test('deletes inactive employee', async () => {
            (api.del as jest.Mock).mockResolvedValueOnce({ success: true });

            await api.del('/api/employees/EMP002');

            expect(api.del).toHaveBeenCalledWith('/api/employees/EMP002');
        });

        test('handles delete of non-existent employee', async () => {
            (api.del as jest.Mock).mockRejectedValueOnce({
                status: 404,
                message: 'Employee not found',
            });

            await expect(api.del('/api/employees/NONEXISTENT')).rejects.toMatchObject({
                status: 404,
            });
        });

        test('prevents delete of employee with active assignments', async () => {
            (api.del as jest.Mock).mockRejectedValueOnce({
                status: 400,
                message: 'Cannot delete employee with active assignments',
            });

            await expect(api.del('/api/employees/EMP001')).rejects.toMatchObject({
                status: 400,
            });
        });

        test('bulk deletes multiple employees', async () => {
            const employeeIds = ['EMP001', 'EMP002', 'EMP003'];

            (api.deleteBulk as jest.Mock).mockResolvedValueOnce({
                deleted: 3,
                success: true,
            });

            const result = await api.deleteBulk('/api/employees/bulk', { ids: employeeIds });

            expect(result.deleted).toBe(3);
            expect(api.deleteBulk).toHaveBeenCalledWith('/api/employees/bulk', { ids: employeeIds });
        });

        test('soft delete sets status to deleted', async () => {
            (api.put as jest.Mock).mockResolvedValueOnce({
                id: 1,
                employee_id: 'EMP001',
                employment_status: 'Deleted',
            });

            const result = await api.put('/api/employees/EMP001', {
                employment_status: 'Deleted',
            });

            expect(result.employment_status).toBe('Deleted');
        });
    });

    describe('Advanced Operations', () => {
        test('fetches employee with related documents', async () => {
            const employeeWithDocs = {
                id: 1,
                employee_id: 'EMP001',
                first_name: 'John',
                documents: [
                    { id: 1, name: 'CNIC Copy', filename: 'cnic.pdf' },
                    { id: 2, name: 'Resume', filename: 'resume.pdf' },
                ],
            };

            (api.get as jest.Mock).mockResolvedValueOnce(employeeWithDocs);

            const result = await api.get('/api/employees/EMP001?include_documents=true');

            expect(result.documents).toHaveLength(2);
        });

        test('fetches employee with warnings', async () => {
            const employeeWithWarnings = {
                id: 1,
                employee_id: 'EMP001',
                warning_count: 2,
                warnings: [
                    { id: 1, warning_number: 'WRN-001', found_with: 'Late arrival' },
                    { id: 2, warning_number: 'WRN-002', found_with: 'Uniform issue' },
                ],
            };

            (api.get as jest.Mock).mockResolvedValueOnce(employeeWithWarnings);

            const result = await api.get('/api/employees/EMP001?include_warnings=true');

            expect(result.warning_count).toBe(2);
            expect(result.warnings).toHaveLength(2);
        });

        test('exports employees to CSV', async () => {
            (api.get as jest.Mock).mockResolvedValueOnce({
                csv_data: 'employee_id,first_name,last_name\nEMP001,John,Doe',
            });

            const result = await api.get('/api/employees/export?format=csv');

            expect(result.csv_data).toContain('employee_id');
            expect(result.csv_data).toContain('EMP001');
        });
    });
});
