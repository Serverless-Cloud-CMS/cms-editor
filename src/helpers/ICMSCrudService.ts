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
}