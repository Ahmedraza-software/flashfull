import { api, ApiError } from '@/lib/api';

// Mock fetch
global.fetch = jest.fn();

describe('ApiError', () => {
    test('creates error with correct properties', () => {
        const error = new ApiError('Test error', 404, { detail: 'Not found' });

        expect(error.message).toBe('Test error');
        expect(error.status).toBe(404);
        expect(error.body).toEqual({ detail: 'Not found' });
        expect(error.name).toBe('ApiError');
    });
});

describe('API Client', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    afterEach(() => {
        jest.clearAllTimers();
    });

    describe('GET requests', () => {
        test('makes successful GET request', async () => {
            const mockData = { id: 1, name: 'Test' };
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                text: async () => JSON.stringify(mockData),
            });

            const result = await api.get<typeof mockData>('/api/test');

            expect(result).toEqual(mockData);
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/test'),
                expect.objectContaining({
                    method: 'GET',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                    }),
                })
            );
        });

        test('includes authorization header when token exists', async () => {
            localStorage.setItem('access_token', 'test-token');
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                text: async () => '{}',
            });

            await api.get('/api/test');

            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer test-token',
                    }),
                })
            );
        });

        test('builds query parameters correctly', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                text: async () => '{}',
            });

            await api.get('/api/test', {
                query: {
                    page: 1,
                    limit: 10,
                    search: 'test',
                    active: true,
                },
            });

            const call = (global.fetch as jest.Mock).mock.calls[0][0];
            expect(call).toContain('page=1');
            expect(call).toContain('limit=10');
            expect(call).toContain('search=test');
            expect(call).toContain('active=true');
        });

        test('handles null and undefined query parameters', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                text: async () => '{}',
            });

            await api.get('/api/test', {
                query: {
                    page: 1,
                    empty: null,
                    missing: undefined,
                },
            });

            const call = (global.fetch as jest.Mock).mock.calls[0][0];
            expect(call).toContain('page=1');
            expect(call).not.toContain('empty');
            expect(call).not.toContain('missing');
        });
    });

    describe('POST requests', () => {
        test('makes successful POST request', async () => {
            const requestBody = { name: 'Test', value: 123 };
            const mockResponse = { id: 1, ...requestBody };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                text: async () => JSON.stringify(mockResponse),
            });

            const result = await api.post<typeof mockResponse>('/api/test', requestBody);

            expect(result).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/test'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(requestBody),
                })
            );
        });
    });

    describe('PUT requests', () => {
        test('makes successful PUT request', async () => {
            const requestBody = { name: 'Updated' };
            const mockResponse = { id: 1, ...requestBody };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                text: async () => JSON.stringify(mockResponse),
            });

            const result = await api.put<typeof mockResponse>('/api/test/1', requestBody);

            expect(result).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/test/1'),
                expect.objectContaining({
                    method: 'PUT',
                })
            );
        });
    });

    describe('DELETE requests', () => {
        test('makes successful DELETE request', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                text: async () => '{}',
            });

            await api.del('/api/test/1');

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/test/1'),
                expect.objectContaining({
                    method: 'DELETE',
                })
            );
        });

        test('makes bulk DELETE request with body', async () => {
            const ids = [1, 2, 3];
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                text: async () => '{}',
            });

            await api.deleteBulk('/api/test/bulk', { ids });

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/test/bulk'),
                expect.objectContaining({
                    method: 'DELETE',
                    body: JSON.stringify({ ids }),
                })
            );
        });
    });

    describe('Error handling', () => {
        test('throws ApiError on 404', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 404,
                text: async () => JSON.stringify({ detail: 'Not found' }),
            });

            await expect(api.get('/api/test')).rejects.toThrow(ApiError);
            await expect(api.get('/api/test')).rejects.toThrow('Not found');
        });

        test('throws ApiError on 500', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 500,
                text: async () => JSON.stringify({ detail: 'Internal server error' }),
            });

            await expect(api.get('/api/test')).rejects.toThrow('Internal server error');
        });

        test('handles non-JSON error response', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 400,
                text: async () => 'Bad request',
            });

            await expect(api.get('/api/test')).rejects.toThrow('Bad request');
        });

        test('handles empty error response', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 400,
                text: async () => '',
            });

            await expect(api.get('/api/test')).rejects.toThrow('Request failed (400)');
        });
    });

    describe('Response parsing', () => {
        test('parses JSON response', async () => {
            const data = { message: 'success' };
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                text: async () => JSON.stringify(data),
            });

            const result = await api.get('/api/test');
            expect(result).toEqual(data);
        });

        test('handles empty response', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                text: async () => '',
            });

            const result = await api.get('/api/test');
            expect(result).toBeNull();
        });

        test('handles non-JSON response as string', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                text: async () => 'plain text',
            });

            const result = await api.get<string>('/api/test');
            expect(result).toBe('plain text');
        });
    });

    describe('Timeout and abort', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        test('times out after 15 seconds', async () => {
            (global.fetch as jest.Mock).mockImplementationOnce(
                () => new Promise((resolve) => setTimeout(resolve, 20000))
            );

            const promise = api.get('/api/test');

            jest.advanceTimersByTime(15000);

            await expect(promise).rejects.toThrow();
        });
    });
});
