# Testing Guide - Azure Custom Vision Integration

## ✅ Test Setup Complete

Jest testing framework has been configured for the Azure Custom Vision integration.

## 🧪 Running Tests

### Run All Tests
```bash
npm test
```

### Watch Mode (Re-run on file changes)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## 📁 Test Structure

```
__tests__/
├── azure-vision.test.ts          # Azure Vision integration tests
└── fixtures/
    └── images/
        ├── genuine-seed.jpg      # Test image for genuine seeds
        ├── fake-seed.jpg         # Test image for fake seeds
        └── README.md             # Instructions for test images
```

## 🖼️ Setting Up Test Images

Before running integration tests, add test images to `__tests__/fixtures/images/`:

1. **genuine-seed.jpg** - Image of authentic seed packet
2. **fake-seed.jpg** - Image of counterfeit seed packet

**Requirements:**
- Format: JPEG or PNG
- Size: < 4MB
- Resolution: Minimum 256x256 pixels

## 🔧 Test Configuration

### Jest Config (`jest.config.js`)
- **Preset:** ts-jest (TypeScript support)
- **Test Environment:** Node.js
- **Path Mapping:** `@/*` → `src/*`
- **Timeout:** 10 seconds (for API calls)

### TypeScript Config (`tsconfig.json`)
- Jest types included
- Node types included

## 📊 Test Categories

### 1. Custom Vision Service Tests
- ✅ Service initialization
- ✅ Image classification (buffer)
- ✅ Image classification (URL)
- ✅ Seed variety extraction
- ✅ Error handling

### 2. Fallback Logic Tests
- ✅ Primary method fallback
- ✅ Secondary method fallback
- ✅ Error state handling

### 3. Batch Processing Tests
- ✅ Multiple image classification
- ✅ Result aggregation

### 4. Performance Tests
- ✅ API response time
- ✅ Timeout handling

### 5. Authentication Logic Tests
- ✅ Genuine seed detection
- ✅ Fake seed detection
- ✅ Confidence threshold validation

## 🎯 Running Specific Tests

### Run Single Test File
```bash
npm test azure-vision.test.ts
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="Custom Vision Service"
```

### Run with Verbose Output
```bash
npm test -- --verbose
```

## 🔐 Environment Setup for Tests

Create `.env.test` file for test-specific environment variables:

```bash
# Azure Custom Vision Test Configuration
AZURE_CUSTOM_VISION_PREDICTION_KEY=test_key_here
AZURE_CUSTOM_VISION_ENDPOINT=https://test.cognitiveservices.azure.com
AZURE_CUSTOM_VISION_PROJECT_ID=test_project_id
AZURE_CUSTOM_VISION_ITERATION_NAME=TestIteration
```

**Note:** Tests will skip Azure API calls if credentials are not configured (using mocks instead).

## 📈 Coverage Targets

| Metric | Target | Description |
|--------|--------|-------------|
| Statements | > 80% | Code statement coverage |
| Branches | > 75% | Conditional branch coverage |
| Functions | > 80% | Function coverage |
| Lines | > 80% | Line coverage |

## 🐛 Debugging Tests

### VSCode Debug Configuration

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": [
    "--runInBand",
    "--no-coverage",
    "${file}"
  ],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Debug Single Test
1. Open test file
2. Set breakpoint
3. Press F5 or use Debug menu
4. Select "Jest Debug"

## ⚠️ Important Notes

### Test Isolation
- Each test should be independent
- Clean up resources after tests
- Don't rely on test execution order

### API Rate Limits
- Azure Free tier: 10 TPS
- Tests may fail if rate limit exceeded
- Use mocks for frequent test runs

### Skipped Tests
Tests requiring Azure credentials are automatically skipped if:
- No `.env.test` file exists
- Azure credentials are not configured
- Test images are not present

## 📝 Writing New Tests

### Example Test Structure

```typescript
import { customVisionService } from '@/lib/azure/custom-vision';

describe('My Feature', () => {
  test('should do something', async () => {
    // Arrange
    const input = 'test input';
    
    // Act
    const result = await customVisionService.someMethod(input);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.confidence).toBeGreaterThan(70);
  });
});
```

### Best Practices
1. Use descriptive test names
2. Follow Arrange-Act-Assert pattern
3. Test both success and error cases
4. Mock external dependencies when possible
5. Keep tests fast (< 1 second when possible)

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Azure Custom Vision API Docs](https://docs.microsoft.com/azure/cognitive-services/custom-vision-service/)

## 🆘 Troubleshooting

### Issue: "Cannot find module '@/lib/...'"
**Solution:** Check `tsconfig.json` path mappings

### Issue: "Timeout - Async callback was not invoked"
**Solution:** Increase timeout in test:
```typescript
test('long running test', async () => {
  // ...
}, 15000); // 15 second timeout
```

### Issue: "Azure API errors in tests"
**Solution:** 
1. Verify `.env.test` credentials
2. Check Azure Portal for service status
3. Use mocks for unit tests

---

**Test Framework:** Jest v29+  
**TypeScript Support:** ts-jest  
**Coverage Tool:** Istanbul (built into Jest)
