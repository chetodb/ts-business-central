# TS Business Central

[![code style: biome](https://img.shields.io/badge/code_style-biome-FFBD2D.svg)](https://biomejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/@chetodb/business-central.svg)](https://nodejs.org)

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

To install the Core SDK in your project:

```bash
pnpm add @chetodb/business-central
# or
npm install @chetodb/business-central
```

### 🛠 Quick Example

```ts
import { BusinessCentralClient } from '@chetodb/business-central';

const client = new BusinessCentralClient({
  tenantId: 'your-tenant-id',
  companyName: 'CRONUS',
  azureKeys: [{ name: 'primary', clientId: '...', clientSecret: '...' }]
});

const customers = await client.get('customers', { top: 5 });
```

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
