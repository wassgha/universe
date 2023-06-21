import { WebpackRemoteContainer } from "@module-federation/utilities";
import { DefaultRemoteName } from "./constants";
import { checkUrlEnding } from "./url";

/** Just a nicer check for empties and undefined so code below looks prettier */
const stringNullCheck = (str: string | undefined): boolean => {
    return str === undefined || str === '';
}

/** Fully formatted display of the remote:module@url/remoteEntryName */
export const getRemoteNamespace = (scope: string, module: string | string[], url: string, remoteEntryFileName: string | undefined) => {
    const formattedUrl = stringNullCheck(url) ? checkUrlEnding(url) : 'eager-loaded';
    const remoteName = stringNullCheck(remoteEntryFileName) ? DefaultRemoteName : remoteEntryFileName;
    const moduleString = Array.isArray(module) ? module.join(',') : module;
    return `${scope}:${moduleString}@${formattedUrl}/${remoteName}`;
}

/** Check if the remote has already been loaded, saving us a script append. */
export const checkIfRemoteIsLoaded = (scope: string) => {
    const remoteScope = scope as unknown as number;
    const container = (window[remoteScope] as unknown as WebpackRemoteContainer);
    return (container !== undefined);
}