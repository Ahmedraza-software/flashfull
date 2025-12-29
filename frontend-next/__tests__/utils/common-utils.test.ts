/**
 * Utility Functions Tests
 * Testing common utility functions used across the application
 */

describe('Utility Functions', () => {
    describe('String Utilities', () => {
        test('capitalizes first letter', () => {
            function capitalize(str: string): string {
                if (!str) return '';
                return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
            }

            expect(capitalize('hello')).toBe('Hello');
            expect(capitalize('WORLD')).toBe('World');
            expect(capitalize('')).toBe('');
            expect(capitalize('a')).toBe('A');
        });

        test('converts to title case', () => {
            function toTitleCase(str: string): string {
                return str
                    .toLowerCase()
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
            }

            expect(toTitleCase('hello world')).toBe('Hello World');
            expect(toTitleCase('HELLO WORLD')).toBe('Hello World');
            expect(toTitleCase('hello')).toBe('Hello');
        });

        test('truncates long text', () => {
            function truncate(str: string, maxLength: number): string {
                if (str.length <= maxLength) return str;
                return str.slice(0, maxLength - 3) + '...';
            }

            expect(truncate('Short', 10)).toBe('Short');
            expect(truncate('This is a long text', 10)).toBe('This is...');
            expect(truncate('Exact length!', 13)).toBe('Exact length!');
        });

        test('removes extra whitespace', () => {
            function normalizeWhitespace(str: string): string {
                return str.trim().replace(/\s+/g, ' ');
            }

            expect(normalizeWhitespace('  hello   world  ')).toBe('hello world');
            expect(normalizeWhitespace('hello\n\nworld')).toBe('hello world');
            expect(normalizeWhitespace('   test   ')).toBe('test');
        });

        test('generates initials from name', () => {
            function getInitials(name: string): string {
                return name
                    .split(' ')
                    .filter(Boolean)
                    .map(word => word[0])
                    .join('')
                    .toUpperCase();
            }

            expect(getInitials('John Doe')).toBe('JD');
            expect(getInitials('John')).toBe('J');
            expect(getInitials('John Michael Doe')).toBe('JMD');
            expect(getInitials('  John   Doe  ')).toBe('JD');
        });
    });

    describe('Array Utilities', () => {
        test('removes duplicates from array', () => {
            function unique<T>(arr: T[]): T[] {
                return Array.from(new Set(arr));
            }

            expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
            expect(unique(['a', 'b', 'a'])).toEqual(['a', 'b']);
            expect(unique([])).toEqual([]);
        });

        test('chunks array into smaller arrays', () => {
            function chunk<T>(arr: T[], size: number): T[][] {
                const chunks: T[][] = [];
                for (let i = 0; i < arr.length; i += size) {
                    chunks.push(arr.slice(i, i + size));
                }
                return chunks;
            }

            expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
            expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
            expect(chunk([], 2)).toEqual([]);
        });

        test('groups array by key', () => {
            function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
                return arr.reduce((acc, item) => {
                    const groupKey = String(item[key]);
                    if (!acc[groupKey]) acc[groupKey] = [];
                    acc[groupKey].push(item);
                    return acc;
                }, {} as Record<string, T[]>);
            }

            const data = [
                { name: 'John', dept: 'Security' },
                { name: 'Jane', dept: 'Security' },
                { name: 'Bob', dept: 'Admin' },
            ];

            const grouped = groupBy(data, 'dept');
            expect(grouped['Security']).toHaveLength(2);
            expect(grouped['Admin']).toHaveLength(1);
        });

        test('sorts array by multiple keys', () => {
            const data = [
                { name: 'Bob', age: 30 },
                { name: 'Alice', age: 25 },
                { name: 'Charlie', age: 25 },
            ];

            const sorted = data.sort((a, b) => {
                if (a.age !== b.age) return a.age - b.age;
                return a.name.localeCompare(b.name);
            });

            expect(sorted[0].name).toBe('Alice');
            expect(sorted[1].name).toBe('Charlie');
            expect(sorted[2].name).toBe('Bob');
        });
    });

    describe('Date Utilities', () => {
        test('formats date to YYYY-MM-DD', () => {
            function formatDate(date: Date): string {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }

            const date = new Date('2024-01-15');
            expect(formatDate(date)).toBe('2024-01-15');
        });

        test('calculates age from birth date', () => {
            function calculateAge(birthDate: Date): number {
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                return age;
            }

            const birthDate = new Date('1990-01-01');
            const age = calculateAge(birthDate);
            expect(age).toBeGreaterThan(30);
        });

        test('checks if date is today', () => {
            function isToday(date: Date): boolean {
                const today = new Date();
                return (
                    date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear()
                );
            }

            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            expect(isToday(today)).toBe(true);
            expect(isToday(yesterday)).toBe(false);
        });

        test('adds days to date', () => {
            function addDays(date: Date, days: number): Date {
                const result = new Date(date);
                result.setDate(result.getDate() + days);
                return result;
            }

            const date = new Date('2024-01-15');
            const futureDate = addDays(date, 5);
            expect(futureDate.getDate()).toBe(20);
        });
    });

    describe('Number Utilities', () => {
        test('clamps number between min and max', () => {
            function clamp(value: number, min: number, max: number): number {
                return Math.min(Math.max(value, min), max);
            }

            expect(clamp(5, 0, 10)).toBe(5);
            expect(clamp(-5, 0, 10)).toBe(0);
            expect(clamp(15, 0, 10)).toBe(10);
        });

        test('rounds to decimal places', () => {
            function roundTo(value: number, decimals: number): number {
                const multiplier = Math.pow(10, decimals);
                return Math.round(value * multiplier) / multiplier;
            }

            expect(roundTo(3.14159, 2)).toBe(3.14);
            expect(roundTo(3.14159, 3)).toBe(3.142);
            expect(roundTo(3.5, 0)).toBe(4);
        });

        test('checks if number is in range', () => {
            function inRange(value: number, min: number, max: number): boolean {
                return value >= min && value <= max;
            }

            expect(inRange(5, 0, 10)).toBe(true);
            expect(inRange(0, 0, 10)).toBe(true);
            expect(inRange(10, 0, 10)).toBe(true);
            expect(inRange(-1, 0, 10)).toBe(false);
            expect(inRange(11, 0, 10)).toBe(false);
        });

        test('generates random number in range', () => {
            function randomInRange(min: number, max: number): number {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }

            for (let i = 0; i < 100; i++) {
                const num = randomInRange(1, 10);
                expect(num).toBeGreaterThanOrEqual(1);
                expect(num).toBeLessThanOrEqual(10);
            }
        });
    });

    describe('Object Utilities', () => {
        test('deep clones object', () => {
            function deepClone<T>(obj: T): T {
                return JSON.parse(JSON.stringify(obj));
            }

            const original = { a: 1, b: { c: 2 } };
            const cloned = deepClone(original);

            cloned.b.c = 3;
            expect(original.b.c).toBe(2);
            expect(cloned.b.c).toBe(3);
        });

        test('picks specific keys from object', () => {
            function pick<T extends object, K extends keyof T>(
                obj: T,
                keys: K[]
            ): Pick<T, K> {
                const result = {} as Pick<T, K>;
                keys.forEach(key => {
                    if (key in obj) {
                        result[key] = obj[key];
                    }
                });
                return result;
            }

            const obj = { a: 1, b: 2, c: 3 };
            const picked = pick(obj, ['a', 'c']);

            expect(picked).toEqual({ a: 1, c: 3 });
            expect('b' in picked).toBe(false);
        });

        test('omits specific keys from object', () => {
            function omit<T extends object, K extends keyof T>(
                obj: T,
                keys: K[]
            ): Omit<T, K> {
                const result = { ...obj };
                keys.forEach(key => {
                    delete result[key];
                });
                return result;
            }

            const obj = { a: 1, b: 2, c: 3 };
            const omitted = omit(obj, ['b']);

            expect(omitted).toEqual({ a: 1, c: 3 });
            expect('b' in omitted).toBe(false);
        });
    });

    describe('Validation Utilities', () => {
        test('validates required field', () => {
            function isRequired(value: any): boolean {
                if (value === null || value === undefined) return false;
                if (typeof value === 'string') return value.trim().length > 0;
                return true;
            }

            expect(isRequired('test')).toBe(true);
            expect(isRequired('')).toBe(false);
            expect(isRequired('  ')).toBe(false);
            expect(isRequired(null)).toBe(false);
            expect(isRequired(undefined)).toBe(false);
            expect(isRequired(0)).toBe(true);
        });

        test('validates email', () => {
            function isEmail(email: string): boolean {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            }

            expect(isEmail('test@example.com')).toBe(true);
            expect(isEmail('invalid')).toBe(false);
            expect(isEmail('@example.com')).toBe(false);
            expect(isEmail('test@')).toBe(false);
        });

        test('validates URL', () => {
            function isURL(url: string): boolean {
                try {
                    new URL(url);
                    return true;
                } catch {
                    return false;
                }
            }

            expect(isURL('https://example.com')).toBe(true);
            expect(isURL('http://localhost:3000')).toBe(true);
            expect(isURL('not-a-url')).toBe(false);
            expect(isURL('example.com')).toBe(false);
        });
    });
});
