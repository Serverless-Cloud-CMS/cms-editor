import { AuthService, authService } from '../helpers/AuthService';
import { describe, test, expect } from 'vitest';

describe('AuthService', () => {
  test('should be a singleton', () => {
    // Cannot directly create new instance due to private constructor
    // This would cause a TypeScript error: 
    // const newService = new AuthService(); // Error: Constructor is private

    // Get instance via getInstance
    const instance1 = AuthService.getInstance();
    const instance2 = AuthService.getInstance();
    
    // Both instances should be the same object
    expect(instance1).toBe(instance2);
    
    // The exported authService should be the same instance
    expect(authService).toBe(instance1);
  });

  test('should have accessible static methods', () => {
    // Test static methods
    expect(typeof AuthService.securelyStoreToken).toBe('function');
    expect(typeof AuthService.retrieveSecureToken).toBe('function');
    expect(typeof AuthService.clearSecureTokens).toBe('function');
  });

  test('should have instance methods that access static methods', () => {
    // Test instance methods
    expect(typeof authService.securelyStoreToken).toBe('function');
    expect(typeof authService.retrieveSecureToken).toBe('function');
    expect(typeof authService.clearSecureTokens).toBe('function');
  });
});