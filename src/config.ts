export interface AuthConfig {
    ClientId: string;
    IdentityPoolId: string;
    AppWebDomain: string;
    TokenScopesArray: string[];
    RedirectUriSignIn: string;
    RedirectUriSignOut: string;
    IdentityProvider: string;
    UserPoolId: string;
    AdvancedSecurityDataCollectionFlag: boolean;
}

export interface Config {
    IdentityPoolId: string;
    StageBucket: string;
    StagePrefix: string;
    MetaDataBucket: string;
    MetaDataPrefix: string;
    PublishBucket: string;
    ReleaseType: string;
    AIEnabled: boolean;
    ReadyForPublishPrefix: string;
    ReleaseEventBusName: string;
    ReleaseEventSource: string;
    PreviewURL: string;
    ReleaseURL: string;
    MediaPrefix: string;
    MediaProxy: string;
    MediaConfig: Record<string, string>;
    Region: string;
    AuthConfig: AuthConfig;
    CatalogPrefix: string;
    CatalogImagePrefix: string;
    CatalogEventSource: string;
}


// @ts-ignore
export const config: Config = {
    StageBucket: import.meta.env.VITE_STAGEBUCKET,
    StagePrefix: import.meta.env.VITE_STAGEPREFIX,
    MediaPrefix: "media/",
    MediaProxy: import.meta.env.VITE_MEDIAPROXY,
    MediaConfig: { "image": "images" },
    Region: import.meta.env.VITE_REGION,
    MetaDataBucket: import.meta.env.VITE_METADATABUCKET,
    MetaDataPrefix: import.meta.env.VITE_METADATAPREFIX || "",
    PublishBucket: import.meta.env.VITE_PUBLISHBUCKET,
    ReleaseType: import.meta.env.VITE_RELEASETYPE || "content-changes",
    AIEnabled: import.meta.env.VITE_AIENABLED === "true",
    ReadyForPublishPrefix: import.meta.env.VITE_READYFORPUBLISHPREFIX || "ready-to-publish/",
    ReleaseEventBusName: import.meta.env.VITE_RELEASEEVENTBUSNAME,
    ReleaseEventSource: import.meta.env.VITE_RELEASEEVENTSOURCE || "content.published",
    PreviewURL: import.meta.env.VITE_PREVIEWURL,
    ReleaseURL: import.meta.env.VITE_RELEASEURL,
    CatalogPrefix: import.meta.env.VITE_CATALOGPREFIX || "data/catalog/",
    CatalogImagePrefix: import.meta.env.VITE_CATALOGIMAGEPREFIX || "data/catalog/images/",
    CatalogEventSource: import.meta.env.VITE_CATALOGEVENTSOURCE || "catalog.published",
    AuthConfig: {
        ClientId: import.meta.env.VITE_CLIENTID,
        IdentityPoolId: import.meta.env.VITE_IDENTITYPOOLID,
        AppWebDomain: import.meta.env.VITE_APPWEBDOMAIN,
        TokenScopesArray: ['openid'],
        RedirectUriSignIn: import.meta.env.VITE_REDIRECTURISIGNIN,
        RedirectUriSignOut: import.meta.env.VITE_REDIRECTURISIGNOUT,
        IdentityProvider: '',
        UserPoolId: import.meta.env.VITE_USERPOOLID,
        AdvancedSecurityDataCollectionFlag: false
    }
};
