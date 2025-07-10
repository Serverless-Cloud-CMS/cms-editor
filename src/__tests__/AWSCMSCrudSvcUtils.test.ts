import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AWSCMSCrudSvc } from '../helpers/AWSCMSCrudSvc';

// Mock S3Client to avoid actual AWS calls
vi.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: vi.fn().mockImplementation(() => ({
      send: vi.fn()
    })),
    PutObjectCommand: vi.fn(),
    GetObjectCommand: vi.fn(),
    DeleteObjectCommand: vi.fn(),
    ListObjectsV2Command: vi.fn()
  };
});

// Create a test subclass to expose private methods for testing
class TestableAWSCMSCrudSvc extends AWSCMSCrudSvc {
  constructor() {
    super({
      region: 'us-west-2',
      credentials: {
        accessKeyId: 'test-access-key-id',
        secretAccessKey: 'test-secret-access-key'
      }
    });
  }

  // Expose private methods for testing
  public async testStreamToString(stream: any): Promise<string> {
    return this['streamToString'](stream);
  }

  public async testStreamToUint8Array(stream: any): Promise<Uint8Array> {
    return this['streamToUint8Array'](stream);
  }
}

// Mock browser APIs
const mockText = vi.fn().mockResolvedValue('test string');
const mockArrayBuffer = vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4, 5]).buffer);

// Create mock implementations
const MockBlob = vi.fn().mockImplementation((parts, options) => ({
  type: options?.type || 'application/octet-stream'
}));

const MockResponse = vi.fn().mockImplementation(() => ({
  text: mockText,
  arrayBuffer: mockArrayBuffer
}));

// Setup global mocks
vi.stubGlobal('Blob', MockBlob);
vi.stubGlobal('Response', MockResponse);

describe('AWSCMSCrudSvc Utility Methods', () => {
  let service: TestableAWSCMSCrudSvc;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TestableAWSCMSCrudSvc();
  });

  describe('streamToString', () => {
    it('should convert a stream to a string', async () => {
      const testStream = new Uint8Array([116, 101, 115, 116]); // "test" in ASCII
      const result = await service.testStreamToString(testStream);
      expect(result).toBe('test string'); // Using the mocked Response.text() result
    });

    it('should handle empty streams', async () => {
      const testStream = new Uint8Array([]);
      const result = await service.testStreamToString(testStream);
      expect(result).toBe('test string'); // Using the mocked Response.text() result
    });

    it('should handle errors', async () => {
      // Mock Response.text to throw an error
      mockText.mockRejectedValueOnce(new Error('Stream error'));

      const testStream = new Uint8Array([116, 101, 115, 116]);
      await expect(service.testStreamToString(testStream)).rejects.toThrow('Stream error');
    });
  });

  describe('streamToUint8Array', () => {
    it('should convert a stream to a Uint8Array', async () => {
      const testStream = new Uint8Array([116, 101, 115, 116]); // "test" in ASCII
      const result = await service.testStreamToUint8Array(testStream);
      expect(result).toEqual(new Uint8Array([1, 2, 3, 4, 5])); // Using the mocked Response.arrayBuffer() result
    });

    it('should handle empty streams', async () => {
      const testStream = new Uint8Array([]);
      const result = await service.testStreamToUint8Array(testStream);
      expect(result).toEqual(new Uint8Array([1, 2, 3, 4, 5])); // Using the mocked Response.arrayBuffer() result
    });

    it('should handle errors', async () => {
      // Mock Response.arrayBuffer to throw an error
      mockArrayBuffer.mockRejectedValueOnce(new Error('Stream error'));

      const testStream = new Uint8Array([116, 101, 115, 116]);
      await expect(service.testStreamToUint8Array(testStream)).rejects.toThrow('Stream error');
    });
  });
});
