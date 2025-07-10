import {describe, it, expect, beforeEach, vi, afterEach} from 'vitest';
import { mockClient } from "aws-sdk-client-mock";
import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { AWSCMSCrudSvc } from "../helpers/AWSCMSCrudSvc";
// Helper to create a mock ReadableStream for both Node and browser


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

            s3Mock.on(PutObjectCommand).resolves({});

            const blobData = new Blob(['test data'], { type: 'image/png' });

            await service.uploadImageBlob(bucket, mediaKey, blobData);
            expect(s3Mock.calls()).toHaveLength(1);
            const call = s3Mock.call(0);
            expect(call.args[0].input.Bucket).toBe(bucket);
            expect(call.args[0].input.Key).toBe(mediaKey);
            expect(call.args[0].input.ContentType).toBe('image/png');

        });
    });


});
