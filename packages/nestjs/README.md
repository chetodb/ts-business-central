# Business Central NestJS Module

**Seamless integration module for Microsoft Dynamics 365 Business Central in NestJS applications.**

[English](#english) | [Español (README.es.md)](./README.es.md)

---

This package provides a wrapper over the Core SDK to facilitate dependency injection and centralized configuration in NestJS environments.

> **Status**: This package is currently in early scaffolding. The API is subject to change.

### ✨ Key Features

- 🧩 **Native Integration**: Designed following NestJS module patterns.
- 💉 **Dependency Injection**: Easy access to `BusinessCentralClient` in any service.

### 🚀 Installation

```bash
pnpm add @chetodb/nestjs-business-central @chetodb/business-central
```

### 🛠️ Basic Usage (Preview)

```ts
import { Module } from '@nestjs/common';
import { BusinessCentralModule } from '@chetodb/nestjs-business-central';

@Module({
  imports: [
    BusinessCentralModule.forRoot({
      tenantId: 'your-tenant-id',
      companyName: 'CRONUS',
      azureKeys: [
        { name: 'main', clientId: '...', clientSecret: '...' }
      ],
    }),
  ],
})
export class AppModule {}
```

---

## Local Development

From the monorepo root:

```bash
pnpm --filter @chetodb/nestjs-business-central build
```
