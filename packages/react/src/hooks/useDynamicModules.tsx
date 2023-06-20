import { getModules } from '@module-federation/utilities';
import { useState } from 'react';
import { useEffect } from 'react';
import { UseDynamicModulesProps } from '../types/remote-props';
import { DefaultRemoteName } from '../utilities/constants';
import { getRemoteFullUrl } from '../utilities/url';
import { RemoteEventDetails, RemoteEventType, RemoteLogLevel } from '../types/remote-events';
import { getRemoteNamespace } from '../utilities/federation';
import { emitEvent, logEvent } from '../utilities/logger';

const useDynamicModules = ({
  url,
  scope,
  modules,
  remoteEntryFileName,
  verbose,
  useEvents,
}: UseDynamicModulesProps): Promise<any[] | undefined> => {

  /** Checks the values passed through props, and validate/set them if not set */
  const setDefaults = () => {
    if (!remoteEntryFileName) {
        remoteEntryFileName = DefaultRemoteName;
    }
    if (!verbose) {
        verbose = false;
    }
    if (!useEvents) {
        useEvents = false;
    }
};
/**
     * Executes the hook after some basic validation.
    */
  const execute = (): Promise<any[] | undefined> => {
    // Define event details for reuse in the logger and error boundaries
    const remoteFullName = getRemoteNamespace(scope, modules, url, remoteEntryFileName);
    const eventDetails = { scope, modules, url, detail: remoteFullName } as RemoteEventDetails;

    const request = {
      remoteContainer: getRemoteFullUrl(url, remoteEntryFileName),
      modulePaths: modules,
    };
    return getModules(request)
      .then((modules) => {
        // Everything worked out fine, log and pass the remote back
        useEvents && emitEvent(RemoteEventType.Imported, eventDetails);
        verbose && logEvent(RemoteLogLevel.Information, `Imported dynamic module: ${remoteFullName}`);
        return modules;
      })
      .catch((error) => {
        // Things did not work out fine, log and pass up the error.
        useEvents && emitEvent(RemoteEventType.FailedToImport, eventDetails);
        verbose && logEvent(RemoteLogLevel.Error, `Error importing dynamic module: ${remoteFullName}`, error);
        
        // Return the result
        if (!useEvents) {
            throw error;
        }
        
        return [];
      });
  }
      
    // Set the defaults
    setDefaults();

    // Execute the import logic
    return execute();
};

export default useDynamicModules;
