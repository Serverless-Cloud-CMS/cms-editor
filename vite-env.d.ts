/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_IDENTITYPOOLID: string;
    readonly VITE_STAGEBUCKET: string;
    readonly VITE_STAGEPREFIX: string;
    readonly VITE_METADATABUCKET: string;
    readonly VITE_METADATAPREFIX: string;
    readonly VITE_PUBLISHENDPOINT: string;
    readonly VITE_PUBLISHBUCKET: string;
    readonly VITE_EVENTBUSNAME: string;
    readonly VITE_EVENTRELEASESOURCE: string;
    readonly VITE_PREVIEWURL: string;
    readonly VITE_RELEASEURL: string;
    readonly VITE_PREVIEWBUCKET: string;
    readonly VITE_PREVIEWPREFIX: string;
    readonly VITE_MEDIAPROXY: string;
    readonly VITE_CLIENTID: string;
    readonly VITE_APPWEBDOMAIN: string;
    readonly VITE_REDIRECTURISIGNIN: string;
    readonly VITE_REDIRECTURISIGNOUT: string;
    readonly VITE_USERPOOLID: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}