/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentType } from "react";

/**
 * Prop object used when using the useDynamicRemote hook.
 * @param url Url to the remote we want to import.
 * @param scope The scope of the remote, usually the name.
 * @param module Which item from the exports collection to return.
 * @param remoteEntryFileName (Optional) The name of the remote entry file. Usually RemoteEntry.js or Remote.js.
 * @param bustRemoteEntryCache (Optional) Disables browser caching by appending a timestamp to the url.
 * @param verbose (Optional) Enable verbose console logging of activity.
 * @param useEvents (Optional) Enable eventing of activity.
*/
export type UseDynamicRemoteProps = {
    url: string,
    scope: string,
    module: string,
    remoteEntryFileName?: string,
    bustRemoteEntryCache?: boolean,
    verbose?: boolean,
    useEvents?: boolean,
};

/**
 * Prop object used when using the useDynamicRemote hook.
 * @param url Url to the remote we want to import.
 * @param scope The scope of the remote, usually the name. Not required to get modules, but useful for logging.
 * @param modules Which items from the exports collection to return.
 * @param remoteEntryFileName (Optional) The name of the remote entry file. Usually RemoteEntry.js or Remote.js.
 * @param verbose (Optional) Enable verbose console logging of activity.
 * @param useEvents (Optional) Enable eventing of activity.
*/
export type UseDynamicModulesProps = {
    url: string,
    scope: string,
    modules: string[],
    remoteEntryFileName?: string,
    verbose?: boolean,
    useEvents?: boolean,
};

/**
 * Prop object used when using the useRemote hook.
 * @param scope The scope of the remote, usually the name.
 * @param module Which item from the exports collection to return.
*/
export type UseRemoteProps = {
    scope: string,
    module: string,
    verbose?: boolean,
    useEvents?: boolean,
};

//** An optional default base type to use when pulling back types from a hook. */
export type RemoteComponent = ComponentType<any>;
