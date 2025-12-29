# Jest Testing Quick Reference

## 🚀 Quick Start

```bash
# Run all tests
npm test

# Watch mode (re-runs on file changes)
npm run test:watch

# Coverage report
npm run test:coverage
```

## 📝 Common Test Patterns

### Basic Component Test
```typescript
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MyComponent from '@/components/MyComponent';

test('renders correctly', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### Testing with User Interactions
```typescript
import { render, screen, fireEvent } from '@testing-library/react';

test('handles click', () => {
  const handleClick = jest.fn();
  render(<button onClick={handleClick}>Click me</button>);
  
  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Async Testing
```typescript
import { render, screen, waitFor } from '@testing-library/react';

test('loads data', async () => {
  render(<MyComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});
```

### API Mocking
```typescript
import { api } from '@/lib/api';

jest.mock('@/lib/api');

test('fetches data', async () => {
  (api.get as jest.Mock).mockResolvedValueOnce({ data: 'test' });
  
  const result = await api.get('/endpoint');
  expect(result.data).toBe('test');
});
```

### Testing Auth Context
```typescript
import { renderWithProviders } from './utils/test-utils';

test('with auth', () => {
  renderWithProviders(<MyComponent />);
  // Component has access to AuthProvider
});
```

## 🧪 Useful Matchers

```typescript
// Basic
expect(value).toBe(expected)           // ===
expect(value).toEqual(expected)        // Deep equality
expect(value).toBeTruthy()             // Truthy
expect(value).toBeFalsy()              // Falsy

// Numbers
expect(value).toBeGreaterThan(n)
expect(value).toBeLessThan(n)
expect(value).toBeCloseTo(n, decimals)

// Strings
expect(string).toMatch(/regex/)
expect(string).toContain('substring')

// Arrays
expect(array).toHaveLength(n)
expect(array).toContain(item)
expect(array).toEqual(expect.arrayContaining([items]))

// Objects
expect(obj).toHaveProperty('key', value)
expect(obj).toMatchObject(subset)

// Functions
expect(fn).toHaveBeenCalled()
expect(fn).toHaveBeenCalledTimes(n)
expect(fn).toHaveBeenCalledWith(args)

// Promises
await expect(promise).resolves.toBe(value)
await expect(promise).rejects.toThrow()

// DOM (jest-dom)
expect(element).toBeInTheDocument()
expect(element).toBeVisible()
expect(element).toHaveTextContent('text')
expect(element).toHaveAttribute('attr', 'value')
expect(element).toHaveClass('className')
```

## 🎯 Test Organization

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup after each test
  });

  describe('Subfeature', () => {
    test('does something', () => {
      // Arrange
      const data = setupTestData();
      
      // Act
      const result = doSomething(data);
      
      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

## 🔧 Mock Utilities

### Mock Functions
```typescript
const mockFn = jest.fn();
const mockFnWithReturn = jest.fn(() => 'value');
const mockFnWithImpl = jest.fn((x) => x * 2);

mockFn.mockReturnValue('value');
mockFn.mockResolvedValue('async value');
mockFn.mockRejectedValue(new Error('error'));
```

### Mock Modules
```typescript
jest.mock('@/lib/api');
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
```

### Mock timers
```typescript
jest.useFakeTimers();
jest.advanceTimersByTime(1000);
jest.runAllTimers();
jest.useRealTimers();
```

## 🐛 Debugging

```typescript
// Print DOM structure
import { screen } from '@testing-library/react';
screen.debug();

// Print specific element
screen.debug(screen.getByTestId('my-element'));

// Get all queries
screen.logTestingPlaygroundURL();
```

## 📊 Coverage

```bash
# Generate coverage report
npm run test:coverage

# View in browser
# Open coverage/lcov-report/index.html
```

## 🎨 Test Data

```typescript
// Use test utilities
import { mockApiResponses } from './utils/test-utils';

test('uses mock data', async () => {
  const employee = mockApiResponses.employees[0];
  // Use in test
});
```

## ✅ Best Practices

1. **Test behavior, not implementation**
2. **Use semantic queries** (getByRole, getByLabelText)
3. **Avoid testing implementation details**
4. **Keep tests simple and focused**
5. **Mock external dependencies**
6. **Clean up after each test**
7. **Use descriptive test names**
8. **Follow AAA pattern** (Arrange, Act, Assert)

## 🚨 Common Mistakes to Avoid

❌ Testing implementation details
❌ Using container.querySelector
❌ Not cleaning up mocks
❌ Not awaiting async operations
❌ Snapshot testing everything
❌ Testing third-party libraries

✅ Test user behavior
✅ Use semantic queries
✅ Clear mocks in beforeEach
✅ Use waitFor for async
✅ Use snapshots sparingly
✅ Focus on your code
