import { describe, it, expect, beforeEach, vi } from 'vitest';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
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

vi.mock('@aws-sdk/client-s3');

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
    const jsonData = { name: 'test', value: 42 };
    const mediaData = new Uint8Array([0, 1, 2, 3, 4, 5]);
    const contentType = 'image/jpeg';

    let sendSpy: any;
    beforeEach(() => {
        service = new AWSCMSCrudSvc(awsConfig);
        sendSpy = vi.spyOn(S3Client.prototype, 'send');
    });

    it('should create a JSON object', async () => {
        await service.create(bucket, jsonKey, jsonData);
        expect(sendSpy).toHaveBeenCalledWith(expect.any(PutObjectCommand));
    });

    it('should read a JSON object', async () => {
        const mockStream = createMockStream(JSON.stringify(jsonData));
        const mockResponse = {
            Body: mockStream
        };
        sendSpy.mockResolvedValueOnce(mockResponse);

        const result = await service.read(bucket, jsonKey);
        expect(result).toEqual(jsonData);
    });

    it('should update a JSON object', async () => {
        await service.update(bucket, jsonKey, jsonData);
        expect(sendSpy).toHaveBeenCalledWith(expect.any(PutObjectCommand));
    });

    it('should delete a JSON object', async () => {
        await service.delete(bucket, jsonKey);
        expect(sendSpy).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));
    });

    it('should create a binary media file', async () => {
        await service.createMedia(bucket, mediaKey, mediaData, contentType);
        expect(sendSpy).toHaveBeenCalledWith(expect.any(PutObjectCommand));
    });

    it('should read a binary media file', async () => {
        const mockStream = createMockStream(mediaData);
        const mockResponse = {
            Body: mockStream
        };
        sendSpy.mockResolvedValueOnce(mockResponse);
        const result = await service.readMedia(bucket, mediaKey);
        expect(result).toEqual(mediaData);
    });

    it('should update a binary media file', async () => {
        await service.updateMedia(bucket, mediaKey, mediaData, contentType);
        expect(sendSpy).toHaveBeenCalledWith(expect.any(PutObjectCommand));
    });

    it('should delete a binary media file', async () => {
        await service.deleteMedia(bucket, mediaKey);
        expect(sendSpy).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));
    });
});