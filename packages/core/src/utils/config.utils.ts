/**
 * Merges per-request debug options with global defaults.
 */
export function mergeOptions<T extends object>(base: T, overrides?: Partial<T>): Required<T> {
  return {
    ...base,
    ...overrides,
  } as Required<T>;
}
