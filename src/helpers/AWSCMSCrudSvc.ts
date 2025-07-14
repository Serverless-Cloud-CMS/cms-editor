import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command, CopyObjectCommand } from "@aws-sdk/client-s3";
import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";
import { ICMSCrudService, ReleaseEventDetail, MetaData } from "./ICMSCrudService";
import { config } from "../config";


interface AWSCredentialsConfig {
    region: string;
    credentials: {
        accessKeyId: string;
        secretAccessKey: string;
        sessionToken?: string;
    }
}

export class AWSCMSCrudSvc implements ICMSCrudService {
    private s3Client: S3Client;
    private eventBridgeClient: EventBridgeClient;

    constructor(config: AWSCredentialsConfig) {
        this.s3Client = new S3Client({
            region: config.region,
            credentials: {
                accessKeyId: config.credentials.accessKeyId,
                secretAccessKey: config.credentials.secretAccessKey,
                sessionToken: config.credentials.sessionToken
            }
        });

        this.eventBridgeClient = new EventBridgeClient({
            region: config.region,
            credentials: {
                accessKeyId: config.credentials.accessKeyId,
                secretAccessKey: config.credentials.secretAccessKey,
                sessionToken: config.credentials.sessionToken
            }
        });
    }


    async create(bucket: string, key: string, data: object): Promise<void> {
        try {
            const params = {
                Bucket: bucket,
                Key: key,
                Body: JSON.stringify(data),
                ContentType: "application/json"
            };
            await this.s3Client.send(new PutObjectCommand(params));
        } catch (error) {
            // @ts-ignore
            const err = error as Error;
            throw new Error(`Failed to create object: ${err.message}`);
        }
    }

    async createHTML(bucket: string, key: string, data: string): Promise<void> {
        try {
            const params = {
                Bucket: bucket,
                Key: key,
                Body: data,
                ContentType: "text/html"
            };
            await this.s3Client.send(new PutObjectCommand(params));
        } catch (error) {
            // @ts-ignore
            const err = error as Error;
            throw new Error(`Failed to create object: ${err.message}`);
        }
    }

    async read(bucket: string, key: string): Promise<object> {
        try {
            const params = {
                Bucket: bucket,
                Key: key
            };
            const command = new GetObjectCommand(params);
            const response = await this.s3Client.send(command);
            console.log(`Here post ${key}`);
            const data = await response.Body.transformToString();
            //const data = await this.streamToString(response.Body);
            console.log(`Loaded post ${data}`);
            return JSON.parse(data);
        } catch (error) {
            const err = error as Error;
            throw new Error(`Failed to read object: ${err.message}`);
        }
    }

    async update(bucket: string, key: string, data: object): Promise<void> {
        try {
            await this.create(bucket, key, data);
        } catch (error) {
            const err = error as Error;
            throw new Error(`Failed to update object: ${err.message}`);
        }
    }

    async delete(bucket: string, key: string): Promise<void> {
        try {
            const params = {
                Bucket: bucket,
                Key: key
            };
            await this.s3Client.send(new DeleteObjectCommand(params));
        } catch (error) {
            const err = error as Error;
            throw new Error(`Failed to delete object: ${err.message}`);
        }
    }

    async createMedia(bucket: string, key: string, data: Uint8Array, contentType: string): Promise<void> {
        try {
            const params = {
                Bucket: bucket,
                Key: key,
                Body: data,
                ContentType: contentType
            };
            await this.s3Client.send(new PutObjectCommand(params));
        } catch (error) {
            const err = error as Error;
            throw new Error(`Failed to create media: ${err.message}`);
        }
    }

    async readMedia(bucket: string, key: string): Promise<Uint8Array> {
        try {
            const params = {
                Bucket: bucket,
                Key: key
            };
            const command = new GetObjectCommand(params);
            const response = await this.s3Client.send(command);
            console.log(response);
            return this.streamToUint8Array(response.Body);
        } catch (error) {
            const err = error as Error;
            throw new Error(`Failed to read media: ${err.message}`);
        }
    }

    async updateMedia(bucket: string, key: string, data: Uint8Array, contentType: string): Promise<void> {
        try {
            await this.createMedia(bucket, key, data, contentType);
        } catch (error) {
            const err = error as Error;
            throw new Error(`Failed to update media: ${err.message}`);
        }
    }

    async deleteMedia(bucket: string, key: string): Promise<void> {
        try {
            await this.delete(bucket, key);
        } catch (error) {
            const err = error as Error;
            throw new Error(`Failed to delete media: ${err.message}`);
        }
    }

    async listMedia(bucket: string, prefix: string): Promise<string[]> {
        try {
            const params = {
                Bucket: bucket,
                Prefix: prefix
            };
            const command = new ListObjectsV2Command(params);
            const response = await this.s3Client.send(command);
            if (!response.Contents) return [];
            return response.Contents.map(obj => obj.Key!).filter(Boolean);
        } catch (error) {
            const err = error as Error;
            throw new Error(`Failed to list media: ${err.message}`);
        }
    }

    /**
     * Generate an image using AWS Bedrock and save it to S3.
     * @param prompt The text prompt for image generation.
     * @param size The image size (e.g., '512x512', '1024x1024').
     * @param bucket S3 bucket to save the image.
     * @param keyPrefix S3 key prefix for the image.
     * @returns The S3 key of the saved image.
     */
    async generateImageWithBedrock(prompt: string, size: string): Promise<string> {
        // TODO: Replace this with actual Bedrock API integration
        // This is a placeholder that simulates an image URL being returned
        // You should implement the call to Bedrock's image generation API here
        // and return the URL or a presigned S3 URL to the generated image
        throw new Error('generateImageWithBedrock is not implemented.');
    }

    async uploadImageBlob(bucket: string, key: string, blob: Blob): Promise<void> {
        try {
            const arrayBuffer = await blob.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            const params = {
                Bucket: bucket,
                Key: key,
                Body: uint8Array,
                ContentType: blob.type || 'image/png',
            };
            let res = await this.s3Client.send(new PutObjectCommand(params));
        } catch (error) {
            const err = error as Error;
            throw new Error(`Failed to upload image blob: ${err.message}`);
        }
    }

    private async streamToString(stream: any): Promise<string> {
        const blob = new Blob([stream]);
        const response = new Response(blob);
        return response.text();
    }

    private async streamToUint8Array(stream: any): Promise<Uint8Array> {
        console.log(stream)
        const blob = new Blob([stream]);
        const response = new Response(blob);
        const buffer = await response.arrayBuffer();
        return new Uint8Array(buffer);
    }

    /**
     * Retrieves meta-data for a post from the Workflow Service app
     * @param postId The ID of the post
     * @returns The meta-data for the post
     */
    async getMetaData(postId: string): Promise<MetaData> {
        try {
            const key = `${config.MetaDataPrefix}${postId}`;
            const params = {
                Bucket: config.MetaDataBucket,
                Key: key
            };
            const command = new GetObjectCommand(params);
            const response = await this.s3Client.send(command);
            const data = await response.Body.transformToString();
            return JSON.parse(data) as MetaData;
        } catch (error) {
            const err = error as Error;
            throw new Error(`Failed to get meta-data: ${err.message}`);
        }
    }

    /**
     * Sends a release event to the Event Bus
     * @param eventDetail The details of the release event
     */
    async sendReleaseEvent(eventDetail: ReleaseEventDetail): Promise<void> {
        try {
            const params = {
                Entries: [
                    {
                        Source: config.ReleaseEventSource,
                        DetailType: config.ReleaseType,
                        Detail: JSON.stringify(eventDetail),
                        EventBusName: config.ReleaseEventBusName
                    }
                ]
            };
            await this.eventBridgeClient.send(new PutEventsCommand(params));
        } catch (error) {
            const err = error as Error;
            throw new Error(`Failed to send release event: ${err.message}`);
        }
    }

    /**
     * Polls for meta-data for a post with retries
     * @param postId The ID of the post
     * @param maxRetries The maximum number of retries (default: 12)
     * @param retryDelay The delay between retries in milliseconds (default: 5000)
     * @returns The meta-data for the post
     */
    async pollForMetaData(postId: string, maxRetries: number = 12, retryDelay: number = 5000): Promise<MetaData> {
        let retries = 0;
        while (retries < maxRetries) {
            try {
                console.log(`Polling for meta-data for post ${postId}...`);
                const metaData = await this.getMetaData(postId);
                return metaData;
            } catch (error) {
                retries++;
                if (retries >= maxRetries) {
                    throw new Error(`Failed to get meta-data after ${maxRetries} retries`);
                }
                // Wait for retryDelay milliseconds before trying again
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
        throw new Error(`Failed to get meta-data after ${maxRetries} retries`);
    }

    /**
     * Copies an object from a source bucket/key to a destination bucket/key
     * @param sourceBucket The source S3 bucket
     * @param sourceKey The source S3 key
     * @param destinationBucket The destination S3 bucket
     * @param destinationKey The destination S3 key
     */
    async copyObject(sourceBucket: string, sourceKey: string, destinationBucket: string, destinationKey: string): Promise<void> {
        try {
            const params = {
                Bucket: destinationBucket,
                CopySource: `${sourceBucket}/${sourceKey}`,
                Key: destinationKey
            };
            await this.s3Client.send(new CopyObjectCommand(params));
        } catch (error) {
            // @ts-ignore
            const err = error as Error;
            throw new Error(`Failed to copy object: ${err.message}`);
        }
    }
}
