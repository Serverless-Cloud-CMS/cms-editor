export interface ICMSCrudService {
    create(bucket: string, key: string, data: object): Promise<void>;
    read(bucket: string, key: string): Promise<object>;
    update(bucket: string, key: string, data: object): Promise<void>;
    delete(bucket: string, key: string): Promise<void>;
    createMedia(bucket: string, key: string, data: Uint8Array, contentType: string): Promise<void>;
    readMedia(bucket: string, key: string): Promise<Uint8Array>;
    updateMedia(bucket: string, key: string, data: Uint8Array, contentType: string): Promise<void>;
    deleteMedia(bucket: string, key: string): Promise<void>;
    listMedia(bucket: string, prefix: string): Promise<string[]>;
}