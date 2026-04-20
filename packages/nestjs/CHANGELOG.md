# @chetodb/nestjs-business-central

## 0.2.0

### Minor Changes

- Fix token refresh race condition and TTL guard, expand NestJS re-exports, remove unused HttpRequestConfig, add .in() empty array warning, improve CI/CD pipeline.

### Patch Changes

- Updated dependencies
  - @chetodb/business-central@0.2.0

## 0.1.2

### Patch Changes

- Expose a curated subset of the core SDK from the NestJS package entrypoint, including BusinessCentralClient, BcFilter, and common client/query types. This fixes direct imports from @chetodb/nestjs-business-central without re-exporting the full core surface.

## 0.1.1

### Patch Changes

- 0ba6eb5: fix: resolve nodenext types resolution in exports (Issue #12)
- Updated dependencies [0ba6eb5]
  - @chetodb/business-central@0.1.2

## 0.1.0

### Minor Changes

- 34de895: Refactored NestJS module to use native class-based Dependency Injection (BusinessCentralClient) instead of string tokens.
  Improved Vite/Vitest workspace test resolution.

### Patch Changes

- Updated dependencies [34de895]
  - @chetodb/business-central@0.1.1

## 0.0.1

### Patch Changes

- Updated dependencies [ca2b98e]
  - @chetodb/business-central@0.1.0
