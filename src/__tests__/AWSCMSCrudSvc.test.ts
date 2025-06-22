import { describe, it, expect, beforeEach, vi } from 'vitest';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { AWSCMSCrudSvc } from './../helpers/AWSCMSCrudSvc';

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

    beforeEach(() => {
        service = new AWSCMSCrudSvc(awsConfig);
    });

    it('should create a JSON object', async () => {
        await service.create(bucket, jsonKey, jsonData);
        expect(S3Client.prototype.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
    });

    it('should read a JSON object', async () => {
        const mockResponse = {
            Body: new Blob([JSON.stringify(jsonData)])
        };
        S3Client.prototype.send.mockResolvedValue(mockResponse);

        const result = await service.read(bucket, jsonKey);
        expect(result).toEqual(jsonData);
    });

    it('should update a JSON object', async () => {
        await service.update(bucket, jsonKey, jsonData);
        expect(S3Client.prototype.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
    });

    it('should delete a JSON object', async () => {
        await service.delete(bucket, jsonKey);
        expect(S3Client.prototype.send).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));
    });

    it('should create a binary media file', async () => {
        await service.createMedia(bucket, mediaKey, mediaData, contentType);
        expect(S3Client.prototype.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
    });

    it('should read a binary media file', async () => {
        const mockResponse = {
            Body: new Blob([mediaData])
        };
        console.log(mockResponse);
        S3Client.prototype.send.mockResolvedValue(mockResponse);
        const result = await service.readMedia(bucket, mediaKey);
        expect(result).toEqual(mediaData);
    });

    it('should update a binary media file', async () => {
        await service.updateMedia(bucket, mediaKey, mediaData, contentType);
        expect(S3Client.prototype.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
    });

    it('should delete a binary media file', async () => {
        await service.deleteMedia(bucket, mediaKey);
        expect(S3Client.prototype.send).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));
    });
});