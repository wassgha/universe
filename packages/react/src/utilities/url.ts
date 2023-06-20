import { DefaultRemoteName } from "./constants";

export const checkUrlEnding = (url: string): string => {
    if (url.endsWith('/')) {
        return url.slice(0, -1);
    }
    return url;
}
export const getRemoteFullUrl = (url: string, remoteEntryFileName?: string) => {
    if (remoteEntryFileName  === undefined) {
        remoteEntryFileName = DefaultRemoteName;
    }
    return `${checkUrlEnding(url)}/${remoteEntryFileName}`;
}