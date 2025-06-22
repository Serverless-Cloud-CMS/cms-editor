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
    PublishNotificationEndPoint: string;
    PublishBucket: string;
    ReleaseType: string;
    AIEnabled: boolean;
    ReadyForPublishPrefix: string;
    ReleaseEventBusName: string;
    ReleaseEventSource: string;
    PreviewURL: string;
    ReleaseURL: string;
    PublishPrefix: string;
    MediaPrefix: string;
    MediaProxy: string;
    MediaConfig: Record<string, string>;
    Region: string;
    AuthConfig: AuthConfig;
}


// @ts-ignore
export const config: Config = {
    StageBucket: import.meta.env.VITE_STAGEBUCKET,
    StagePrefix: import.meta.env.VITE_STAGEPREFIX,
    MediaPrefix: "media/",
    MediaProxy: import.meta.env.VITE_MEDIAPROXY,
    MediaConfig: { "image": "images" },
    Region: "us-east-1",
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
