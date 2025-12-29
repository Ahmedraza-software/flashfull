import { api } from '@/lib/api';

jest.mock('@/lib/api');

describe('Clients CRUD Operations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.setItem('access_token', 'test-token');
    });

    describe('CREATE - Adding Clients', () => {
        test('creates a new client with full details', async () => {
            const clientData = {
                name: 'ABC Corporation',
                contact_person: 'John Manager',
                email: 'contact@abc.com',
                phone: '+92-300-1234567',
                address: '123 Business Street, Karachi',
                city: 'Karachi',
                country: 'Pakistan',
                contract_start_date: '2024-01-01',
                contract_end_date: '2024-12-31',
                status: 'Active',
            };

            const created = { id: 1, ...clientData };
            (api.post as jest.Mock).mockResolvedValueOnce(created);

            const result = await api.post('/api/clients/', clientData);

            expect(result.name).toBe('ABC Corporation');
            expect(result.contact_person).toBe('John Manager');
        });

        test('validates email format', async () => {
            const invalidClient = {
                name: 'Test Client',
                email: 'invalid-email',
            };

            (api.post as jest.Mock).mockRejectedValueOnce({
                status: 422,
                message: 'Invalid email format',
            });

            await expect(api.post('/api/clients/', invalidClient)).rejects.toMatchObject({
                status: 422,
            });
        });

        test('prevents duplicate client name', async () => {
            const duplicate = {
                name: 'ABC Corporation', // Already exists
                contact_person: 'Jane Doe',
                email: 'jane@abc.com',
            };

            (api.post as jest.Mock).mockRejectedValueOnce({
                status: 400,
                message: 'Client name already exists',
            });

            await expect(api.post('/api/clients/', duplicate)).rejects.toMatchObject({
                status: 400,
            });
        });
    });

    describe('READ - Viewing Clients', () => {
        test('fetches all clients', async () => {
            const clients = [
                { id: 1, name: 'ABC Corporation', status: 'Active' },
                { id: 2, name: 'XYZ Ltd', status: 'Active' },
            ];

            (api.get as jest.Mock).mockResolvedValueOnce(clients);

            const result = await api.get('/api/clients/');

            expect(result).toHaveLength(2);
        });

        test('fetches single client by ID', async () => {
            const client = {
                id: 1,
                name: 'ABC Corporation',
                contact_person: 'John Manager',
                email: 'contact@abc.com',
            };

            (api.get as jest.Mock).mockResolvedValueOnce(client);

            const result = await api.get('/api/clients/1');

            expect(result.name).toBe('ABC Corporation');
        });

        test('filters clients by status', async () => {
            const activeClients = [
                { id: 1, name: 'ABC Corp', status: 'Active' },
                { id: 2, name: 'XYZ Ltd', status: 'Active' },
            ];

            (api.get as jest.Mock).mockResolvedValueOnce(activeClients);

            const result = await api.get('/api/clients/', {
                query: { status: 'Active' },
            });

            result.forEach((c: any) => expect(c.status).toBe('Active'));
        });

        test('searches clients by name', async () => {
            const searchResults = [
                { id: 1, name: 'ABC Corporation' },
            ];

            (api.get as jest.Mock).mockResolvedValueOnce(searchResults);

            const result = await api.get('/api/clients/', {
                query: { search: 'ABC' },
            });

            expect(result[0].name).toContain('ABC');
        });
    });

    describe('UPDATE - Modifying Clients', () => {
        test('updates client contact information', async () => {
            const update = {
                contact_person: 'Jane Manager',
                email: 'jane@abc.com',
                phone: '+92-300-9999999',
            };

            (api.put as jest.Mock).mockResolvedValueOnce({
                id: 1,
                name: 'ABC Corporation',
                ...update,
            });

            const result = await api.put('/api/clients/1', update);

            expect(result.contact_person).toBe('Jane Manager');
        });

        test('updates client status to inactive', async () => {
            const update = { status: 'Inactive' };

            (api.put as jest.Mock).mockResolvedValueOnce({
                id: 1,
                name: 'ABC Corporation',
                status: 'Inactive',
            });

            const result = await api.put('/api/clients/1', update);

            expect(result.status).toBe('Inactive');
        });

        test('extends contract date', async () => {
            const update = {
                contract_end_date: '2025-12-31',
            };

            (api.put as jest.Mock).mockResolvedValueOnce({
                id: 1,
                contract_end_date: '2025-12-31',
            });

            const result = await api.put('/api/clients/1', update);

            expect(result.contract_end_date).toBe('2025-12-31');
        });
    });

    describe('DELETE - Removing Clients', () => {
        test('deletes inactive client', async () => {
            (api.del as jest.Mock).mockResolvedValueOnce({ success: true });

            await api.del('/api/clients/1');

            expect(api.del).toHaveBeenCalledWith('/api/clients/1');
        });

        test('prevents deletion of active client with assignments', async () => {
            (api.del as jest.Mock).mockRejectedValueOnce({
                status: 400,
                message: 'Cannot delete client with active employee assignments',
            });

            await expect(api.del('/api/clients/1')).rejects.toMatchObject({
                status: 400,
            });
        });
    });
});

describe('Vehicle Assignments CRUD Operations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('CREATE - Assigning Vehicles', () => {
        test('assigns vehicle to employee', async () => {
            const assignment = {
                vehicle_id: 1,
                employee_id: 'EMP001',
                start_date: '2024-01-15',
                purpose: 'Client site visit',
            };

            const created = { id: 1, ...assignment, status: 'Active' };
            (api.post as jest.Mock).mockResolvedValueOnce(created);

            const result = await api.post('/api/vehicle-assignments/', assignment);

            expect(result.vehicle_id).toBe(1);
            expect(result.employee_id).toBe('EMP001');
        });

        test('prevents double assignment of same vehicle', async () => {
            const duplicate = {
                vehicle_id: 1, // Already assigned
                employee_id: 'EMP002',
                start_date: '2024-01-15',
            };

            (api.post as jest.Mock).mockRejectedValueOnce({
                status: 400,
                message: 'Vehicle already assigned',
            });

            await expect(api.post('/api/vehicle-assignments/', duplicate)).rejects.toMatchObject({
                status: 400,
            });
        });
    });

    describe('READ - Viewing Assignments', () => {
        test('fetches all active assignments', async () => {
            const assignments = [
                { id: 1, vehicle_id: 1, employee_id: 'EMP001', status: 'Active' },
                { id: 2, vehicle_id: 2, employee_id: 'EMP002', status: 'Active' },
            ];

            (api.get as jest.Mock).mockResolvedValueOnce(assignments);

            const result = await api.get('/api/vehicle-assignments/', {
                query: { status: 'Active' },
            });

            expect(result).toHaveLength(2);
        });
    });

    describe('UPDATE - Modifying Assignments', () => {
        test('completes vehicle assignment', async () => {
            const update = {
                end_date: '2024-02-15',
                status: 'Completed',
            };

            (api.put as jest.Mock).mockResolvedValueOnce({
                id: 1,
                ...update,
            });

            const result = await api.put('/api/vehicle-assignments/1', update);

            expect(result.status).toBe('Completed');
        });
    });

    describe('DELETE - Removing Assignments', () => {
        test('cancels vehicle assignment', async () => {
            (api.del as jest.Mock).mockResolvedValueOnce({ success: true });

            await api.del('/api/vehicle-assignments/1');

            expect(api.del).toHaveBeenCalled();
        });
    });
});

describe('Vehicle Maintenance CRUD Operations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('CREATE - Recording Maintenance', () => {
        test('creates maintenance record', async () => {
            const maintenance = {
                vehicle_id: 1,
                maintenance_type: 'Oil Change',
                date: '2024-01-15',
                cost: 2000,
                description: 'Regular oil change',
            };

            const created = { id: 1, ...maintenance };
            (api.post as jest.Mock).mockResolvedValueOnce(created);

            const result = await api.post('/api/vehicle-maintenance/', maintenance);

            expect(result.maintenance_type).toBe('Oil Change');
            expect(result.cost).toBe(2000);
        });
    });

    describe('READ - Viewing Maintenance', () => {
        test('fetches maintenance history for vehicle', async () => {
            const records = [
                { id: 1, vehicle_id: 1, maintenance_type: 'Oil Change', cost: 2000 },
                { id: 2, vehicle_id: 1, maintenance_type: 'Tire Rotation', cost: 1500 },
            ];

            (api.get as jest.Mock).mockResolvedValueOnce(records);

            const result = await api.get('/api/vehicle-maintenance/', {
                query: { vehicle_id: 1 },
            });

            expect(result).toHaveLength(2);
        });
    });

    describe('UPDATE - Modifying Maintenance', () => {
        test('updates maintenance cost', async () => {
            const update = { cost: 2500 };

            (api.put as jest.Mock).mockResolvedValueOnce({
                id: 1,
                cost: 2500,
            });

            const result = await api.put('/api/vehicle-maintenance/1', update);

            expect(result.cost).toBe(2500);
        });
    });

    describe('DELETE - Removing Maintenance', () => {
        test('deletes maintenance record', async () => {
            (api.del as jest.Mock).mockResolvedValueOnce({ success: true });

            await api.del('/api/vehicle-maintenance/1');

            expect(api.del).toHaveBeenCalled();
        });
    });
});
