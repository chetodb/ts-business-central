# TS Business Central (Español)

[![code style: biome](https://img.shields.io/badge/code_style-biome-FFBD2D.svg)](https://biomejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org)

**El toolkit de TypeScript para integraciones con Microsoft Dynamics 365 Business Central.**

[English (README.md)](./README.md)

---

## 🌟 Visión General

`ts-business-central` es un monorepo profesional que contiene un conjunto de librerías diseñadas para que las integraciones con Business Central sean fiables, seguras (type-safe) y fáciles de mantener.

### 📦 Paquetes Incluidos

| Paquete | Versión | Descripción |
| --- | --- | --- |
| [**`@chetodb/business-central`**](./packages/core) | ![NPM](https://img.shields.io/npm/v/@chetodb/business-central?color=blue) | **Core SDK**: Resiliencia, Rotación de Claves y CRUD OData. |
| [**`@chetodb/nestjs-business-central`**](./packages/nestjs) | ![NPM](https://img.shields.io/npm/v/@chetodb/nestjs-business-central?color=green) | **Módulo NestJS**: Integración nativa con el framework. |

---

## 🚀 Empezando

Puedes elegir instalar el Core SDK independiente o el módulo nativo de NestJS dependiendo de tu arquitectura.

### � Opción 2: Core SDK (Independiente)

```bash
pnpm add @chetodb/business-central
```

Perfecto para Vanilla Node.js, Express, o cualquier entorno TypeScript.

```ts
import { BusinessCentralClient } from '@chetodb/business-central';

const client = new BusinessCentralClient({
  tenantId: 'tu-tenant-id',
  companyName: 'CRONUS',
  azureKeys: [{ name: 'principal', clientId: '...', clientSecret: '...' }]
});

const customers = await client.get('customers', { top: 5 });
```

### 🔌 Opción 1: Módulo NestJS

```bash
pnpm add @chetodb/nestjs-business-central
```

Simplemente importa el `BusinessCentralModule` en tu `AppModule` e inyecta el cliente nativamente en tus servicios.

```ts
import { BusinessCentralModule } from '@chetodb/nestjs-business-central';

@Module({
  imports: [
    BusinessCentralModule.forRoot({
      isGlobal: true,
      tenantId: 'tu-tenant-id',
      companyName: 'CRONUS',
      azureKeys: [{ name: 'primary', clientId: '...', clientSecret: '...' }]
    }),
  ]
})
export class AppModule {}
```

> 👉 [Ver documentación completa de NestJS aquí](./packages/nestjs/README.es.md)

---

## 🧪 Desarrollo y Monorepo

Este proyecto utiliza workspaces de `pnpm` para una gestión eficiente.

```bash
# Instalar todas las dependencias
pnpm install

# Construir todos los paquetes
pnpm build

# Ejecutar tests en todo el monorepo
pnpm test
```

---

## 🤝 Contribución y Gobernanza

¡Las contribuciones son bienvenidas! Consulta nuestra [Guía de Contribución](./CONTRIBUTING.md) para más detalles sobre nuestro código de conducta y el proceso para enviar pull requests.

- **Licencia**: [MIT](./LICENSE) © 2026 David Cheto (ChetoDB)
- **Estado**: Desarrollo activo 🏗️
