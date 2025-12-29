# Frontend Test Suite

This directory contains comprehensive Jest tests for the ERP frontend application.

## 📁 Test Structure

```
__tests__/
├── components/          # Component tests
│   ├── DashboardShell.test.tsx
│   └── NotificationDropdown.test.tsx
├── integration/         # Integration tests
│   └── api-integration.test.ts
├── lib/                 # Library/utility tests
│   ├── api.test.ts
│   ├── auth.test.tsx
│   ├── config.test.ts
│   └── money.test.ts
├── utils/               # Test utilities and mocks
│   └── test-utils.tsx
└── validation/          # Form validation tests
    └── form-validation.test.ts
```

## 🧪 Test Coverage

### Library Tests (`lib/`)
- **api.test.ts**: Complete API client testing
  - All HTTP methods (GET, POST, PUT, DELETE)
  - Query parameter handling
  - Authentication headers
  - Error handling (401, 403, 404, 500)
  - Timeout and abort functionality
  
- **auth.test.tsx**: Authentication context testing
  - User loading and state management
  - Permission checking
  - Superuser logic
  - Logout and refresh functionality
  - Error handling (401, 403, network errors)

- **money.test.ts**: Currency formatting utilities
  - formatRs() with various decimal places
  - formatRsCompact() for integer display
  - Edge cases (NaN, Infinity, negative numbers)

- **config.test.ts**: Configuration validation
  - API base URL validation

### Component Tests (`components/`)
- **DashboardShell.test.tsx**: Main layout component
  - Rendering and layout structure
  - Permission-based menu visibility
  - User authentication flow
  - Navigation functionality

- **NotificationDropdown.test.tsx**: Notification component
  - Rendering and structure
  - Dropdown functionality

### Integration Tests (`integration/`)
- **api-integration.test.ts**: End-to-end API workflows
  - Login flow
  - Employee CRUD operations
  - Attendance management
  - Inventory management
  - Fleet management
  - Payroll operations
  - Error handling scenarios

### Validation Tests (`validation/`)
- **form-validation.test.ts**: Form validation rules
  - Employee form validation
  - Email, CNIC, mobile number formats
  - Date validation and age requirements
  - Numeric validation (salary, quantity, percentage)
  - Vehicle validation
  - Text field constraints
  - File upload validation

## 🚀 Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Generate coverage report
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test -- api.test.ts
```

### Run tests matching pattern
```bash
npm test -- --testNamePattern="Employee"
```

## 📊 Coverage Goals

Current coverage targets:
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

## 🛠 Test Utilities

### Test Utils (`utils/test-utils.tsx`)
Provides helpful utilities for testing:

- **mockApiResponses**: Pre-defined mock data for common API responses
- **mockFetch**: Helper to mock fetch responses
- **mockFetchError**: Helper to mock error responses
- **renderWithProviders**: Custom render with AuthProvider
- **setupLocalStorage**: Mock localStorage implementation
- **mockRouter**: Mock Next.js router
- **mockAuthContext**: Pre-configured auth contexts

### Usage Example:
```typescript
import { renderWithProviders, mockApiResponses } from './utils/test-utils';

test('example', () => {
  renderWithProviders(<MyComponent />);
  // Component will have AuthProvider wrapped
});
```

## 🎯 Best Practices

1. **Test Organization**
   - Group related tests using `describe` blocks
   - Use descriptive test names
   - Follow AAA pattern (Arrange, Act, Assert)

2. **Mocking**
   - Clear mocks in `beforeEach`
   - Mock external dependencies (API, router, etc.)
   - Use `jest.fn()` for function mocks

3. **Async Testing**
   - Use `waitFor` for async operations
   - Always await async assertions
   - Handle promise rejections properly

4. **Coverage**
   - Test happy paths and error cases
   - Test edge cases and boundary conditions
   - Test user interactions

## 📝 Writing New Tests

### Component Test Template:
```typescript
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### API Test Template:
```typescript
import { api } from '@/lib/api';

jest.mock('@/lib/api');

describe('My API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetches data successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    (api.get as jest.Mock).mockResolvedValueOnce(mockData);

    const result = await api.get('/api/endpoint');
    expect(result).toEqual(mockData);
  });
});
```

## 🐛 Debugging Tests

### Run a single test in debug mode:
```bash
node --inspect-brk node_modules/.bin/jest --runInBand specific-test.test.ts
```

### View detailed error output:
```bash
npm test -- --verbose
```

### Update snapshots:
```bash
npm test -- -u
```

## 🔧 Configuration

Tests are configured via:
- `jest.config.js`: Main Jest configuration
- `jest.setup.js`: Global test setup (mocks, polyfills)
- `tsconfig.json`: TypeScript configuration

### Key Configuration Options:
- **testEnvironment**: `jsdom` (for React testing)
- **setupFilesAfterEnv**: Runs before each test file
- **modulePathIgnorePatterns**: Excludes `.next/` and `node_modules/`
- **collectCoverageFrom**: Specifies files for coverage

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Jest-DOM](https://github.com/testing-library/jest-dom)
- [Next.js Testing](https://nextjs.org/docs/app/building-your-application/testing/jest)

## ✅ Pre-commit Checklist

Before committing:
- [ ] All tests pass (`npm test`)
- [ ] Coverage meets targets (`npm run test:coverage`)
- [ ] No console warnings/errors
- [ ] Tests are properly named and organized
- [ ] Mocks are cleaned up
- [ ] Async operations are properly handled

## 🤝 Contributing

When adding new features:
1. Write tests alongside code
2. Ensure all edge cases are covered
3. Update this README if adding new test categories
4. Run full test suite before pushing
5. Maintain or improve coverage percentage
