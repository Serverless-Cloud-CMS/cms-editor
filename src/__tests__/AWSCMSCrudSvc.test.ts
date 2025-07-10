import {describe, it, expect, beforeEach, vi, afterEach} from 'vitest';
import { mockClient } from "aws-sdk-client-mock";
import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { AWSCMSCrudSvc } from "../helpers/AWSCMSCrudSvc";
// Helper to create a mock ReadableStream for both Node and browser
type MockStream = ReadableStream<Uint8Array> | { [Symbol.asyncIterator](): AsyncIterator<Uint8Array> };
function createMockStream(data: string | Uint8Array): MockStream {
    if (typeof ReadableStream !== 'undefined') {
        // Browser or polyfilled
        return new ReadableStream<Uint8Array>({
            start(controller) {
                controller.enqueue(typeof data === 'string' ? new TextEncoder().encode(data) : data);
                controller.close();
            }
        });
    } else {
        // Node.js fallback: use async iterator with Uint8Array only
        return {
            async *[Symbol.asyncIterator]() {
                yield typeof data === 'string' ? new TextEncoder().encode(data) : data;
            }
        };
    }
}



// Mock browser APIs
const mockArrayBuffer = vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4, 5]).buffer);

const MockBlob = vi.fn().mockImplementation((parts, options) => ({
    type: options?.type || 'application/octet-stream',
    arrayBuffer: mockArrayBuffer,
}));
//

// Setup global mocks
vi.stubGlobal('Blob', MockBlob);

describe('AWSCMSCrudSvc', () => {
    let service: AWSCMSCrudSvc;
    const awsConfig = {
        region: 'us-west-2',
        credentials: {
            accessKeyId: 'test-access-key-id',
            secretAccessKey: 'test-secret-access-key',
            sessionToken: 'test-session-token' // Optional
        }
    };
    const bucket = 'test-bucket';
    const jsonKey = 'test.json';
    const mediaKey = 'test.jpg';
    const htmlKey = 'test.html';
    const jsonData = { name: 'test', value: 42 };
    const htmlData = '<html><body>Test HTML</body></html>';
    const mediaData = new Uint8Array([0, 1, 2, 3, 4, 5]);
    const contentType = 'image/jpeg';
    const prefix = 'images/';

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

   describe('JSON operations', () => {
        it('should create a JSON object', async () => {
            s3Mock.on(PutObjectCommand).resolves({});

            await service.create(bucket, jsonKey, jsonData);

            expect(s3Mock.calls()).toHaveLength(1);
            const call = s3Mock.call(0);
            expect(call.args[0].input).toEqual({
                Bucket: bucket,
                Key: jsonKey,
                Body: JSON.stringify(jsonData),
                ContentType: 'application/json'
            });
        });

        it('should read a JSON object', async () => {
            s3Mock.on(GetObjectCommand).resolves({
                Body: {
                    transformToString: vi.fn().mockResolvedValue(JSON.stringify(jsonData))
                }
            });

            const result = await service.read(bucket, jsonKey);

            expect(result).toEqual(jsonData);
            expect(s3Mock.calls()).toHaveLength(1);
            const call = s3Mock.call(0);
            expect(call.args[0].input).toEqual({
                Bucket: bucket,
                Key: jsonKey
            });
        });

        it('should update a JSON object', async () => {
            s3Mock.on(PutObjectCommand).resolves({});

            await service.update(bucket, jsonKey, jsonData);

            expect(s3Mock.calls()).toHaveLength(1);
            const call = s3Mock.call(0);
            expect(call.args[0].input).toEqual({
                Bucket: bucket,
                Key: jsonKey,
                Body: JSON.stringify(jsonData),
                ContentType: 'application/json'
            });
        });

        it('should delete a JSON object', async () => {
            s3Mock.on(DeleteObjectCommand).resolves({});

            await service.delete(bucket, jsonKey);

            expect(s3Mock.calls()).toHaveLength(1);
            const call = s3Mock.call(0);
            expect(call.args[0].input).toEqual({
                Bucket: bucket,
                Key: jsonKey
            });
        });

        it('should handle errors when creating a JSON object', async () => {
            const errorMessage = 'Test error';
            s3Mock.on(PutObjectCommand).rejects(new Error(errorMessage));

            await expect(service.create(bucket, jsonKey, jsonData))
                .rejects.toThrow(`Failed to create object: ${errorMessage}`);
        });

        it('should handle errors when reading a JSON object', async () => {
            const errorMessage = 'Test error';
            s3Mock.on(GetObjectCommand).rejects(new Error(errorMessage));

            await expect(service.read(bucket, jsonKey))
                .rejects.toThrow(`Failed to read object: ${errorMessage}`);
        });

        it('should handle errors when updating a JSON object', async () => {
            const errorMessage = 'Test error';
            s3Mock.on(PutObjectCommand).rejects(new Error(errorMessage));

            await expect(service.update(bucket, jsonKey, jsonData))
                .rejects.toThrow(`Failed to update object: Failed to create object: ${errorMessage}`);
        });

        it('should handle errors when deleting a JSON object', async () => {
            const errorMessage = 'Test error';
            s3Mock.on(DeleteObjectCommand).rejects(new Error(errorMessage));

            await expect(service.delete(bucket, jsonKey))
                .rejects.toThrow(`Failed to delete object: ${errorMessage}`);
        });
   });

    describe('HTML operations', () => {
        it('should create an HTML object', async () => {
            s3Mock.on(PutObjectCommand).resolves({});

            await service.createHTML(bucket, htmlKey, htmlData);

            expect(s3Mock.calls()).toHaveLength(1);
            const call = s3Mock.call(0);
            expect(call.args[0].input).toEqual({
                Bucket: bucket,
                Key: htmlKey,
                Body: htmlData,
                ContentType: 'text/html'
            });
        });

        it('should handle errors when creating an HTML object', async () => {
            const errorMessage = 'Test error';
            s3Mock.on(PutObjectCommand).rejects(new Error(errorMessage));

            await expect(service.createHTML(bucket, htmlKey, htmlData))
                .rejects.toThrow(`Failed to create object: ${errorMessage}`);
        });
    });

    describe('Media operations', () => {
        it('should create a binary media file', async () => {
            s3Mock.on(PutObjectCommand).resolves({});

            await service.createMedia(bucket, mediaKey, mediaData, contentType);

            expect(s3Mock.calls()).toHaveLength(1);
            const call = s3Mock.call(0);
            expect(call.args[0].input).toEqual({
                Bucket: bucket,
                Key: mediaKey,
                Body: mediaData,
                ContentType: contentType
            });
        });

        it('should read a binary media file', async () => {
            // Mock the streamToUint8Array method to return the expected data
            vi.spyOn(service as any, 'streamToUint8Array').mockResolvedValue(mediaData);

            s3Mock.on(GetObjectCommand).resolves({
                Body: createMockStream(mediaData)
            });

            const result = await service.readMedia(bucket, mediaKey);

            expect(result).toEqual(mediaData);
            expect(s3Mock.calls()).toHaveLength(1);
            const call = s3Mock.call(0);
            expect(call.args[0].input).toEqual({
                Bucket: bucket,
                Key: mediaKey
            });
        });

        it('should update a binary media file', async () => {
            s3Mock.on(PutObjectCommand).resolves({});

            await service.updateMedia(bucket, mediaKey, mediaData, contentType);

            expect(s3Mock.calls()).toHaveLength(1);
            const call = s3Mock.call(0);
            expect(call.args[0].input).toEqual({
                Bucket: bucket,
                Key: mediaKey,
                Body: mediaData,
                ContentType: contentType
            });
        });

        it('should delete a binary media file', async () => {
            s3Mock.on(DeleteObjectCommand).resolves({});

            await service.deleteMedia(bucket, mediaKey);

            expect(s3Mock.calls()).toHaveLength(1);
            const call = s3Mock.call(0);
            expect(call.args[0].input).toEqual({
                Bucket: bucket,
                Key: mediaKey
            });
        });

        it('should list media files', async () => {
            const mockKeys = [`${prefix}file1.jpg`, `${prefix}file2.jpg`];
            s3Mock.on(ListObjectsV2Command).resolves({
                Contents: mockKeys.map(Key => ({ Key }))
            });

            const result = await service.listMedia(bucket, prefix);

            expect(result).toEqual(mockKeys);
            expect(s3Mock.calls()).toHaveLength(1);
            const call = s3Mock.call(0);
            expect(call.args[0].input).toEqual({
                Bucket: bucket,
                Prefix: prefix
            });
        });

        it('should return an empty array when listing media files with no results', async () => {
            s3Mock.on(ListObjectsV2Command).resolves({
                Contents: null
            });

            const result = await service.listMedia(bucket, prefix);

            expect(result).toEqual([]);
        });

        it('should handle errors when creating a media file', async () => {
            const errorMessage = 'Test error';
            s3Mock.on(PutObjectCommand).rejects(new Error(errorMessage));

            await expect(service.createMedia(bucket, mediaKey, mediaData, contentType))
                .rejects.toThrow(`Failed to create media: ${errorMessage}`);
        });

        it('should handle errors when reading a media file', async () => {
            const errorMessage = 'Test error';
            s3Mock.on(GetObjectCommand).rejects(new Error(errorMessage));

            await expect(service.readMedia(bucket, mediaKey))
                .rejects.toThrow(`Failed to read media: ${errorMessage}`);
        });

        it('should handle errors when updating a media file', async () => {
            const errorMessage = 'Test error';
            s3Mock.on(PutObjectCommand).rejects(new Error(errorMessage));

            await expect(service.updateMedia(bucket, mediaKey, mediaData, contentType))
                .rejects.toThrow(`Failed to update media: Failed to create media: ${errorMessage}`);
        });

        it('should handle errors when deleting a media file', async () => {
            const errorMessage = 'Test error';
            s3Mock.on(DeleteObjectCommand).rejects(new Error(errorMessage));

            await expect(service.deleteMedia(bucket, mediaKey))
                .rejects.toThrow(`Failed to delete media: Failed to delete object: ${errorMessage}`);
        });

        it('should handle errors when listing media files', async () => {
            const errorMessage = 'Test error';
            s3Mock.on(ListObjectsV2Command).rejects(new Error(errorMessage));

            await expect(service.listMedia(bucket, prefix))
                .rejects.toThrow(`Failed to list media: ${errorMessage}`);
        });


    });

    describe('AI operations', () => {
        it('should throw not implemented error for generateImageWithBedrock', async () => {
            await expect(service.generateImageWithBedrock('test prompt', '512x512'))
                .rejects.toThrow('generateImageWithBedrock is not implemented.');
        });
    });
});
