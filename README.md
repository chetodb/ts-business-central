# TS Business Central

[![code style: biome](https://img.shields.io/badge/code_style-biome-FFBD2D.svg)](https://biomejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org)

**TypeScript toolkit for Microsoft Dynamics 365 Business Central integration.**

[Español (README.es.md)](./README.es.md)

---

## 🌟 Overview

`ts-business-central` is a professional-grade monorepo containing a suite of libraries designed to make Business Central integrations reliable, type-safe, and easy to maintain.

### 📦 Included Packages

| Package | Version | Description |
| --- | --- | --- |
| [**`@chetodb/business-central`**](./packages/core) | ![NPM](https://img.shields.io/npm/v/@chetodb/business-central?color=blue) | **Core SDK**: Resilience, Key Rotation, and OData CRUD. |
| [**`@chetodb/nestjs-business-central`**](./packages/nestjs) | ![NPM](https://img.shields.io/npm/v/@chetodb/nestjs-business-central?color=green) | **NestJS Module**: Native framework integration. |

---

## 🚀 Getting Started

You can choose to install the standalone Core SDK or the NestJS module depending on your architecture.

### � Option 1: Core SDK (Standalone)

```bash
pnpm add @chetodb/business-central
```

Perfect for vanilla Node.js, Express, or any TypeScript environment.

```ts
import { BusinessCentralClient } from '@chetodb/business-central';

const client = new BusinessCentralClient({
  tenantId: 'your-tenant-id',
  companyName: 'CRONUS',
  azureKeys: [{ name: 'primary', clientId: '...', clientSecret: '...' }]
});

const customers = await client.get('customers', { top: 5 });
```

### 🔌 Option 2: NestJS Module

```bash
pnpm add @chetodb/nestjs-business-central
```

Simply import the `BusinessCentralModule` in your `AppModule` and inject the client natively in your services.

```ts
import { BusinessCentralModule } from '@chetodb/nestjs-business-central';

@Module({
  imports: [
    BusinessCentralModule.forRoot({
      isGlobal: true,
      tenantId: 'your-tenant-id',
      companyName: 'CRONUS',
      azureKeys: [{ name: 'primary', clientId: '...', clientSecret: '...' }]
    }),
  ]
})
export class AppModule {}
```

> 👉 [See full NestJS documentation here](./packages/nestjs/README.md)

---

## 🧪 Development & Monorepo

This project uses `pnpm` workspaces for efficient management.

```bash
# Install all dependencies
pnpm install

# Build all packages
pnpm build

# Run tests across the monorepo
pnpm test
```

---

## 🤝 Contribution & Governance

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

- **License**: [MIT](./LICENSE) © 2026 David Cheto (ChetoDB)
- **Status**: Active development 🏗️
