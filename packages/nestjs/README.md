# Business Central NestJS Module

> 🚧 **Work In Progress.** This module is currently a stub and is under active development. It is not ready for production use yet. Please check back later.

**Seamless integration module for Microsoft Dynamics 365 Business Central in NestJS applications.**

[Español (README.es.md)](./README.es.md) | [**Return to Monorepo Root**](../../README.md)

---

This package will provide a wrapper over the Core SDK to facilitate dependency injection and centralized configuration in NestJS environments.

### ✨ Planned Features

- 🧩 **Native Integration**: Designed following NestJS module patterns.
- 💉 **Dependency Injection**: Easy access to `BusinessCentralClient` in any service.
- 🔄 **Async Configuration**: Support for `forRootAsync` with ConfigModule.

---

## Local Development

From the monorepo root:

```bash
pnpm --filter @chetodb/nestjs-business-central build
```
