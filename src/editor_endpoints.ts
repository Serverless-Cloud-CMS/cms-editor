export interface CatalogEndPoints {
    SiteLayoutKey: string;
    CatalogPrefix: string;
    Bucket: string;
    Enabled: boolean;
    EventBusName: string,
    EventSource: string,
}

export interface EndPoint {
    Name: string;
    StateName: string;
    Bucket: string;
    Type: string;
    PublishFrom: string;
    AIEnabled: boolean;
    Prefix: string;
    EventBusName: string;
    EventSource: string;
    URL: string;
    Transform: boolean;
    CatalogEndPoints: CatalogEndPoints;
}

export interface Endpoints {
    Preview: EndPoint;
    Release: EndPoint;
}

export const endpoints: Endpoints = {
    Preview: {
        Name: "Preview",
        StateName: "preview",
        Bucket: import.meta.env.VITE_PUBLISHBUCKET,
        Type: "publish", // "notification" or "publish"
        PublishFrom: "Editor", // "Editor" or "Preview" - Some Other EndPoint
        AIEnabled: true,
        Prefix: "stage/", // Prefix for EndPoint NameSpacing
        EventBusName: "Not Used",
        EventSource: "Not Used",
        URL: import.meta.env.VITE_PREVIEWURL,
        Transform: false,
        CatalogEndPoints: {
            SiteLayoutKey: "data/catalog/site-data",
            CatalogPrefix: "data/catalog",
            Bucket: import.meta.env.VITE_PUBLISHBUCKET,
            Enabled: false,
            EventBusName: import.meta.env.VITE_EVENTBUSNAME,
            EventSource: import.meta.env.VITE_CATALOGEVENTSOURCE || "catalog.published"
        }
    },
    Release: {
        Name: "Release",
        StateName: "released",
        Bucket: import.meta.env.VITE_PUBLISHBUCKET,
        Type: "release", // "notification" or "publish"
        PublishFrom: "Preview", // "Editor" or "Preview" - Some Other EndPoint
        AIEnabled: false,
        Prefix: "stage/",
        EventBusName: import.meta.env.VITE_RELEASEEVENTBUSNAME,
        EventSource: import.meta.env.VITE_RELEASEEVENTSOURCE,
        URL: import.meta.env.VITE_RELEASEURL,
        Transform: false, // Transform the content before publishing
        CatalogEndPoints: {
            SiteLayoutKey: "data/catalog/site-data",
            CatalogPrefix: "data/catalog",
            Bucket: import.meta.env.VITE_PUBLISHBUCKET,
            Enabled: false,
            EventBusName: import.meta.env.VITE_EVENTBUSNAME,
            EventSource: import.meta.env.VITE_CATALOGEVENTSOURCE || "catalog.published",
        }
    }
};

