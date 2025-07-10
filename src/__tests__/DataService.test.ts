import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import DataService from '../helpers/DataService';
import { AWSCMSCrudSvc } from '../helpers/AWSCMSCrudSvc';
import { config } from '../config';

// Mock the AWS SDK clients
vi.mock('@aws-sdk/client-cognito-identity', () => {
  return {
    CognitoIdentityClient: vi.fn().mockImplementation(() => ({
      send: vi.fn()
    })),
    GetIdCommand: vi.fn(),
    GetCredentialsForIdentityCommand: vi.fn()
  };
});

vi.mock('../helpers/AWSCMSCrudSvc', () => {
  return {
    AWSCMSCrudSvc: vi.fn().mockImplementation(() => ({
      // Add any methods that might be called on the service
    }))
  };
});

// Mock the config
vi.mock('../config', () => ({
  config: {
    StageBucket: 'test-stage-bucket',
    StagePrefix: 'test-stage-prefix',
    MediaPrefix: 'media/',
    MediaProxy: 'test-media-proxy',
    MediaConfig: { "image": "images" },
    Region: 'us-west-2',
    AuthConfig: {
      ClientId: 'test-client-id',
      IdentityPoolId: 'test-identity-pool-id',
      AppWebDomain: 'test-app-web-domain',
      TokenScopesArray: ['openid'],
      RedirectUriSignIn: 'test-redirect-uri-sign-in',
      RedirectUriSignOut: 'test-redirect-uri-sign-out',
      IdentityProvider: '',
      UserPoolId: 'test-user-pool-id',
      AdvancedSecurityDataCollectionFlag: false
    }
  }
}));

describe('DataService', () => {
  let dataService: DataService;
  const mockToken = 'test-token';
  const mockIdentityId = 'test-identity-id';
  const mockCredentials = {
    AccessKeyId: 'test-access-key-id',
    SecretKey: 'test-secret-key',
    SessionToken: 'test-session-token'
  };

  let sendSpy: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create a spy for the send method
    sendSpy = vi.fn().mockResolvedValue({ 
      IdentityId: mockIdentityId,
      Credentials: mockCredentials
    });

    // Update the mock implementation
    vi.mocked(CognitoIdentityClient).mockImplementation(() => ({
      send: sendSpy
    } as any));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with null service and ready=false', () => {
      dataService = new DataService();
      expect(dataService.isReady()).toBe(false);
    });

    it('should initialize with provided service instance', () => {
      const mockService = new AWSCMSCrudSvc({} as any);
      dataService = new DataService(mockService);
      expect(dataService.isReady()).toBe(false);
    });
  });

  describe('init', () => {
    it('should initialize the AWS service with credentials', async () => {
      dataService = new DataService();
      await dataService.init(mockToken);

      // Verify Cognito client was called
      expect(sendSpy).toHaveBeenCalled();

      // Verify AWSCMSCrudSvc was instantiated
      expect(AWSCMSCrudSvc).toHaveBeenCalled();

      // Verify service is now ready
      expect(dataService.isReady()).toBe(true);
    });

    it('should handle errors during initialization', async () => {
      const errorMessage = 'Authentication failed';
      sendSpy.mockRejectedValueOnce(new Error(errorMessage));

      dataService = new DataService();

      await expect(dataService.init(mockToken)).rejects.toThrow(errorMessage);
      expect(dataService.isReady()).toBe(false);
    });
  });

  describe('getService', () => {
    it('should return the service instance when ready', async () => {
      const mockService = new AWSCMSCrudSvc({} as any);
      dataService = new DataService(mockService);

      // Manually set ready to true for this test
      await dataService.init(mockToken);

      const service = dataService.getService();
      expect(service).toBeDefined();
    });

    it('should throw an error when service is not initialized', () => {
      dataService = new DataService();

      expect(() => dataService.getService()).toThrow('Service not initialized. Call init() first.');
    });

    it('should throw an error when service is not ready', () => {
      // Create a service but don't initialize it
      const mockService = new AWSCMSCrudSvc({} as any);
      dataService = new DataService(mockService);

      expect(() => dataService.getService()).toThrow('Service is not ready yet. Please wait for initialization.');
    });
  });
});
