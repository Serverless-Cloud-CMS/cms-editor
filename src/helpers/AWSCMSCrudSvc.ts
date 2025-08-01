import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command, CopyObjectCommand } from "@aws-sdk/client-s3";
import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";
import { ICMSCrudService, ReleaseEventDetail, MetaData } from "./ICMSCrudService";
import { CatalogEntry, CatalogPublishEventDetail } from "./CatalogEntry";
import { config } from "../config";
import { v4 as uuidv4 } from 'uuid';


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
                        DetailType: 'content-changes',
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
    async pollForMetaData(postId: string, maxRetries: number = 12, retryDelay: number = 10000): Promise<MetaData> {
        let retries = 0;
        while (retries < maxRetries) {
            try {
                console.log(`Polling for meta-data for post ${postId}...`);
                // Get S3 object and its LastModified date
                const key = `${config.MetaDataPrefix}${postId}`;
                const params = {
                    Bucket: config.MetaDataBucket,
                    Key: key
                };
                const command = new GetObjectCommand(params);
                const response = await this.s3Client.send(command);
                const data = await response.Body.transformToString();
                const metaData = JSON.parse(data) as MetaData;
                // Use published date from metaData if available, else fallback to S3 LastModified
                let objectDate: Date | null = null;
                if (metaData.published_date) {
                    objectDate = new Date(metaData.published_date);
                } else if (response.LastModified) {
                    objectDate = new Date(response.LastModified);
                }
                if (objectDate) {
                    const now = new Date();
                    const diffMs = now.getTime() - objectDate.getTime();
                    const diffMinutes = diffMs / (1000 * 60);
                    if (diffMinutes > 15) {
                        throw new Error(`Meta-data is stale (older than 15 minutes). Last update: ${objectDate.toISOString()}`);
                    }
                }
                return metaData;
            } catch (error) {
                retries++;
                if (retries >= maxRetries) {
                    throw new Error(`Failed to get meta-data after ${maxRetries} retries: ${error instanceof Error ? error.message : error}`);
                }
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

    /**
     * Creates a new catalog entry
     * @param catalog The catalog entry to create
     */
    async createCatalog(catalog: CatalogEntry): Promise<void> {
        try {
            // Generate a UUID if not provided
            if (!catalog.catalog_id) {
                catalog.catalog_id = uuidv4();
            }
            
            // Set created_at if not provided
            if (!catalog.created_at) {
                catalog.created_at = new Date().toISOString();
            }
            
            // Set published to false by default
            if (catalog.published === undefined) {
                catalog.published = false;
            }
            
            const key = `${config.CatalogPrefix}${catalog.catalog_id}`;
            const params = {
                Bucket: config.StageBucket,
                Key: key,
                Body: JSON.stringify(catalog),
                ContentType: 'application/json'
            };
            
            await this.s3Client.send(new PutObjectCommand(params));
        } catch (error) {
            const err = error as Error;
            throw new Error(`Failed to create catalog: ${err.message}`);
        }
    }

    /**
     * Updates an existing catalog entry
     * @param catalog The catalog entry to update
     */
    async updateCatalog(catalog: CatalogEntry): Promise<void> {
        try {
            // Ensure catalog_id exists
            if (!catalog.catalog_id) {
                throw new Error('Catalog ID is required for update');
            }
            
            const key = `${config.CatalogPrefix}${catalog.catalog_id}`;
            const params = {
                Bucket: config.StageBucket,
                Key: key,
                Body: JSON.stringify(catalog),
                ContentType: 'application/json'
            };
            
            await this.s3Client.send(new PutObjectCommand(params));
        } catch (error) {
            const err = error as Error;
            throw new Error(`Failed to update catalog: ${err.message}`);
        }
    }

    /**
     * Retrieves a catalog entry by ID
     * @param catalogId The ID of the catalog entry
     * @returns The catalog entry
     */
    async getCatalog(catalogId: string): Promise<CatalogEntry> {
        try {
            const key = `${config.CatalogPrefix}${catalogId}`;
            const params = {
                Bucket: config.StageBucket,
                Key: key
            };
            
            const command = new GetObjectCommand(params);
            const response = await this.s3Client.send(command);
            const data = await response.Body.transformToString();
            
            return JSON.parse(data) as CatalogEntry;
        } catch (error) {
            const err = error as Error;
            throw new Error(`Failed to get catalog: ${err.message}`);
        }
    }

    /**
     * Lists all catalog entries
     * @returns An array of catalog entries
     */
    async listCatalogs(): Promise<CatalogEntry[]> {
        try {
            const params = {
                Bucket: config.StageBucket,
                Prefix: config.CatalogPrefix
            };
            
            const command = new ListObjectsV2Command(params);
            const response = await this.s3Client.send(command);
            
            if (!response.Contents || response.Contents.length === 0) {
                return [];
            }
            
            const catalogs: CatalogEntry[] = [];
            
            for (const item of response.Contents) {
               // if (item.Key && item.Key.endsWith('.json')) {
                    const getParams = {
                        Bucket: config.StageBucket,
                        Key: item.Key
                    };
                    
                    const getCommand = new GetObjectCommand(getParams);
                    const getResponse = await this.s3Client.send(getCommand);
                    const data = await getResponse.Body.transformToString();
                    
                    catalogs.push(JSON.parse(data) as CatalogEntry);
              //  }
            }
            
            return catalogs;
        } catch (error) {
            const err = error as Error;
            throw new Error(`Failed to list catalogs: ${err.message}`);
        }
    }

    /**
     * Publishes a catalog entry
     * @param catalog The catalog entry to publish
     */
    async publishCatalog(catalog: CatalogEntry): Promise<void> {
        try {
            // Ensure catalog_id exists
            if (!catalog.catalog_id) {
                throw new Error('Catalog ID is required for publishing');
            }
            
            // Set published to true
            catalog.published = true;
            
            // Update the catalog in the stage bucket
            await this.updateCatalog(catalog);
            
            // Copy the catalog to the publish bucket
            const sourceKey = `${config.CatalogPrefix}${catalog.catalog_id}`;
            const destinationKey = sourceKey;
            
            await this.copyObject(config.StageBucket, sourceKey, config.PublishBucket, destinationKey);
            
            // If there's a catalog image, copy it to the publish bucket as well
            if (catalog.catalog_image_key) {
                await this.copyObject(config.StageBucket, catalog.catalog_image_key, config.PublishBucket, catalog.catalog_image_key);
            }
            
            // Send the catalog publish event
            const eventDetail: CatalogPublishEventDetail = {
                catalog_id: catalog.catalog_id,
                catalog_title: catalog.catalog_title,
                catalog_image_key: catalog.catalog_image_key,
                catalog_description: catalog.catalog_description,
                source: 'site.updates'
            };
            
            await this.sendCatalogPublishEvent(eventDetail);
        } catch (error) {
            const err = error as Error;
            throw new Error(`Failed to publish catalog: ${err.message}`);
        }
    }

    /**
     * Sends a catalog publish event to the Event Bus
     * @param eventDetail The details of the catalog publish event
     */
    async sendCatalogPublishEvent(eventDetail: CatalogPublishEventDetail): Promise<void> {
        try {
            const params = {
                Entries: [
                    {
                        Source: config.CatalogEventSource,
                        DetailType: 'site-updates',
                        Detail: JSON.stringify(eventDetail),
                        EventBusName: config.ReleaseEventBusName
                    }
                ]
            };
            
            await this.eventBridgeClient.send(new PutEventsCommand(params));
        } catch (error) {
            const err = error as Error;
            throw new Error(`Failed to send catalog publish event: ${err.message}`);
        }
    }
}
