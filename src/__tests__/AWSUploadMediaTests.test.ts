import {describe, it, expect, beforeEach, vi, afterEach} from 'vitest';
import { mockClient } from "aws-sdk-client-mock";
import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { AWSCMSCrudSvc } from "../helpers/AWSCMSCrudSvc";

// Mock Blob and arrayBuffer implementation
class MockBlob {
  data: Uint8Array;
  type: string;

  constructor(data: string[], options?: any) {
    this.data = new TextEncoder().encode(data.join(''));
    this.type = options?.type || 'application/octet-stream';
  }

  async arrayBuffer(): Promise<ArrayBuffer | SharedArrayBuffer> {
    return this.data.buffer;
  }
}

// Replace global Blob with our mock in tests
// @ts-ignore - Override global Blob
global.Blob = MockBlob;

describe('AWSCMSCrudSvc', () => {
    let service: AWSCMSCrudSvc;

    const bucket = 'test-bucket';
    const mediaKey = 'test.jpg';
    const awsConfig = {
        region: 'us-west-2',
        credentials: {
            accessKeyId: 'test-access-key-id',
            secretAccessKey: 'test-secret-access-key',
            sessionToken: 'test-session-token' // Optional
        }
    };
    let s3Mock: any;

    beforeEach(() => {
        vi.clearAllMocks();
        s3Mock = mockClient(S3Client);
        service = new AWSCMSCrudSvc(awsConfig);
    });

    afterEach(() => {
        vi.resetAllMocks();
        s3Mock.reset();
    });

    describe('Media operations', () => {
        it('should upload an image blob', async () => {
            // Setup mock for S3 client
            s3Mock.on(PutObjectCommand).resolves({});

            // Create a mock blob
            const blobData = new MockBlob(['test data'], { type: 'image/png' });

            // Call the method under test
            await service.uploadImageBlob(bucket, mediaKey, blobData as unknown as Blob);
            
            // Verify S3 client was called with correct parameters
            expect(s3Mock.calls()).toHaveLength(1);
            const call = s3Mock.call(0);
            expect(call.args[0].input.Bucket).toBe(bucket);
            expect(call.args[0].input.Key).toBe(mediaKey);
            expect(call.args[0].input.ContentType).toBe('image/png');
        });
    });
});
