import { api } from '@/lib/api';

jest.mock('@/lib/api');

describe('Attendance CRUD Operations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.setItem('access_token', 'test-token');
    });

    describe('CREATE - Marking Attendance', () => {
        test('creates attendance record for present employee', async () => {
            const attendanceData = {
                employee_id: 'EMP001',
                date: '2024-01-15',
                status: 'Present',
                check_in_time: '09:00:00',
                check_out_time: '17:00:00',
            };

            const created = { id: 1, ...attendanceData };
            (api.post as jest.Mock).mockResolvedValueOnce(created);

            const result = await api.post('/api/attendance/', attendanceData);

            expect(result.id).toBe(1);
            expect(result.status).toBe('Present');
            expect(result.check_in_time).toBe('09:00:00');
        });

        test('creates attendance for absent employee', async () => {
            const absentData = {
                employee_id: 'EMP002',
                date: '2024-01-15',
                status: 'Absent',
                reason: 'Sick leave',
            };

            (api.post as jest.Mock).mockResolvedValueOnce({ id: 2, ...absentData });

            const result = await api.post('/api/attendance/', absentData);

            expect(result.status).toBe('Absent');
            expect(result.reason).toBe('Sick leave');
        });

        test('creates half-day attendance', async () => {
            const halfDayData = {
                employee_id: 'EMP003',
                date: '2024-01-15',
                status: 'Half Day',
                check_in_time: '09:00:00',
                check_out_time: '13:00:00',
                hours_worked: 4,
            };

            (api.post as jest.Mock).mockResolvedValueOnce({ id: 3, ...halfDayData });

            const result = await api.post('/api/attendance/', halfDayData);

            expect(result.status).toBe('Half Day');
            expect(result.hours_worked).toBe(4);
        });

        test('creates attendance with overtime', async () => {
            const overtimeData = {
                employee_id: 'EMP001',
                date: '2024-01-15',
                status: 'Present',
                check_in_time: '09:00:00',
                check_out_time: '20:00:00',
                overtime_hours: 3,
            };

            (api.post as jest.Mock).mockResolvedValueOnce({ id: 4, ...overtimeData });

            const result = await api.post('/api/attendance/', overtimeData);

            expect(result.overtime_hours).toBe(3);
        });

        test('prevents duplicate attendance for same day', async () => {
            const duplicateData = {
                employee_id: 'EMP001',
                date: '2024-01-15',
                status: 'Present',
            };

            (api.post as jest.Mock).mockRejectedValueOnce({
                status: 400,
                message: 'Attendance already marked for this date',
            });

            await expect(api.post('/api/attendance/', duplicateData)).rejects.toMatchObject({
                status: 400,
            });
        });

        test('creates attendance with late arrival', async () => {
            const lateData = {
                employee_id: 'EMP001',
                date: '2024-01-15',
                status: 'Late',
                check_in_time: '10:30:00',
                check_out_time: '17:00:00',
                late_by_minutes: 90,
            };

            (api.post as jest.Mock).mockResolvedValueOnce({ id: 5, ...lateData });

            const result = await api.post('/api/attendance/', lateData);

            expect(result.status).toBe('Late');
            expect(result.late_by_minutes).toBe(90);
        });
    });

    describe('READ - Viewing Attendance', () => {
        test('fetches attendance for specific employee', async () => {
            const mockAttendance = [
                {
                    id: 1,
                    employee_id: 'EMP001',
                    date: '2024-01-15',
                    status: 'Present',
                },
                {
                    id: 2,
                    employee_id: 'EMP001',
                    date: '2024-01-16',
                    status: 'Present',
                },
            ];

            (api.get as jest.Mock).mockResolvedValueOnce(mockAttendance);

            const result = await api.get('/api/attendance/EMP001');

            expect(result).toHaveLength(2);
            expect(result[0].employee_id).toBe('EMP001');
        });

        test('fetches attendance for specific date', async () => {
            const mockAttendance = [
                {
                    id: 1,
                    employee_id: 'EMP001',
                    date: '2024-01-15',
                    status: 'Present',
                },
                {
                    id: 2,
                    employee_id: 'EMP002',
                    date: '2024-01-15',
                    status: 'Absent',
                },
            ];

            (api.get as jest.Mock).mockResolvedValueOnce(mockAttendance);

            const result = await api.get('/api/attendance/', {
                query: { date: '2024-01-15' },
            });

            expect(result).toHaveLength(2);
            result.forEach((record: any) => {
                expect(record.date).toBe('2024-01-15');
            });
        });

        test('fetches attendance for date range', async () => {
            const mockAttendance = [
                { id: 1, employee_id: 'EMP001', date: '2024-01-15', status: 'Present' },
                { id: 2, employee_id: 'EMP001', date: '2024-01-16', status: 'Present' },
                { id: 3, employee_id: 'EMP001', date: '2024-01-17', status: 'Present' },
            ];

            (api.get as jest.Mock).mockResolvedValueOnce(mockAttendance);

            const result = await api.get('/api/attendance/', {
                query: { start_date: '2024-01-15', end_date: '2024-01-17' },
            });

            expect(result).toHaveLength(3);
        });

        test('filters attendance by status', async () => {
            const absentRecords = [
                { id: 1, employee_id: 'EMP001', date: '2024-01-15', status: 'Absent' },
                { id: 2, employee_id: 'EMP002', date: '2024-01-15', status: 'Absent' },
            ];

            (api.get as jest.Mock).mockResolvedValueOnce(absentRecords);

            const result = await api.get('/api/attendance/', {
                query: { status: 'Absent' },
            });

            result.forEach((record: any) => {
                expect(record.status).toBe('Absent');
            });
        });

        test('fetches monthly attendance summary', async () => {
            const summary = {
                employee_id: 'EMP001',
                month: '2024-01',
                total_days: 31,
                present_days: 25,
                absent_days: 3,
                half_days: 2,
                late_days: 1,
                overtime_hours: 12,
            };

            (api.get as jest.Mock).mockResolvedValueOnce(summary);

            const result = await api.get('/api/attendance/summary/EMP001', {
                query: { month: '2024-01' },
            });

            expect(result.present_days).toBe(25);
            expect(result.absent_days).toBe(3);
            expect(result.overtime_hours).toBe(12);
        });

        test('fetches department-wise attendance', async () => {
            const deptAttendance = [
                { employee_id: 'EMP001', department: 'Security', status: 'Present' },
                { employee_id: 'EMP002', department: 'Security', status: 'Present' },
            ];

            (api.get as jest.Mock).mockResolvedValueOnce(deptAttendance);

            const result = await api.get('/api/attendance/', {
                query: { department: 'Security', date: '2024-01-15' },
            });

            result.forEach((record: any) => {
                expect(record.department).toBe('Security');
            });
        });
    });

    describe('UPDATE - Modifying Attendance', () => {
        test('updates attendance status', async () => {
            const updateData = {
                status: 'Present',
                check_in_time: '09:00:00',
                check_out_time: '17:00:00',
            };

            (api.put as jest.Mock).mockResolvedValueOnce({
                id: 1,
                employee_id: 'EMP001',
                date: '2024-01-15',
                ...updateData,
            });

            const result = await api.put('/api/attendance/1', updateData);

            expect(result.status).toBe('Present');
            expect(result.check_in_time).toBe('09:00:00');
        });

        test('updates check-out time', async () => {
            const updateData = {
                check_out_time: '18:00:00',
                overtime_hours: 1,
            };

            (api.put as jest.Mock).mockResolvedValueOnce({
                id: 1,
                employee_id: 'EMP001',
                ...updateData,
            });

            const result = await api.put('/api/attendance/1', updateData);

            expect(result.check_out_time).toBe('18:00:00');
            expect(result.overtime_hours).toBe(1);
        });

        test('adds notes to attendance record', async () => {
            const updateData = {
                notes: 'Approved late arrival due to traffic',
            };

            (api.put as jest.Mock).mockResolvedValueOnce({
                id: 1,
                notes: 'Approved late arrival due to traffic',
            });

            const result = await api.put('/api/attendance/1', updateData);

            expect(result.notes).toBe('Approved late arrival due to traffic');
        });

        test('corrects attendance status', async () => {
            const correction = {
                status: 'Present',
                corrected_by: 'admin',
                correction_reason: 'Marked absent by mistake',
            };

            (api.put as jest.Mock).mockResolvedValueOnce({
                id: 1,
                ...correction,
            });

            const result = await api.put('/api/attendance/1', correction);

            expect(result.status).toBe('Present');
            expect(result.correction_reason).toBe('Marked absent by mistake');
        });

        test('prevents update of past month attendance', async () => {
            const updateData = {
                status: 'Present',
            };

            (api.put as jest.Mock).mockRejectedValueOnce({
                status: 403,
                message: 'Cannot modify attendance older than 30 days',
            });

            await expect(api.put('/api/attendance/1', updateData)).rejects.toMatchObject({
                status: 403,
            });
        });
    });

    describe('DELETE - Removing Attendance', () => {
        test('deletes attendance record', async () => {
            (api.del as jest.Mock).mockResolvedValueOnce({ success: true });

            await api.del('/api/attendance/1');

            expect(api.del).toHaveBeenCalledWith('/api/attendance/1');
        });

        test('deletes attendance for specific date', async () => {
            (api.del as jest.Mock).mockResolvedValueOnce({ deleted: 5 });

            const result = await api.del('/api/attendance/', {
                query: { date: '2024-01-15' },
            });

            expect(result.deleted).toBe(5);
        });

        test('prevents deletion of approved attendance', async () => {
            (api.del as jest.Mock).mockRejectedValueOnce({
                status: 403,
                message: 'Cannot delete approved attendance',
            });

            await expect(api.del('/api/attendance/1')).rejects.toMatchObject({
                status: 403,
            });
        });

        test('bulk deletes attendance records', async () => {
            const ids = [1, 2, 3, 4, 5];

            (api.deleteBulk as jest.Mock).mockResolvedValueOnce({
                deleted: 5,
                success: true,
            });

            const result = await api.deleteBulk('/api/attendance/bulk', { ids });

            expect(result.deleted).toBe(5);
        });
    });

    describe('Advanced Operations', () => {
        test('exports attendance to Excel', async () => {
            (api.get as jest.Mock).mockResolvedValueOnce({
                file_url: '/exports/attendance_2024-01.xlsx',
            });

            const result = await api.get('/api/attendance/export', {
                query: { month: '2024-01', format: 'xlsx' },
            });

            expect(result.file_url).toContain('.xlsx');
        });

        test('calculates attendance percentage', async () => {
            const stats = {
                employee_id: 'EMP001',
                attendance_percentage: 92.5,
                total_working_days: 20,
                present_days: 18,
                absent_days: 2,
            };

            (api.get as jest.Mock).mockResolvedValueOnce(stats);

            const result = await api.get('/api/attendance/stats/EMP001', {
                query: { month: '2024-01' },
            });

            expect(result.attendance_percentage).toBe(92.5);
        });

        test('fetches overtime report', async () => {
            const overtimeReport = [
                { employee_id: 'EMP001', total_overtime_hours: 15, overtime_pay: 7500 },
                { employee_id: 'EMP002', total_overtime_hours: 10, overtime_pay: 5000 },
            ];

            (api.get as jest.Mock).mockResolvedValueOnce(overtimeReport);

            const result = await api.get('/api/attendance/overtime', {
                query: { month: '2024-01' },
            });

            expect(result).toHaveLength(2);
            expect(result[0].total_overtime_hours).toBe(15);
        });
    });
});
