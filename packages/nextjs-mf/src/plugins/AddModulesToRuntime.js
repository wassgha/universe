import DelegateModulesPlugin from '@module-federation/utilities/src/plugins/DelegateModulesPlugin';
import { Chunk, Compilation } from 'webpack';

const PLUGIN_NAME = 'AddDependenciesToMainChunkPlugin';

class AddDependenciesToMainChunkPlugin {
  apply(compiler) {
    compiler.options.output.asyncEntrypoints = true;
    compiler.options.output.asyncChunks = true;
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      // Listen to the additionalChunkAssets hook
      compilation.hooks.additionalChunkAssets.tap(PLUGIN_NAME, () => {
        // Find the "main" chunk
        const mainChunk = compilation.namedChunks.get('main');
        // move mainchunk array 0 to end of array
        mainChunk.ids.splice(
          mainChunk.ids.length - 1,
          0,
          mainChunk.ids.splice(0, 1)[0]
        );

        if (!mainChunk) {
          return;
        }

        // Iterate over all chunks in the compilation
        for (const chunk of compilation.chunks) {
          // Skip the "main" chunk itself
          if (chunk === mainChunk || chunk.hasRuntime()) {
            continue;
          }

          if ((chunk.name || chunk.id).includes('react')) {
            compilation.chunkGraph.connectChunkAndEntryModule(chunk, mainChunk);
            // chunk.addParent(mainChunk);
            // compilation.chunkGraph.addParent(mainChunk)
          }
          // chunk.parents.add(mainChunk);

          // Check if the chunk meets the criteria for being added as a dependency
          // For example, you can check the chunk name or other properties
          if (true) {
            // Add the chunk as a dependency of the "main" chunk
            console.log('chunk', mainChunk);
          }
        }
      });
    });
  }
}

/**
 * A webpack plugin that moves specified modules from chunks to runtime chunk.
 * @class AddModulesToRuntimeChunkPlugin
 */
class AddModulesToRuntimeChunkPlugin {
  constructor(options) {
    this.options = { debug: false, ...options };
    this._delegateModules = new Set();
    this._sharedModules = new Set();
    this._eagerModules = new Set();
  }

  getChunkByName(chunks, name) {
    for (const chunk of chunks) {
      if (chunk.name == name) {
        return chunk;
      }
    }
    return undefined;
  }

  //TODO: look at refactoring DelegateModulesPlugin, InvertedContainerPlugin, and AddRuntimeModulePlugin since they all share similar capabilieus
  resolveSharedModules(compilation) {
    // Tap into the 'finish-modules' hook to access the module list after they are all processed
    compilation.hooks.finishModules.tapAsync(
      'ModuleIDFinderPlugin',
      (modules, callback) => {
        const { shared } = this.options;

        if (shared) {
          const shareKey = Object.keys(shared);

          for (const module of modules) {
            if (
              shareKey.some((share) => {
                if (module?.rawRequest === share) {
                  return true;
                } else if (share.endsWith('/')) {
                  return module?.rawRequest?.startsWith(share);
                } else {
                  return false;
                }
              })
            ) {
              this._sharedModules.add(module);
            }
          }
        }
        callback();
      }
    );
  }

  /**
   * Applies the plugin to the webpack compiler.
   * @param {Object} compiler - The webpack compiler instance.
   */
  apply(compiler) {
    // Check if the target is the server
    const isServer = compiler.options.name === 'server';
    const { runtime, container, remotes, shared, eager, applicationName } =
      this.options;

    new DelegateModulesPlugin({
      runtime,
      container,
      remotes,
    }).apply(compiler);

    if (!isServer) {
      new AddDependenciesToMainChunkPlugin().apply(compiler);
    }

    // Tap into compilation hooks
    compiler.hooks.thisCompilation.tap(
      'AddModulesToRuntimeChunkPlugin',
      (compilation) => {
        if (isServer) return;
        this.resolveSharedModules(compilation);
        compilation.hooks.optimizeChunks.tap(
          'AddModulesToRuntimeChunkPlugin',
          (chunks) => {
            const hostRuntime = chunks.find((chunk) => {
              return (chunk.name || chunk.id) === runtime;
            });

            const remoteContainer = chunks.find((chunk) => {
              return (chunk.name || chunk.id) === container;
            });

            const containerModules =
              compilation.chunkGraph.getOrderedChunkModulesIterable(
                remoteContainer
              );
            const providedModules = new Set();

            for (const module of containerModules) {
              if (
                !compilation.chunkGraph.isModuleInChunk(module, hostRuntime)
              ) {
                if (module.type === 'provide-module') {
                  providedModules.add(module._request);
                  // compilation.chunkGraph.
                  // compilation.chunkGraph.connectChunkAndModule(
                  //   hostRuntime,
                  //   module
                  // );
                  // compilation.chunkGraph.disconnectChunkAndModule(
                  //   remoteContainer,
                  //   module
                  // );
                  // continue;
                }
              }
            }

            for (const chunk of chunks) {
              const chunkModules =
                compilation.chunkGraph.getOrderedChunkModulesIterable(chunk);
              for (const module of chunkModules) {
                if (providedModules.has(module.request)) {
                  this._eagerModules.add(chunk);

                  // compilation.chunkGraph.connectChunkAndModule(
                  //   hostRuntime,
                  //   module
                  // );
                  // compilation.chunkGraph.disconnectChunkAndModule(
                  //   chunk,
                  //   module
                  // );

                  console.log(
                    '#',
                    module.request,
                    '\n',
                    module.rawRequest,
                    '#'
                  );
                  // providedModules.add(module);
                }
              }
            }
          }
        );
        // compilation.hooks.afte.tap('AddDependencyChunkPlugin', () => {
        // Create an additional chunk with the specified modules.
        // const additionalChunk = compilation.addChunk(this.options.chunkName);
        //
        // for (const moduleName of this.options.modules) {
        //   const module = compilation.modules.find(
        //     (m) => m.rawRequest === moduleName
        //   );
        //   if (module) {
        //     additionalChunk.addModule(module);
        //     module.addChunk(additionalChunk);
        //   }
        // }

        // Add the additional chunk as a dependency of the specified entry point.
        const entrypoint = compilation.entrypoints.get('main');
        if (entrypoint) {
          this._eagerModules.forEach((chunk) => {
            entrypoint.unshiftChunk(chunk);
          });
        }
        // });

        return;
        // Tap into optimizeChunks hook
        compilation.hooks.optimizeChunks.tap(
          'AddModulesToRuntimeChunkPlugin',
          (chunks) => {
            // Get the runtime chunk and return if it's not found or has no runtime
            const runtimeChunk = this.getChunkByName(chunks, runtime);
            if (!runtimeChunk || !runtimeChunk.hasRuntime()) return;

            // Get the container chunk if specified
            const partialEntry = container
              ? this.getChunkByName(chunks, container)
              : null;

            // Get the shared module names to their imports if specified
            const internalSharedModules = shared
              ? Object.entries(shared).map(
                  ([key, value]) => value.import || key
                )
              : null;

            // Get the modules of the container chunk if specified
            const partialContainerModules = partialEntry
              ? compilation.chunkGraph.getOrderedChunkModulesIterable(
                  partialEntry
                )
              : null;

            const foundChunks = chunks.filter((chunk) => {
              const hasMatch = chunk !== runtimeChunk;
              return (
                hasMatch &&
                applicationName &&
                (chunk.name || chunk.id)?.startsWith(applicationName)
              );
            });

            // Iterate over each chunk
            for (const chunk of foundChunks) {
              const modulesToMove = [];
              const containers = [];
              const modulesIterable =
                compilation.chunkGraph.getOrderedChunkModulesIterable(chunk);
              for (const module of modulesIterable) {
                this.classifyModule(
                  module,
                  internalSharedModules,
                  modulesToMove,
                  containers
                );
              }

              if (partialContainerModules) {
                for (const module of partialContainerModules) {
                  const destinationArray = module.rawRequest
                    ? modulesToMove
                    : containers;
                  destinationArray.push(module);
                }
              }

              const modulesToConnect = [].concat(modulesToMove, containers);

              const { chunkGraph } = compilation;
              const runtimeChunkModules =
                chunkGraph.getOrderedChunkModulesIterable(runtimeChunk);

              for (const module of modulesToConnect) {
                if (!chunkGraph.isModuleInChunk(module, runtimeChunk)) {
                  chunkGraph.connectChunkAndModule(runtimeChunk, module);
                }

                if (eager && modulesToMove.includes(module)) {
                  if (this.options.debug) {
                    console.log(
                      `removing ${module.id || module.identifier()} from ${
                        chunk.name || chunk.id
                      } to ${runtimeChunk.name}`
                    );
                  }
                  chunkGraph.disconnectChunkAndModule(chunk, module);
                }
              }

              for (const module of runtimeChunkModules) {
                if (!chunkGraph.isModuleInChunk(module, chunk)) {
                  if (this._delegateModules.has(module)) {
                    chunkGraph.connectChunkAndModule(chunk, module);
                    if (this.options.debug) {
                      console.log(
                        `adding ${module.rawRequest} to ${chunk.name} from ${runtimeChunk.name} not removing it`
                      );
                    }
                  }
                }
              }
            }
          }
        );
      }
    );
  }

  classifyModule(module, internalSharedModules, modulesToMove) {
    if (
      //TODO: do the same for shared modules, resolve them in the afterFinishModules hook
      internalSharedModules?.some((share) =>
        module?.rawRequest?.includes(share)
      )
    ) {
      modulesToMove.push(module);
    } else if (module?.userRequest?.includes('internal-delegate-hoist')) {
      // TODO: can probably move the whole classification part to afterFinishModules,
      //  track all modules i want to move, then just search the chunks
      modulesToMove.push(module);
    }
  }
}

export default AddModulesToRuntimeChunkPlugin;
