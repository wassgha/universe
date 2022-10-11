import { UrlNode } from './UrlNode';

const TEST_DYNAMIC_ROUTE = /\/\[[^/]+?\](?=\/|$)/;
export function isDynamicRoute(route: string) {
  return TEST_DYNAMIC_ROUTE.test(route);
}

/**
 * Parses a given parameter from a route to a data structure that can be used
 * to generate the parametrized route. Examples:
 *   - `[...slug]` -> `{ name: 'slug', repeat: true, optional: true }`
 *   - `[foo]` -> `{ name: 'foo', repeat: false, optional: true }`
 *   - `bar` -> `{ name: 'bar', repeat: false, optional: false }`
 */
function parseParameter(param: string) {
  const optional = param.startsWith('[') && param.endsWith(']');
  if (optional) {
    param = param.slice(1, -1);
  }
  const repeat = param.startsWith('...');
  if (repeat) {
    param = param.slice(3);
  }
  return { key: param, repeat, optional };
}

function getParametrizedRoute(route: string) {
  // const segments = removeTrailingSlash(route).slice(1).split('/')
  const segments = route.slice(1).split('/');
  const groups = {};
  let groupIndex = 1;
  return {
    parameterizedRoute: segments
      .map((segment) => {
        if (segment.startsWith('[') && segment.endsWith(']')) {
          const { key, optional, repeat } = parseParameter(
            segment.slice(1, -1)
          );
          groups[key] = { pos: groupIndex++, repeat, optional };
          return repeat ? (optional ? '(?:/(.+?))?' : '/(.+?)') : '/([^/]+?)';
        } else {
          return `/${escapeStringRegexp(segment)}`;
        }
      })
      .join(''),
    groups,
  };
}

export interface Group {
  pos: number;
  repeat: boolean;
  optional: boolean;
}

export interface RouteRegex {
  groups: { [groupName: string]: Group };
  re: RegExp;
}

const memoRouteToRegexp = {} as Record<string, RouteRegex>;

export function getRouteRegex(normalizedRoute: string): RouteRegex {
  if (!memoRouteToRegexp[normalizedRoute]) {
    const { parameterizedRoute, groups } =
      getParametrizedRoute(normalizedRoute);
    memoRouteToRegexp[normalizedRoute] = {
      re: new RegExp(`^${parameterizedRoute}(?:/)?$`),
      groups: groups,
    };
  }
  return memoRouteToRegexp[normalizedRoute];
}

const reHasRegExp = /[|\\{}()[\]^$+*?.-]/;
const reReplaceRegExp = /[|\\{}()[\]^$+*?.-]/g;
function escapeStringRegexp(str: string) {
  // see also: https://github.com/lodash/lodash/blob/2da024c3b4f9947a48517639de7560457cd4ec6c/escapeRegExp.js#L23
  if (reHasRegExp.test(str)) {
    return str.replace(reReplaceRegExp, '\\$&');
  }
  return str;
}

/**
 * Convert browser pathname to NextJs route.
 * This method is required for proper work of Dynamic routes  in NextJS.
 */
export function pathnameToRoute(
  cleanPathname: string,
  routes: string[]
): string | undefined {
  if (routes.includes(cleanPathname)) {
    return cleanPathname;
  }

  for (const route of routes) {
    if (isDynamicRoute(route) && getRouteRegex(route).re.test(cleanPathname)) {
      return route;
    }
  }

  return undefined;
}

/**
 * Sort provided pages in correct nextjs order.
 * This sorting is required if you are using dynamic routes in your apps.
 * If order is incorrect then Nextjs may use dynamicRoute instead of exact page.
 */
export function sortNextPages(pages: string[]): string[] {
  const root = new UrlNode();
  pages.forEach((pageRoute) => root.insert(pageRoute));
  // Smoosh will then sort those sublevels up to the point where you get the correct route definition priority
  return root.smoosh();
}

/**
 * Removes the trailing slash for a given route or page path. Preserves the
 * root page. Examples:
 *   - `/foo/bar/` -> `/foo/bar`
 *   - `/foo/bar` -> `/foo/bar`
 *   - `/` -> `/`
 */
export function removeTrailingSlash(route: string) {
  return route.replace(/\/$/, '') || '/';
}

/**
 * For a given page path, this function ensures that there is no backslash
 * escaping slashes in the path. Example:
 *  - `foo\/bar\/baz` -> `foo/bar/baz`
 */
export function normalizePathSep(path: string): string {
  return path.replace(/\\/g, '/');
}

/**
 * Performs the opposite transformation of `normalizePagePath`. Note that
 * this function is not idempotent either in cases where there are multiple
 * leading `/index` for the page. Examples:
 *  - `/index` -> `/`
 *  - `/index/foo` -> `/foo`
 *  - `/index/index` -> `/index`
 */
export function denormalizePagePath(page: string) {
  let _page = normalizePathSep(page);
  return _page.startsWith('/index/') && !isDynamicRoute(_page)
    ? _page.slice(6)
    : _page !== '/index'
    ? _page
    : '/';
}

export function findRoute(pathname: string, pages: string[]) {
  const cleanPathname = removeTrailingSlash(denormalizePagePath(pathname));

  if (pages.includes(cleanPathname)) {
    return cleanPathname;
  }

  for (const page of pages) {
    if (isDynamicRoute(page) && getRouteRegex(page).re.test(cleanPathname)) {
      return page;
    }
  }

  return undefined;
}
