/**
 * Standard OData response envelope from Business Central.
 */
export interface BcGetResponse<T = unknown> {
  '@odata.context': string;
  value: T[];
  '@odata.nextLink'?: string;
  '@odata.count'?: number;
}
