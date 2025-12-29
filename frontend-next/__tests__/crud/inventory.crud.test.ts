import { api } from '@/lib/api';

jest.mock('@/lib/api');

describe('Inventory CRUD Operations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.setItem('access_token', 'test-token');
    });

    describe('CREATE - Adding Inventory Items', () => {
        test('creates general inventory item', async () => {
            const itemData = {
                item_name: 'Uniform',
                category: 'General',
                quantity: 100,
                unit_price: 500,
                unit: 'pcs',
                description: 'Security guard uniform',
            };

            const created = { id: 1, ...itemData };
            (api.post as jest.Mock).mockResolvedValueOnce(created);

            const result = await api.post('/api/inventory/general', itemData);

            expect(result.item_name).toBe('Uniform');
            expect(result.quantity).toBe(100);
        });

        test('creates restricted inventory item', async () => {
            const weaponData = {
                item_name: 'Rifle',
                category: 'Restricted',
                weapon_type: 'Firearm',
                serial_number: 'WPN-12345',
                quantity: 10,
            };

            const created = { id: 1, ...weaponData };
            (api.post as jest.Mock).mockResolvedValueOnce(created);

            const result = await api.post('/api/inventory/restricted', weaponData);

            expect(result.item_name).toBe('Rifle');
            expect(result.serial_number).toBe('WPN-12345');
        });

        test('validates minimum quantity', async () => {
            const invalidData = {
                item_name: 'Test Item',
                quantity: -5,
            };

            (api.post as jest.Mock).mockRejectedValueOnce({
                status: 422,
                message: 'Quantity must be positive',
            });

            await expect(api.post('/api/inventory/general', invalidData)).rejects.toMatchObject({
                status: 422,
            });
        });
    });

    describe('READ - Viewing Inventory', () => {
        test('fetches all general inventory items', async () => {
            const items = [
                { id: 1, item_name: 'Uniform', quantity: 100, category: 'General' },
                { id: 2, item_name: 'Boots', quantity: 50, category: 'General' },
            ];

            (api.get as jest.Mock).mockResolvedValueOnce(items);

            const result = await api.get('/api/inventory/general');

            expect(result).toHaveLength(2);
        });

        test('filters by low stock', async () => {
            const lowStockItems = [
                { id: 1, item_name: 'Uniform', quantity: 5, min_quantity: 20 },
            ];

            (api.get as jest.Mock).mockResolvedValueOnce(lowStockItems);

            const result = await api.get('/api/inventory/general', {
                query: { low_stock: true },
            });

            expect(result[0].quantity).toBeLessThan(result[0].min_quantity);
        });

        test('fetches restricted inventory with serial numbers', async () => {
            const restrictedItems = [
                { id: 1, item_name: 'Rifle', serial_number: 'WPN-001', allocated: false },
                { id: 2, item_name: 'Pistol', serial_number: 'WPN-002', allocated: true },
            ];

            (api.get as jest.Mock).mockResolvedValueOnce(restrictedItems);

            const result = await api.get('/api/inventory/restricted');

            expect(result).toHaveLength(2);
        });
    });

    describe('UPDATE - Modifying Inventory', () => {
        test('updates item quantity', async () => {
            const update = { quantity: 150 };

            (api.put as jest.Mock).mockResolvedValueOnce({
                id: 1,
                item_name: 'Uniform',
                quantity: 150,
            });

            const result = await api.put('/api/inventory/general/1', update);

            expect(result.quantity).toBe(150);
        });

        test('updates item price', async () => {
            const update = { unit_price: 550 };

            (api.put as jest.Mock).mockResolvedValueOnce({
                id: 1,
                unit_price: 550,
            });

            const result = await api.put('/api/inventory/general/1', update);

            expect(result.unit_price).toBe(550);
        });

        test('adjusts stock quantity', async () => {
            const adjustment = {
                quantity_change: -10,
                reason: 'Damaged items',
            };

            (api.post as jest.Mock).mockResolvedValueOnce({
                id: 1,
                new_quantity: 90,
                adjustment: -10,
            });

            const result = await api.post('/api/inventory/general/1/adjust', adjustment);

            expect(result.new_quantity).toBe(90);
        });
    });

    describe('DELETE - Removing Inventory', () => {
        test('deletes inventory item', async () => {
            (api.del as jest.Mock).mockResolvedValueOnce({ success: true });

            await api.del('/api/inventory/general/1');

            expect(api.del).toHaveBeenCalledWith('/api/inventory/general/1');
        });

        test('prevents deletion of allocated items', async () => {
            (api.del as jest.Mock).mockRejectedValueOnce({
                status: 400,
                message: 'Cannot delete allocated inventory',
            });

            await expect(api.del('/api/inventory/restricted/1')).rejects.toMatchObject({
                status: 400,
            });
        });
    });

    describe('Allocation Operations', () => {
        test('allocates item to employee', async () => {
            const allocation = {
                employee_db_id: 1,
                item_id: 1,
                quantity: 2,
                allocation_date: '2024-01-15',
            };

            (api.post as jest.Mock).mockResolvedValueOnce({
                id: 1,
                ...allocation,
            });

            const result = await api.post('/api/inventory/allocations', allocation);

            expect(result.quantity).toBe(2);
        });

        test('returns allocated item', async () => {
            const returnData = {
                allocation_id: 1,
                return_date: '2024-02-15',
                condition: 'Good',
            };

            (api.post as jest.Mock).mockResolvedValueOnce({
                success: true,
                returned: true,
            });

            const result = await api.post('/api/inventory/allocations/1/return', returnData);

            expect(result.returned).toBe(true);
        });
    });
});
