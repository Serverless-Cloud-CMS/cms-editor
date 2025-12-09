import {endpoints, EndPoint } from './editor_endpoints';

export interface EditorAuthConfig {
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

export interface EditorConfig {
    StageBucket: string;
    StagePrefix: string;
    EditorBucket: string;
    CatalogPrefix: string;
    EditorPrefix: string;
    MetaDataBucket: string;
    MetaDataPrefix: string;
    MediaPrefix: string;
    MediaProxy: string;
    MediaConfig: Record<string, string>;
    Region: string;
    AuthConfig: EditorAuthConfig;
    EndPoints: EndPoint[];
}

export const editor_config: EditorConfig = {
    StageBucket: import.meta.env.VITE_STAGEBUCKET,
    StagePrefix: import.meta.env.VITE_STAGEPREFIX,
    EditorBucket: import.meta.env.VITE_STAGEBUCKET,
    EditorPrefix: "posts/",
    CatalogPrefix: "data/catalog/",
    MetaDataBucket: import.meta.env.VITE_METADATABUCKET,
    MetaDataPrefix: import.meta.env.VITE_METADATAPREFIX,
    MediaPrefix: "media/",
    MediaProxy: import.meta.env.VITE_MEDIAPROXY,
    MediaConfig: { "image": "images" },
    Region: import.meta.env.VITE_REGION,
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
    },
    EndPoints: [endpoints.Preview, endpoints.Release]
};

