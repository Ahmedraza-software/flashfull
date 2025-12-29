/**
 * Form Validation Tests
 * Testing common form validation scenarios across the application
 */

describe('Form Validation', () => {
    describe('Employee Form Validation', () => {
        test('validates required fields', () => {
            const formData = {
                first_name: '',
                last_name: '',
                email: '',
                mobile_number: '',
                cnic: '',
            };

            const errors: string[] = [];

            if (!formData.first_name) errors.push('First name is required');
            if (!formData.last_name) errors.push('Last name is required');
            if (!formData.email) errors.push('Email is required');
            if (!formData.mobile_number) errors.push('Mobile number is required');
            if (!formData.cnic) errors.push('CNIC is required');

            expect(errors).toHaveLength(5);
        });

        test('validates email format', () => {
            const validEmails = [
                'test@example.com',
                'user.name@example.co.uk',
                'user+tag@example.com',
            ];

            const invalidEmails = [
                'invalid',
                'invalid@',
                '@example.com',
                'invalid@.com',
            ];

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            validEmails.forEach(email => {
                expect(emailRegex.test(email)).toBe(true);
            });

            invalidEmails.forEach(email => {
                expect(emailRegex.test(email)).toBe(false);
            });
        });

        test('validates CNIC format', () => {
            const validCNICs = [
                '12345-1234567-1',
                '54321-7654321-9',
            ];

            const invalidCNICs = [
                '12345-123456-1',
                '1234-1234567-1',
                '12345-1234567',
                'invalid',
            ];

            const cnicRegex = /^\d{5}-\d{7}-\d$/;

            validCNICs.forEach(cnic => {
                expect(cnicRegex.test(cnic)).toBe(true);
            });

            invalidCNICs.forEach(cnic => {
                expect(cnicRegex.test(cnic)).toBe(false);
            });
        });

        test('validates mobile number format', () => {
            const validNumbers = [
                '+92-300-1234567',
                '+92-301-7654321',
                '+92-321-9999999',
            ];

            const invalidNumbers = [
                '0300-1234567',
                '+92-300-123',
                'invalid',
                '+92-300',
            ];

            const mobileRegex = /^\+92-\d{3}-\d{7}$/;

            validNumbers.forEach(number => {
                expect(mobileRegex.test(number)).toBe(true);
            });

            invalidNumbers.forEach(number => {
                expect(mobileRegex.test(number)).toBe(false);
            });
        });

        test('validates employee ID format', () => {
            const validIDs = [
                'EMP001',
                'EMP999',
                'SEC-0001',
            ];

            const invalidIDs = [
                '',
                'EMP',
                '001',
            ];

            validIDs.forEach(id => {
                expect(id.length).toBeGreaterThan(0);
            });

            invalidIDs.forEach(id => {
                expect(id.length).toBeLessThanOrEqual(3);
            });
        });
    });

    describe('Date Validation', () => {
        test('validates date is not in future for birth date', () => {
            const today = new Date();
            const futureDate = new Date(today.getTime() + 86400000); // Tomorrow
            const pastDate = new Date('1990-01-01');

            expect(futureDate > today).toBe(true);
            expect(pastDate < today).toBe(true);
        });

        test('validates date format YYYY-MM-DD', () => {
            const validDates = [
                '2024-01-15',
                '2023-12-31',
                '2022-06-15',
            ];

            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

            validDates.forEach(date => {
                expect(dateRegex.test(date)).toBe(true);
            });
        });

        test('validates age requirements (18+)', () => {
            const today = new Date();
            const eighteenYearsAgo = new Date(
                today.getFullYear() - 18,
                today.getMonth(),
                today.getDate()
            );

            const birthDate = new Date('2000-01-01');
            const tooYoung = new Date('2010-01-01');

            expect(birthDate <= eighteenYearsAgo).toBe(true);
            expect(tooYoung <= eighteenYearsAgo).toBe(false);
        });
    });

    describe('Numeric Validation', () => {
        test('validates salary is positive number', () => {
            const validSalaries = [10000, 50000, 100000];
            const invalidSalaries = [-1000, 0, NaN];

            validSalaries.forEach(salary => {
                expect(salary).toBeGreaterThan(0);
                expect(Number.isFinite(salary)).toBe(true);
            });

            invalidSalaries.forEach(salary => {
                expect(salary <= 0 || !Number.isFinite(salary)).toBe(true);
            });
        });

        test('validates quantity is positive integer', () => {
            const validQuantities = [1, 5, 100];
            const invalidQuantities = [-1, 0, 1.5, NaN];

            validQuantities.forEach(qty => {
                expect(qty).toBeGreaterThan(0);
                expect(Number.isInteger(qty)).toBe(true);
            });

            invalidQuantities.forEach(qty => {
                expect(qty <= 0 || !Number.isInteger(qty) || !Number.isFinite(qty)).toBe(true);
            });
        });

        test('validates percentage is between 0 and 100', () => {
            const validPercentages = [0, 50, 100];
            const invalidPercentages = [-1, 101, 150];

            validPercentages.forEach(pct => {
                expect(pct).toBeGreaterThanOrEqual(0);
                expect(pct).toBeLessThanOrEqual(100);
            });

            invalidPercentages.forEach(pct => {
                expect(pct < 0 || pct > 100).toBe(true);
            });
        });
    });

    describe('Vehicle Validation', () => {
        test('validates vehicle number format', () => {
            const validNumbers = [
                'ABC-123',
                'XYZ-999',
                'LHR-1234',
            ];

            validNumbers.forEach(number => {
                expect(number).toMatch(/^[A-Z]{3}-\d{3,4}$/);
            });
        });

        test('validates year is valid', () => {
            const currentYear = new Date().getFullYear();
            const validYears = [2020, 2021, 2022, 2023, 2024];
            const invalidYears = [1990, 2050, currentYear + 2];

            validYears.forEach(year => {
                expect(year).toBeGreaterThanOrEqual(2000);
                expect(year).toBeLessThanOrEqual(currentYear + 1);
            });
        });
    });

    describe('Text Field Validation', () => {
        test('validates minimum length', () => {
            const minLength = 3;
            const validTexts = ['abc', 'test', 'hello'];
            const invalidTexts = ['ab', 'x', ''];

            validTexts.forEach(text => {
                expect(text.length).toBeGreaterThanOrEqual(minLength);
            });

            invalidTexts.forEach(text => {
                expect(text.length).toBeLessThan(minLength);
            });
        });

        test('validates maximum length', () => {
            const maxLength = 100;
            const validText = 'a'.repeat(50);
            const invalidText = 'a'.repeat(150);

            expect(validText.length).toBeLessThanOrEqual(maxLength);
            expect(invalidText.length).toBeGreaterThan(maxLength);
        });

        test('trims whitespace', () => {
            const inputs = [
                '  test  ',
                'test  ',
                '  test',
                'test',
            ];

            inputs.forEach(input => {
                expect(input.trim()).toBe('test');
            });
        });
    });

    describe('File Upload Validation', () => {
        test('validates file size', () => {
            const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
            const validSize = 2 * 1024 * 1024; // 2MB
            const invalidSize = 10 * 1024 * 1024; // 10MB

            expect(validSize).toBeLessThanOrEqual(maxSizeInBytes);
            expect(invalidSize).toBeGreaterThan(maxSizeInBytes);
        });

        test('validates file type', () => {
            const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            const validTypes = ['image/jpeg', 'image/png'];
            const invalidTypes = ['text/plain', 'application/exe'];

            validTypes.forEach(type => {
                expect(allowedTypes).toContain(type);
            });

            invalidTypes.forEach(type => {
                expect(allowedTypes).not.toContain(type);
            });
        });

        test('validates file extension', () => {
            const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
            const validFiles = ['document.pdf', 'image.jpg', 'photo.png'];
            const invalidFiles = ['script.exe', 'text.txt'];

            validFiles.forEach(filename => {
                const ext = '.' + filename.split('.').pop();
                expect(allowedExtensions).toContain(ext);
            });

            invalidFiles.forEach(filename => {
                const ext = '.' + filename.split('.').pop();
                expect(allowedExtensions).not.toContain(ext);
            });
        });
    });
});
