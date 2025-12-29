import { formatRs, formatRsCompact } from '@/lib/money';

describe('Money Formatting', () => {
    describe('formatRs', () => {
        test('formats positive numbers with default decimals', () => {
            expect(formatRs(100)).toBe('Rs 100.00');
            expect(formatRs(1234.56)).toBe('Rs 1234.56');
            expect(formatRs(0.99)).toBe('Rs 0.99');
        });

        test('formats with custom decimal places', () => {
            expect(formatRs(100, 0)).toBe('Rs 100');
            expect(formatRs(100, 1)).toBe('Rs 100.0');
            expect(formatRs(100.456, 3)).toBe('Rs 100.456');
        });

        test('formats negative numbers', () => {
            expect(formatRs(-100)).toBe('Rs -100.00');
            expect(formatRs(-1234.56, 2)).toBe('Rs -1234.56');
        });

        test('formats zero', () => {
            expect(formatRs(0)).toBe('Rs 0.00');
            expect(formatRs(0, 0)).toBe('Rs 0');
        });

        test('handles very large numbers', () => {
            expect(formatRs(1000000)).toBe('Rs 1000000.00');
            expect(formatRs(9999999.99)).toBe('Rs 9999999.99');
        });

        test('handles very small decimals', () => {
            expect(formatRs(0.01)).toBe('Rs 0.01');
            expect(formatRs(0.001, 3)).toBe('Rs 0.001');
        });

        test('rounds correctly', () => {
            expect(formatRs(100.456, 2)).toBe('Rs 100.46');
            expect(formatRs(100.454, 2)).toBe('Rs 100.45');
        });

        test('handles invalid inputs gracefully', () => {
            expect(formatRs(NaN)).toBe('Rs 0.00');
            expect(formatRs(Infinity)).toBe('Rs 0.00');
            expect(formatRs(-Infinity)).toBe('Rs 0.00');
        });
    });

    describe('formatRsCompact', () => {
        test('formats positive numbers without decimals', () => {
            expect(formatRsCompact(100)).toBe('Rs 100');
            expect(formatRsCompact(1234.56)).toBe('Rs 1235');
            expect(formatRsCompact(0.99)).toBe('Rs 1');
        });

        test('rounds to nearest integer', () => {
            expect(formatRsCompact(100.4)).toBe('Rs 100');
            expect(formatRsCompact(100.5)).toBe('Rs 101');
            expect(formatRsCompact(100.6)).toBe('Rs 101');
        });

        test('formats negative numbers', () => {
            expect(formatRsCompact(-100)).toBe('Rs -100');
            expect(formatRsCompact(-1234.56)).toBe('Rs -1235');
        });

        test('formats zero', () => {
            expect(formatRsCompact(0)).toBe('Rs 0');
        });

        test('handles very large numbers', () => {
            expect(formatRsCompact(1000000)).toBe('Rs 1000000');
            expect(formatRsCompact(9999999.99)).toBe('Rs 10000000');
        });

        test('handles invalid inputs gracefully', () => {
            expect(formatRsCompact(NaN)).toBe('Rs 0');
            expect(formatRsCompact(Infinity)).toBe('Rs 0');
            expect(formatRsCompact(-Infinity)).toBe('Rs 0');
        });
    });

    describe('Consistency tests', () => {
        test('both functions handle zero consistently', () => {
            expect(formatRs(0, 0)).toBe('Rs 0');
            expect(formatRsCompact(0)).toBe('Rs 0');
        });

        test('both functions use Rs prefix', () => {
            expect(formatRs(100)).toContain('Rs ');
            expect(formatRsCompact(100)).toContain('Rs ');
        });

        test('both functions handle invalid inputs as zero', () => {
            expect(formatRs(NaN)).toContain('0');
            expect(formatRsCompact(NaN)).toContain('0');
        });
    });
});
