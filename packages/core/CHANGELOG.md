# @chetodb/business-central

## 0.3.0

### Minor Changes

- feat(core): auto-chunk large in() filters in get() to avoid URL limits

  `BusinessCentralClient.get()` now transparently detects when a `BcFilter.in()` condition would produce a URL longer than 7 500 characters, splits the values into chunks of 50, fires the requests in parallel, and merges all results into a single array. No API changes — existing `get()` calls with `BcFilter` filters gain this behavior automatically.

## 0.2.0

### Minor Changes

- Fix token refresh race condition and TTL guard, expand NestJS re-exports, remove unused HttpRequestConfig, add .in() empty array warning, improve CI/CD pipeline.

## 0.1.2

### Patch Changes

- 0ba6eb5: fix: resolve nodenext types resolution in exports (Issue #12)

## 0.1.1

### Patch Changes

- 34de895: Refactored NestJS module to use native class-based Dependency Injection (BusinessCentralClient) instead of string tokens.
  Improved Vite/Vitest workspace test resolution.

## 0.1.0

### Minor Changes

- ca2b98e: Primera versión beta del cliente SDK para Microsoft Dynamics 365 Business Central.
