import type {LoaderContext} from 'webpack';

import path from 'path';


/**
 *
 * Requires `include-defaults.js` with required shared libs
 *
 */
export default function patchDefaultSharedLoader(
  this: LoaderContext<Record<string, unknown>>,
  content: string
) {
// module identifier
  const currentModule = this._module
  // @ts-ignore
  let resourceResolveData
  if(currentModule && currentModule.resourceResolveData && currentModule.resourceResolveData["context"]) {
    resourceResolveData = currentModule.resourceResolveData["context"]
  }
  if(!resourceResolveData) return content

  if(/^['"]use client['"]/.test(content)) {

    console.log({
      //@ts-ignore
      resolveOptions: this._module.resolveOptions,
      resource: this.resourcePath,
      // @ts-ignore
      compiler: resourceResolveData.compiler,
      // @ts-ignore
      issuer: resourceResolveData.issuer,
      // @ts-ignore
      issuerLayer: resourceResolveData.issuerLayer,
      // @ts-ignore
      internal: resourceResolveData.internal,
    })

    if (resourceResolveData.compiler === 'client') {

    } else {

    }
  }
  return content

    // @ts-ignore
  // const resourceResolveData =  currentModule.resourceResolveData.context
  // already has a known issuer
  // if(!resourceResolveData.issuerLayer) return content
  //
  // if (resourceResolveData.compiler === 'client') {
  // console.log(currentModule);
  // return content
  // } else {
  //
  // }
// @ts-ignore
//   if(!resourceResolveData.issuerLayer) {
//     if (resourceResolveData.compiler === 'client') {
//       // @ts-ignore
//       // currentModule.layer = 'sc_server'
//       return content
//
//     }
//   }
  console.log({
    resource: this.resourcePath,
    // @ts-ignore
    compiler: resourceResolveData.compiler,
    // @ts-ignore
    issuer: resourceResolveData.issuer,
    // @ts-ignore
    issuerLayer: resourceResolveData.issuerLayer,
    // @ts-ignore
    internal: resourceResolveData.internal,
  })
  if(resourceResolveData.issuerLayer) {

  // console.log('resourceResolveDataFromBuild', currentModule);
} else {
// @ts-ignore
    currentModule.layer = 'sc_client'
   // const setLayer = (this)=>{
   //  // @ts-ignore
   //  const resourceResolveData =  currentModule.resourceResolveData.context
   //
   //  this._module.resourceResolveData.issuerLayer = 'build'




  // console.log('resourceResolveDataFromExposedModule', currentModule);
  }


  // this.loadModule(
  //   this.resourcePath,
  //   (err, source, sourceMap, module) => {
  //     console.log('loaded module', module);
  //   }
  // );
  // console.log(this._module);
  return content
  if (content.includes('include-defaults')) {
    // If already patched, return
    return content;
  }

  // avoid absolute paths as they break hashing when the root for the project is moved
  // @see https://webpack.js.org/contribute/writing-a-loader/#absolute-paths
const pathIncludeDefaults = path.relative(
  // @ts-ignore

  this.context,
    path.resolve(__dirname, '../include-defaults.js')
  );

  const pathIncludeDefaultsServerComponents = path.relative(
    // @ts-ignore
    this.context,
    path.resolve(__dirname, '../include-defaults-sc.js')
  );

  if(/^['"]use client['"]/.test(content)) {
    return [
      '',
      'if(typeof window === "undefined"){',
      `async function patchShareScope() {
      __webpack_share_scopes__.rsc = {
        // "next/link": ()=>()=>require("next/link"),
       // "next/navigation": ()=>()=>require("next/navigation?shared"),
       //  "next/dist/client/components/hooks-server-context": ()=>()=>require("next/dist/client/components/hooks-server-context"),
        // "react": ()=>()=>require("react"),
      }
      };`,
      'await patchShareScope();',
      '}',
      `require(${JSON.stringify('./' + pathIncludeDefaults)});`,
      content
    ]
  }
  return [
    '',
    'if(typeof window === "undefined"){',
    `async function patchShareScope() {
      __webpack_share_scopes__.rsc = {
        // "next/link": ()=>()=>require("next/link"),
        // "next/navigation": ()=>()=>require("next/navigation?shared"),
        // "next/dist/client/components/hooks-server-context": ()=>()=>require("next/dist/client/components/hooks-server-context"),
      //  "react": ()=>()=>require("react?shared"),
      }
      };`,
    'await patchShareScope();',
    '}',
    `require(${JSON.stringify('./' + pathIncludeDefaultsServerComponents)});`,
    content
  ].join("\n")

}

