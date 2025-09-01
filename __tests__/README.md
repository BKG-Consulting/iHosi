# Patient Registration System Tests

This test suite ensures the reliability and security of the patient registration system, including data encryption, validation, and error handling.

## 🧪 Test Coverage

### 1. Patient Registration Tests (`patient-registration.test.ts`)
- **Data Validation**: Ensures form data meets schema requirements
- **Data Encryption**: Verifies PHI fields are properly encrypted
- **Data Decryption**: Confirms encrypted data can be retrieved
- **Server Actions**: Tests Next.js server action functionality
- **Error Handling**: Validates graceful error handling
- **Data Integrity**: Ensures data consistency through encryption cycles
- **Performance**: Tests encryption/decryption performance

### 2. Decryption Integration Tests (`decryption-integration.test.ts`)
- **Service Layer**: Tests decryption in patient service functions
- **Data Retrieval**: Verifies PHI data is decrypted when accessed
- **Audit Logging**: Ensures proper audit trail for data access
- **Error Handling**: Tests graceful handling of corrupted data
- **Performance**: Validates decryption performance for large datasets

## 🚀 Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage Report
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm test -- patient-registration.test.ts
npm test -- decryption-integration.test.ts
```

## 📊 Test Categories

### Data Validation Tests
- ✅ Valid patient data acceptance
- ❌ Invalid email format rejection
- ❌ Invalid phone number rejection
- ❌ Missing required fields rejection
- ✅ Valid date of birth acceptance

### Encryption Tests
- ✅ PHI fields encryption (phone, email, address, etc.)
- ✅ Non-PHI fields remain unchanged
- ✅ Null/undefined value handling
- ✅ Valid JSON output for encrypted data
- ✅ Unique IV generation for each encryption

### Decryption Tests
- ✅ Encrypted data decryption back to original values
- ✅ Null/undefined encrypted value handling
- ✅ Corrupted data graceful handling
- ✅ Data integrity preservation

### Server Action Tests
- ✅ Test call handling
- ✅ Data validation before processing
- ✅ Date conversion handling
- ✅ Database operation success/failure

### Error Handling Tests
- ✅ Database connection failures
- ✅ Clerk API failures
- ✅ Encryption failures
- ✅ Graceful error responses

### Performance Tests
- ✅ Large data encryption/decryption (< 100ms)
- ✅ Unique IV generation for security
- ✅ Data integrity through encryption cycles

## 🔒 Security Features Tested

### HIPAA Compliance
- **Data Encryption**: AES-256-GCM encryption for all PHI fields
- **Audit Logging**: Complete audit trail for data access
- **Access Control**: Proper user authentication and authorization
- **Data Integrity**: Verification of encrypted data integrity

### Encryption Standards
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Length**: 256-bit encryption keys
- **IV Generation**: Random 128-bit initialization vectors
- **Authentication**: 128-bit authentication tags

## 🐛 Common Issues & Solutions

### Test Environment Issues
```bash
# If you get module resolution errors
npm install --save-dev @types/jest jest-environment-jsdom

# If you get TypeScript errors
npm install --save-dev @types/node @types/react @types/react-dom
```

### Database Connection Issues
- Tests use mocked database connections
- No actual database required for testing
- All database operations are mocked

### Environment Variable Issues
- Tests automatically set required environment variables
- `PHI_ENCRYPTION_KEY` and `PHI_ENCRYPTION_SALT` are mocked

## 📈 Coverage Goals

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## 🔍 Debugging Tests

### Enable Verbose Logging
```bash
npm test -- --verbose
```

### Run Single Test
```bash
npm test -- --testNamePattern="should encrypt sensitive PHI fields"
```

### Debug Mode
```bash
npm test -- --detectOpenHandles --forceExit
```

## 📝 Adding New Tests

### For New Features
1. Create test file in `__tests__/` directory
2. Follow naming convention: `feature-name.test.ts`
3. Include comprehensive test coverage
4. Add to Jest configuration if needed

### Test Structure
```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something specific', () => {
    // Test implementation
  });

  afterEach(() => {
    // Cleanup
  });
});
```

## 🚨 Critical Test Scenarios

### Must Always Pass
- ✅ Data encryption/decryption integrity
- ✅ PHI field protection
- ✅ Server action error handling
- ✅ Audit logging functionality
- ✅ Data validation rules

### Performance Benchmarks
- ✅ Encryption: < 50ms for 10KB data
- ✅ Decryption: < 50ms for 10KB data
- ✅ Database operations: < 100ms
- ✅ Full patient retrieval: < 200ms

## 🔄 Continuous Integration

### Pre-commit Hooks
```bash
# Run tests before committing
npm run test:coverage

# Ensure all tests pass
npm test
```

### CI/CD Pipeline
- Tests run on every pull request
- Coverage reports generated automatically
- Failed tests block deployment
- Security tests run in isolated environment

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [HIPAA Compliance Guidelines](https://www.hhs.gov/hipaa/index.html)
- [AES Encryption Standards](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197.pdf)
