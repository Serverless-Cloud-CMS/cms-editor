import { CatalogEntry, CatalogPublishEventDetail } from './CatalogEntry';
import {EndPoint} from "../editor_endpoints";

export interface ReleaseEventDetail {
    transform: {
        status:string,
        event: string,
        post: {
            key?: string,
            metadata: {
                key?: string
            },
            bucket: string,
            preview_url?:string
            title?: string,
            name: string
        }
    },
    source : string
}

export interface AiImageGeneratedDetails {
    src: string;
    title: string;
    description: string;
    type: string;
    origSrc: string;
    pubSrc: string;
}

export interface MetaData {
    postKey: string;
    src: string;
    published_data?: {
        id: string;
        key: string;
    };
    ai_image_generated?: boolean;
    ai_image_generated_details?: AiImageGeneratedDetails;
    published?: boolean;
    published_date?: string;
    source?: {
        key: string;
    };
    preview?: {
        catalogEntryUri: string;
    };
    released?: boolean;
    release?: {
        catalogEntryUri: string;
        source: string;
    };
}

export interface ICMSCrudService {
    create(bucket: string, key: string, data: object): Promise<void>;
    createHTML(bucket: string, key: string, data: string): Promise<void>;
    read(bucket: string, key: string): Promise<object>;
    update(bucket: string, key: string, data: object): Promise<void>;
    delete(bucket: string, key: string): Promise<void>;
    createMedia(bucket: string, key: string, data: Uint8Array, contentType: string): Promise<void>;
    readMedia(bucket: string, key: string): Promise<Uint8Array>;
    updateMedia(bucket: string, key: string, data: Uint8Array, contentType: string): Promise<void>;
    deleteMedia(bucket: string, key: string): Promise<void>;
    listMedia(bucket: string, prefix: string): Promise<string[]>;
    generateImageWithBedrock(prompt: string, size: string): Promise<string>;
    uploadImageBlob(bucket: string, key: string, blob: Blob): Promise<void>;
    copyObject(sourceBucket: string, sourceKey: string, destinationBucket: string, destinationKey: string): Promise<void>;    // New methods for Version 3
    getMetaData(postId: string): Promise<MetaData>;
    sendEvent(eventDetail: ReleaseEventDetail, endpoint: EndPoint): Promise<void>;
    sendEvent(eventDetail: ReleaseEventDetail, endpoint: EndPoint): Promise<void>;
    pollForMetaData(postId: string, maxRetries?: number, retryDelay?: number): Promise<MetaData>;
    
    // Catalog operations for Version 5
    createCatalog(catalog: CatalogEntry, endpoint?: EndPoint): Promise<void>;
    updateCatalog(catalog: CatalogEntry, endpoint?: EndPoint): Promise<void>;
    getCatalog(catalogId: string): Promise<CatalogEntry>;
    listCatalogs(): Promise<CatalogEntry[]>;
    publishCatalog(catalog: CatalogEntry, endpoint: EndPoint): Promise<void>;
    sendCatalogPublishEvent(eventDetail: CatalogPublishEventDetail, endpoint: EndPoint): Promise<void>;
}
