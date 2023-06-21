export enum RemoteEventType {
    Unassigned,
    Imported,
    FailedToImport,
    BundlerMissing,
    LazyLoaded,
};

export enum RemoteLogLevel {
    Information,
    Warning,
    Error,
};

export interface RemoteEventDetails {
    scope: string;
    module?: string;
    modules?: string[];
    url: string;
    detail: string;
}

export type RemoteCustomEvent = CustomEvent & {
    // TODO: Fill this in.
}