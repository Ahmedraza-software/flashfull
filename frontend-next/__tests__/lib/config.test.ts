import { API_BASE_URL } from '@/lib/config';

describe('Configuration', () => {
    describe('API_BASE_URL', () => {
        test('should be defined', () => {
            expect(API_BASE_URL).toBeDefined();
        });

        test('should be a string', () => {
            expect(typeof API_BASE_URL).toBe('string');
        });

        test('should not be empty', () => {
            expect(API_BASE_URL).not.toBe('');
        });

        test('should be a valid URL format', () => {
            // Should start with http:// or https://
            expect(
                API_BASE_URL.startsWith('http://') ||
                API_BASE_URL.startsWith('https://')
            ).toBe(true);
        });
    });
});
