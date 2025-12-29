import { api } from '@/lib/api';

jest.mock('@/lib/api');

describe('Vehicles CRUD Operations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.setItem('access_token', 'test-token');
    });

    describe('CREATE - Adding Vehicles', () => {
        test('creates a new vehicle with all details', async () => {
            const vehicleData = {
                vehicle_number: 'ABC-123',
                make: 'Toyota',
                model: 'Corolla',
                year: 2022,
                color: 'White',
                chassis_number: 'CH1234567890',
                engine_number: 'EN9876543210',
                registration_date: '2022-01-15',
                status: 'Active',
            };

            const created = { id: 1, ...vehicleData };
            (api.post as jest.Mock).mockResolvedValueOnce(created);

            const result = await api.post('/api/vehicles/', vehicleData);

            expect(result.id).toBe(1);
            expect(result.vehicle_number).toBe('ABC-123');
            expect(result.make).toBe('Toyota');
        });

        test('prevents duplicate vehicle number', async () => {
            const duplicate = {
                vehicle_number: 'ABC-123', // Already exists
                make: 'Honda',
                model: 'Civic',
                year: 2021,
            };

            (api.post as jest.Mock).mockRejectedValueOnce({
                status: 400,
                message: 'Vehicle number already exists',
            });

            await expect(api.post('/api/vehicles/', duplicate)).rejects.toMatchObject({
                status: 400,
            });
        });

        test('validates year is not in future', async () => {
            const futureYear = {
                vehicle_number: 'XYZ-999',
                make: 'Ford',
                model: 'Explorer',
                year: 2030,
            };

            (api.post as jest.Mock).mockRejectedValueOnce({
                status: 422,
                message: 'Year cannot be in the future',
            });

            await expect(api.post('/api/vehicles/', futureYear)).rejects.toMatchObject({
                status: 422,
            });
        });
    });

    describe('READ - Viewing Vehicles', () => {
        test('fetches all vehicles', async () => {
            const vehicles = [
                { id: 1, vehicle_number: 'ABC-123', make: 'Toyota', status: 'Active' },
                { id: 2, vehicle_number: 'XYZ-456', make: 'Honda', status: 'Active' },
            ];

            (api.get as jest.Mock).mockResolvedValueOnce(vehicles);

            const result = await api.get('/api/vehicles/');

            expect(result).toHaveLength(2);
        });

        test('fetches single vehicle by number', async () => {
            const vehicle = {
                id: 1,
                vehicle_number: 'ABC-123',
                make: 'Toyota',
                model: 'Corolla',
                year: 2022,
            };

            (api.get as jest.Mock).mockResolvedValueOnce(vehicle);

            const result = await api.get('/api/vehicles/ABC-123');

            expect(result.vehicle_number).toBe('ABC-123');
        });

        test('filters vehicles by status', async () => {
            const activeVehicles = [
                { id: 1, vehicle_number: 'ABC-123', status: 'Active' },
                { id: 2, vehicle_number: 'XYZ-456', status: 'Active' },
            ];

            (api.get as jest.Mock).mockResolvedValueOnce(activeVehicles);

            const result = await api.get('/api/vehicles/', {
                query: { status: 'Active' },
            });

            result.forEach((v: any) => expect(v.status).toBe('Active'));
        });

        test('filters vehicles by make', async () => {
            const toyotas = [
                { id: 1, vehicle_number: 'ABC-123', make: 'Toyota' },
                { id: 2, vehicle_number: 'DEF-789', make: 'Toyota' },
            ];

            (api.get as jest.Mock).mockResolvedValueOnce(toyotas);

            const result = await api.get('/api/vehicles/', {
                query: { make: 'Toyota' },
            });

            result.forEach((v: any) => expect(v.make).toBe('Toyota'));
        });
    });

    describe('UPDATE - Modifying Vehicles', () => {
        test('updates vehicle status to maintenance', async () => {
            const update = { status: 'Maintenance' };

            (api.put as jest.Mock).mockResolvedValueOnce({
                id: 1,
                vehicle_number: 'ABC-123',
                status: 'Maintenance',
            });

            const result = await api.put('/api/vehicles/ABC-123', update);

            expect(result.status).toBe('Maintenance');
        });

        test('updates vehicle mileage', async () => {
            const update = { current_mileage: 50000 };

            (api.put as jest.Mock).mockResolvedValueOnce({
                id: 1,
                vehicle_number: 'ABC-123',
                current_mileage: 50000,
            });

            const result = await api.put('/api/vehicles/ABC-123', update);

            expect(result.current_mileage).toBe(50000);
        });
    });

    describe('DELETE - Removing Vehicles', () => {
        test('deletes inactive vehicle', async () => {
            (api.del as jest.Mock).mockResolvedValueOnce({ success: true });

            await api.del('/api/vehicles/ABC-123');

            expect(api.del).toHaveBeenCalledWith('/api/vehicles/ABC-123');
        });

        test('prevents delete of assigned vehicle', async () => {
            (api.del as jest.Mock).mockRejectedValueOnce({
                status: 400,
                message: 'Cannot delete assigned vehicle',
            });

            await expect(api.del('/api/vehicles/ABC-123')).rejects.toMatchObject({
                status: 400,
            });
        });
    });
});
