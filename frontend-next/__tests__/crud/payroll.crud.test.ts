import { api } from '@/lib/api';

jest.mock('@/lib/api');

describe('Payroll CRUD Operations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.setItem('access_token', 'test-token');
    });

    describe('CREATE - Generating Payroll', () => {
        test('creates monthly payroll record', async () => {
            const payrollData = {
                employee_id: 'EMP001',
                month: '2024-01',
                basic_salary: 50000,
                allowances: 10000,
                deductions: 2000,
                net_salary: 58000,
            };

            const created = { id: 1, ...payrollData };
            (api.post as jest.Mock).mockResolvedValueOnce(created);

            const result = await api.post('/api/payroll/', payrollData);

            expect(result.employee_id).toBe('EMP001');
            expect(result.net_salary).toBe(58000);
        });

        test('generates payroll for multiple employees', async () => {
            const bulkData = {
                month: '2024-01',
                employee_ids: ['EMP001', 'EMP002', 'EMP003'],
            };

            (api.post as jest.Mock).mockResolvedValueOnce({
                generated: 3,
                month: '2024-01',
            });

            const result = await api.post('/api/payroll/generate', bulkData);

            expect(result.generated).toBe(3);
        });

        test('includes overtime in payroll', async () => {
            const withOvertime = {
                employee_id: 'EMP001',
                month: '2024-01',
                basic_salary: 50000,
                overtime_hours: 15,
                overtime_rate: 500,
                overtime_pay: 7500,
            };

            (api.post as jest.Mock).mockResolvedValueOnce({ id: 1, ...withOvertime });

            const result = await api.post('/api/payroll/', withOvertime);

            expect(result.overtime_pay).toBe(7500);
        });

        test('applies deductions for absences', async () => {
            const withDeductions = {
                employee_id: 'EMP001',
                month: '2024-01',
                basic_salary: 50000,
                absent_days: 3,
                absence_deduction: 4500,
            };

            (api.post as jest.Mock).mockResolvedValueOnce({ id: 1, ...withDeductions });

            const result = await api.post('/api/payroll/', withDeductions);

            expect(result.absence_deduction).toBe(4500);
        });

        test('prevents duplicate payroll for same month', async () => {
            const duplicate = {
                employee_id: 'EMP001',
                month: '2024-01',
            };

            (api.post as jest.Mock).mockRejectedValueOnce({
                status: 400,
                message: 'Payroll already exists for this month',
            });

            await expect(api.post('/api/payroll/', duplicate)).rejects.toMatchObject({
                status: 400,
            });
        });
    });

    describe('READ - Viewing Payroll', () => {
        test('fetches payroll for specific month', async () => {
            const monthlyPayroll = [
                { id: 1, employee_id: 'EMP001', month: '2024-01', net_salary: 58000 },
                { id: 2, employee_id: 'EMP002', month: '2024-01', net_salary: 52000 },
            ];

            (api.get as jest.Mock).mockResolvedValueOnce(monthlyPayroll);

            const result = await api.get('/api/payroll/', {
                query: { month: '2024-01' },
            });

            expect(result).toHaveLength(2);
        });

        test('fetches payroll for specific employee', async () => {
            const employeePayroll = [
                { id: 1, employee_id: 'EMP001', month: '2024-01', net_salary: 58000 },
                { id: 2, employee_id: 'EMP001', month: '2023-12', net_salary: 56000 },
            ];

            (api.get as jest.Mock).mockResolvedValueOnce(employeePayroll);

            const result = await api.get('/api/payroll/employee/EMP001');

            result.forEach((p: any) => expect(p.employee_id).toBe('EMP001'));
        });

        test('fetches payroll summary', async () => {
            const summary = {
                month: '2024-01',
                total_employees: 50,
                total_payroll: 2900000,
                total_deductions: 100000,
                total_allowances: 500000,
            };

            (api.get as jest.Mock).mockResolvedValueOnce(summary);

            const result = await api.get('/api/payroll/summary', {
                query: { month: '2024-01' },
            });

            expect(result.total_employees).toBe(50);
            expect(result.total_payroll).toBe(2900000);
        });

        test('fetches single payroll record', async () => {
            const payroll = {
                id: 1,
                employee_id: 'EMP001',
                month: '2024-01',
                basic_salary: 50000,
                allowances: 10000,
                deductions: 2000,
                net_salary: 58000,
            };

            (api.get as jest.Mock).mockResolvedValueOnce(payroll);

            const result = await api.get('/api/payroll/1');

            expect(result.net_salary).toBe(58000);
        });
    });

    describe('UPDATE - Modifying Payroll', () => {
        test('updates allowances', async () => {
            const update = {
                allowances: 12000,
                net_salary: 60000,
            };

            (api.put as jest.Mock).mockResolvedValueOnce({
                id: 1,
                employee_id: 'EMP001',
                ...update,
            });

            const result = await api.put('/api/payroll/1', update);

            expect(result.allowances).toBe(12000);
            expect(result.net_salary).toBe(60000);
        });

        test('updates deductions', async () => {
            const update = {
                deductions: 3000,
                deduction_reason: 'Loan installment',
            };

            (api.put as jest.Mock).mockResolvedValueOnce({
                id: 1,
                ...update,
            });

            const result = await api.put('/api/payroll/1', update);

            expect(result.deductions).toBe(3000);
            expect(result.deduction_reason).toBe('Loan installment');
        });

        test('recalculates net salary', async () => {
            const recalculate = {
                basic_salary: 55000,
                allowances: 11000,
                deductions: 2500,
            };

            (api.put as jest.Mock).mockResolvedValueOnce({
                id: 1,
                ...recalculate,
                net_salary: 63500,
            });

            const result = await api.put('/api/payroll/1/recalculate', recalculate);

            expect(result.net_salary).toBe(63500);
        });

        test('approves payroll record', async () => {
            const approval = {
                status: 'Approved',
                approved_by: 'admin',
                approved_at: '2024-01-25T10:00:00',
            };

            (api.put as jest.Mock).mockResolvedValueOnce({
                id: 1,
                ...approval,
            });

            const result = await api.put('/api/payroll/1/approve', approval);

            expect(result.status).toBe('Approved');
        });

        test('prevents update of approved payroll', async () => {
            (api.put as jest.Mock).mockRejectedValueOnce({
                status: 403,
                message: 'Cannot modify approved payroll',
            });

            await expect(api.put('/api/payroll/1', { allowances: 15000 })).rejects.toMatchObject({
                status: 403,
            });
        });
    });

    describe('DELETE - Removing Payroll', () => {
        test('deletes draft payroll record', async () => {
            (api.del as jest.Mock).mockResolvedValueOnce({ success: true });

            await api.del('/api/payroll/1');

            expect(api.del).toHaveBeenCalledWith('/api/payroll/1');
        });

        test('prevents deletion of approved payroll', async () => {
            (api.del as jest.Mock).mockRejectedValueOnce({
                status: 403,
                message: 'Cannot delete approved payroll',
            });

            await expect(api.del('/api/payroll/1')).rejects.toMatchObject({
                status: 403,
            });
        });

        test('deletes all draft payroll for month', async () => {
            (api.del as jest.Mock).mockResolvedValueOnce({
                deleted: 10,
                month: '2024-01',
            });

            const result = await api.del('/api/payroll/month/2024-01');

            expect(result.deleted).toBe(10);
        });
    });

    describe('Advanced Operations', () => {
        test('exports payroll to PDF', async () => {
            (api.get as jest.Mock).mockResolvedValueOnce({
                file_url: '/exports/payroll_2024-01.pdf',
            });

            const result = await api.get('/api/payroll/export/pdf', {
                query: { month: '2024-01' },
            });

            expect(result.file_url).toContain('.pdf');
        });

        test('generates pay slips', async () => {
            (api.post as jest.Mock).mockResolvedValueOnce({
                generated: 50,
                month: '2024-01',
            });

            const result = await api.post('/api/payroll/pay-slips', {
                month: '2024-01',
            });

            expect(result.generated).toBe(50);
        });

        test('calculates tax deductions', async () => {
            const taxData = {
                employee_id: 'EMP001',
                month: '2024-01',
                gross_salary: 58000,
            };

            (api.post as jest.Mock).mockResolvedValueOnce({
                income_tax: 3480,
                social_security: 1160,
                total_tax: 4640,
            });

            const result = await api.post('/api/payroll/calculate-tax', taxData);

            expect(result.total_tax).toBe(4640);
        });
    });
});
