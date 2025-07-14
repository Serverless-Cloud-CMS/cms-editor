export interface ReleaseEventDetail {
    post_id: string;
    post_key: string;
    post_srcVersion: string;
    post_srcKey: string;
    post_uri: string;
    post_state: string;
    source: string;
}

export interface MetaData {
    postKey: string;
    src: string;
    published_data?: {
        id: string;
        key: string;
    };
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
    preview_event?: ReleaseEventDetail;
    published_event?: ReleaseEventDetail;
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
    sendReleaseEvent(eventDetail: ReleaseEventDetail): Promise<void>;
    pollForMetaData(postId: string, maxRetries?: number, retryDelay?: number): Promise<MetaData>;
}
