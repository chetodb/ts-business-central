import type { BcGetOptions } from '../types/options.types.js';

/**
 * Converts a key-value criteria object into an OData key string.
 *
 * @example
 * formatODataKeys({ Item_No: 'ABC', Code: 'XYZ' })
 * // => "Item_No='ABC',Code='XYZ'"
 */
export function formatODataKeys(criteria: unknown): string {
  if (criteria === null || criteria === undefined) return '';

  return Object.entries(criteria as Record<string, unknown>)
    .map(([key, value]) => {
      const formattedValue = typeof value === 'string' ? `'${value}'` : String(value);
      return `${key}=${formattedValue}`;
    })
    .join(',');
}

/**
 * Converts `BcGetOptions` into an OData query string.
 * Starts with `?` if options are present.
 *
 * @example
 * formatODataQueryOptions({ filter: "Name eq 'Test'", top: 10 })
 * // => "?$filter=Name eq 'Test'&$top=10"
 */
export function formatODataQueryOptions(queryOptions?: BcGetOptions): string {
  if (!queryOptions) return '';

  const params = new URLSearchParams();

  if (queryOptions.filter) {
    const filterStr =
      typeof queryOptions.filter === 'string'
        ? queryOptions.filter
        : queryOptions.filter.toString();
    params.append('$filter', filterStr);
  }

  if (queryOptions.select && queryOptions.select.length > 0) {
    params.append('$select', queryOptions.select.join(','));
  }

  if (queryOptions.expand && queryOptions.expand.length > 0) {
    params.append('$expand', queryOptions.expand.join(','));
  }

  if (queryOptions.top !== undefined) {
    params.append('$top', queryOptions.top.toString());
  }

  if (queryOptions.skip !== undefined) {
    params.append('$skip', queryOptions.skip.toString());
  }

  if (queryOptions.orderby) {
    params.append('$orderby', queryOptions.orderby);
  }

  if (queryOptions.count) {
    params.append('$count', 'true');
  }

  if (queryOptions.schemaversion) {
    params.append('$schemaversion', queryOptions.schemaversion);
  }

  const queryString = params.toString().replace(/%24/g, '$');
  return queryString ? `?${queryString}` : '';
}
