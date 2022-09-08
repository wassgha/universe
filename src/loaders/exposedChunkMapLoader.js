

/**
 * Webpack loader which prepares MF map for NextJS pages
 *
 * @type {(this: import("webpack").LoaderContext<{}>, content: string) => string>}
 */
function exposeChunkMapLoader() {
  // const pages = getNextPages(this.rootContext);
  // const pageMap = preparePageMap(pages);

  // const [pagesRoot] = getNextPagesRoot(this.rootContext);
  // this.addContextDependency(pagesRoot);

  // const result = `module.exports = {
  //   default: ${JSON.stringify(pageMap)},
  // };`;


  if(this.compiler.name === 'client') {
    console.log(path.join(compiler.context, '.next/react-loadable-manifest.json'))
  }

  this.callback(null, null);
}

function exposeChunkMap() {
  return {
    './chunk-map': `${__filename}!${__filename}`,
  }
}

module.exports = exposeChunkMapLoader;
module.exports.exposeChunkMap = exposeChunkMap
